"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PokemonImage from "./PokemonImage";
import StatBar from "./StatBar";
import { PokemonDetail } from "@/types";
import { TYPE_COLORS, BG_COLORS, TYPE_DEFENSE_CHART } from "@/lib/constants";

interface MoveDetailInfo {
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
}

interface ExtendedPokemonDetail extends Omit<PokemonDetail, "moves"> {
  weaknesses?: string[];
  moves: any[];
  speciesName: string; 
  varieties: { is_default: boolean; name: string; url: string }[];
}

interface Props {
  pokemon: ExtendedPokemonDetail;
  prevPokemon: { id: number; name: string } | null;
  nextPokemon: { id: number; name: string } | null;
}

const NavButton = ({ direction, id, name }: { direction: "left" | "right"; id: number; name: string }) => {
  const isLeft = direction === "left";
  return (
    <Link
      href={`/pokemon/${name}`}
      className={`absolute top-1/2 -translate-y-1/2 z-50 hidden md:flex items-center gap-3 ${
        isLeft ? "left-6 lg:left-10" : "right-6 lg:right-10"
      } group transition-transform duration-300 hover:scale-105`}
    >
      {isLeft && (
        <>
          <div className="text-red-500/80 group-hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl md:text-2xl font-extrabold text-gray-900 leading-none tracking-tight whitespace-nowrap">#{String(id).padStart(3, "0")}</span>
            <span className="text-xs font-semibold text-gray-400 capitalize mt-1 max-w-[120px] truncate">{name.replace("-", " ")}</span>
          </div>
        </>
      )}
      {!isLeft && (
        <>
          <div className="flex flex-col items-end">
            <span className="text-xl md:text-2xl font-extrabold text-gray-900 leading-none tracking-tight whitespace-nowrap">#{String(id).padStart(3, "0")}</span>
            <span className="text-xs font-semibold text-gray-400 capitalize mt-1 max-w-[120px] truncate text-right">{name.replace("-", " ")}</span>
          </div>
          <div className="text-red-500/80 group-hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m15 18-6-6 6-6" /></svg>
          </div>
        </>
      )}
    </Link>
  );
};

export default function PokemonDetailClient({ pokemon, prevPokemon, nextPokemon }: Props) {
  const [activeTab, setActiveTab] = useState<"About" | "Moves" | "Episodes" | "Cards">("About");
  const [isShiny, setIsShiny] = useState(false);
  const [selectedGen, setSelectedGen] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("level-up");
  const [moveDetailsCache, setMoveDetailsCache] = useState<Record<string, MoveDetailInfo>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); 

  const mainType = pokemon.types[0].type.name;
  const bgGradient = BG_COLORS[mainType] || "from-gray-100 to-gray-200";
  const formatVal = (val: number) => (val / 10).toString().replace(".", ",");
  
  const isGenderless = pokemon.gender_rate === -1;
  const femalePct = isGenderless ? 0 : (pokemon.gender_rate / 8) * 100;
  const malePct = isGenderless ? 0 : 100 - femalePct;

  const sprites = pokemon.sprites.other["official-artwork"];
  const currentImage = (isShiny && sprites.front_shiny) ? sprites.front_shiny : sprites.front_default;

 useEffect(() => {
    if (pokemon.varieties && pokemon.varieties.length > 1) {
      
       const timer = setTimeout(() => {
          pokemon.varieties.forEach((v) => {
            if (v.name !== pokemon.name) {
             router.prefetch(`/pokemon/${v.name}`);
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [pokemon.varieties, pokemon.name, router]);
  
  const weaknesses = useMemo(() => {
    const allAttackingTypes = Object.keys(TYPE_DEFENSE_CHART);
    const calculatedWeaknesses: string[] = [];

    allAttackingTypes.forEach((attackType) => {
      let totalMultiplier = 1;
      pokemon.types.forEach((t) => {
        const defenseType = t.type.name;
        const multipliers = TYPE_DEFENSE_CHART[defenseType];
        const multiplier = multipliers && multipliers[attackType] !== undefined ? multipliers[attackType] : 1;
        totalMultiplier *= multiplier;
      });
      if (totalMultiplier > 1) {
        calculatedWeaknesses.push(attackType);
      }
    });
    return calculatedWeaknesses;
  }, [pokemon.types]);

  const availableGenerations = useMemo(() => {
    const gens = new Set<string>();
    pokemon.moves.forEach((moveEntry) => {
      moveEntry.version_group_details.forEach((detail: any) => gens.add(detail.version_group.name));
    });
    return Array.from(gens).sort().reverse(); 
  }, [pokemon.moves]);

  useEffect(() => {
    if (availableGenerations.length > 0 && !selectedGen) {
      setSelectedGen(availableGenerations[0]);
    }
  }, [availableGenerations, selectedGen]);

  const visibleMoves = useMemo(() => {
    if (!selectedGen) return [];

    return pokemon.moves
      .flatMap((moveEntry) => {
        const relevantDetails = moveEntry.version_group_details.filter(
          (detail: any) => 
            detail.version_group.name === selectedGen && 
            (selectedMethod === "all" || detail.move_learn_method.name === selectedMethod)
        );

        if (relevantDetails.length === 0) return [];

        const detail = relevantDetails[0];

        return {
          name: moveEntry.move.name,
          url: moveEntry.move.url,
          level: detail.level_learned_at,
          method: detail.move_learn_method.name,
          ...moveDetailsCache[moveEntry.move.name] 
        };
      })
      .sort((a, b) => {
        if (selectedMethod === "level-up") return a.level - b.level;
        return a.name.localeCompare(b.name);
      });
  }, [pokemon.moves, selectedGen, selectedMethod, moveDetailsCache]);

  useEffect(() => {
    const fetchMissingDetails = async () => {
      const missingMoves = visibleMoves.filter(m => !m.type && !moveDetailsCache[m.name]);

      if (missingMoves.length === 0) return;

      const BATCH_SIZE = 5; 
      const batchToFetch = missingMoves.slice(0, BATCH_SIZE); 

      const promises = batchToFetch.map(async (move) => {
        try {
          const res = await fetch(move.url);
          const data = await res.json();
          return {
            name: move.name,
            data: {
              type: data.type.name,
              category: data.damage_class.name,
              power: data.power,
              accuracy: data.accuracy,
              pp: data.pp
            }
          };
        } catch (e) {
          return null;
        }
      });

      const results = await Promise.all(promises);

      setMoveDetailsCache(prev => {
        const newCache = { ...prev };
        results.forEach(item => {
          if (item) {
            newCache[item.name] = item.data;
          }
        });
        return newCache;
      });
    };

    if (visibleMoves.length > 0) {
        fetchMissingDetails();
    }
  }, [visibleMoves, moveDetailsCache]);

  const playCry = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollBy({ left: e.deltaY, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = document.getElementById(`evo-${pokemon.name}`);
      if (activeElement) {
        const container = scrollContainerRef.current;
        const scrollLeft = activeElement.offsetLeft - container.clientWidth / 2 + activeElement.clientWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [pokemon.name, pokemon.evolutions]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 md:p-10`}>
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-[85rem] flex flex-col md:flex-row overflow-hidden h-[850px] relative">
        {prevPokemon && <NavButton direction="left" id={prevPokemon.id} name={prevPokemon.name} />}
        {nextPokemon && <NavButton direction="right" id={nextPokemon.id} name={nextPokemon.name} />}

        <div className="md:w-[45%] py-12 pr-10 pl-10 md:pl-52 flex flex-col relative h-full justify-between border-r border-gray-50 overflow-hidden">
          <div className="w-full mb-4 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                <span className="font-extrabold text-sm uppercase tracking-wider">Pokedex</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-200 whitespace-nowrap">#{String(pokemon.id).padStart(3, "0")}</span>
                <button onClick={playCry} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                </button>
                {pokemon.cries.latest && <audio ref={audioRef} src={pokemon.cries.latest} hidden />}
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold capitalize text-gray-800 tracking-tight leading-tight break-words" title={pokemon.name}>{pokemon.name.replace("-", " ")}</h1>
            <div className="flex gap-3 mt-3 flex-wrap">
              {pokemon.types.map((t) => (
                <span key={t.type.name} className={`${TYPE_COLORS[t.type.name]} text-white px-6 py-2 rounded-full text-sm font-bold capitalize shadow-md`}>{t.type.name}</span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative shrink min-h-0">
            <div className="relative w-60 h-60 md:w-[350px] md:h-[350px] z-20 transition-transform duration-700 hover:scale-105 translate-y-14">
              {currentImage ? (
                 <PokemonImage key={currentImage} src={currentImage} alt={pokemon.name} width={500} height={500} className="object-contain drop-shadow-2xl" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">No Image Available</div>
              )}
            </div>
            <div className="absolute w-[380px] h-[380px] bg-gray-100/40 rounded-full blur-[90px] -z-10 translate-y-14" />
          </div>

          <div className="mt-24 relative z-10 shrink-0 w-full max-w-full">
            <h3 className="text-gray-300 font-bold text-xs uppercase tracking-[0.3em] mb-5 text-center">Evolution Chain</h3>
            <div ref={scrollContainerRef} onWheel={handleWheel} className="w-full overflow-x-auto pb-6 pt-2 px-12 scroll-smooth [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden" style={{maskImage: "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)"}}>
              <div className="flex items-center justify-center min-w-full w-max gap-3 md:gap-6 mx-auto">
                {pokemon.evolutions.map((evo, index) => (
                  <div key={evo.name} id={`evo-${evo.name}`} className="flex items-center gap-1 md:gap-3">
                    <Link href={`/pokemon/${evo.name}`} className="group flex flex-col items-center gap-2">
                      <div className={`w-[86px] h-[86px] rounded-full flex items-center justify-center p-3 transition-all ${pokemon.name === evo.name ? "bg-white shadow-xl border-2 border-orange-100 scale-110" : "bg-gray-50 opacity-50 hover:opacity-100 hover:bg-white hover:shadow-lg"}`}>
                        {evo.image && <PokemonImage src={evo.image} alt={evo.name} width={90} height={90} className="object-contain" />}
                      </div>
                      <div className="text-center flex flex-col items-center">
                        <p className="text-[13px] font-bold text-gray-800 capitalize leading-none max-w-[100px] truncate">{evo.name.replace("-", " ")}</p>
                        <p className="text-[11px] text-gray-300 font-bold mt-1.5">#{String(evo.id).padStart(3, "0")}</p>
                        <div className="flex flex-nowrap gap-1 mt-2 justify-center">
                          {evo.types.map((type) => <span key={type} className={`${TYPE_COLORS[type]} text-[9px] text-white px-2 py-0.5 rounded-full capitalize font-bold shadow-sm whitespace-nowrap`}>{type}</span>)}
                        </div>
                      </div>
                    </Link>
                    {index < pokemon.evolutions.length - 1 && <div className="text-gray-200 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-[55%] py-12 pl-10 pr-10 md:pr-52 bg-white flex flex-col h-full">
          <div className="flex gap-12 border-b border-gray-100 mb-8 pb-1 shrink-0">
            {["About", "Moves", "Episodes", "Cards"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`capitalize pb-4 font-bold text-base transition-all relative ${activeTab === tab ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-blue-600 after:rounded-full" : "text-gray-300 hover:text-gray-500"}`}>{tab}</button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "About" && (
              <div className="h-full overflow-y-auto pb-8 animate-fadeIn [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-widest">Weaknesses</h3>
                  <div className="flex gap-2 flex-wrap">{weaknesses.length > 0 ? weaknesses.map((weakness) => <span key={weakness} className={`${TYPE_COLORS[weakness] || "bg-gray-400"} text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm capitalize`}>{weakness}</span>) : <span className="text-gray-400 text-xs italic">None</span>}</div>
                </div>
                <div className="mb-4">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-widest">Story</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-xl">{pokemon.story}</p>
                </div>
                
                <div className="mb-2">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-widest">Appearance</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setIsShiny(false)} className={`px-4 py-1 rounded-full text-xs font-bold border-2 transition-all ${!isShiny ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-100 text-gray-300"}`}>Normal</button>
                    <button onClick={() => setIsShiny(true)} className={`px-4 py-1 rounded-full text-xs font-bold border-2 transition-all ${isShiny ? "border-orange-400 text-orange-500 bg-orange-50" : "border-gray-100 text-gray-300"}`}>Shiny ✨</button>
                  </div>
                </div>

                {pokemon.varieties && pokemon.varieties.length > 1 && (
                    <div className="mb-4 mt-4">
                        <h3 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-widest">Forms & Varieties</h3>
                        <div className="flex gap-2 flex-wrap">
                            {pokemon.varieties.map((v) => {
                                const isCurrent = v.name === pokemon.name;
                                const displayName = v.name === pokemon.speciesName 
                                  ? "Normal" 
                                  : v.name.replace(pokemon.speciesName, "").replace(/-/g, " ").trim();

                                return (
                                    <Link 
                                      key={v.name} 
                                      href={`/pokemon/${v.name}`}
                                      className={`px-4 py-1 rounded-full text-xs font-bold border-2 transition-all capitalize ${
                                        isCurrent 
                                          ? "border-purple-600 text-purple-600 bg-purple-50" 
                                          : "border-gray-100 text-gray-400 hover:border-purple-200 hover:text-purple-400"
                                      }`}
                                    >
                                        {displayName}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-tighter">Height</p>
                    <p className="text-gray-800 font-extrabold text-sm">{formatVal(pokemon.height)}m</p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-tighter">Category</p>
                    <p className="text-gray-800 font-extrabold text-sm truncate">{pokemon.category}</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-tighter">Weight</p>
                    <p className="text-gray-800 font-extrabold text-sm">{formatVal(pokemon.weight)}kg</p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-tighter">Gender</p>
                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold">
                      {isGenderless ? <span className="text-gray-400">N/A</span> : <><span className="text-blue-500">♂ {malePct}%</span><span className="text-pink-500">♀ {femalePct}%</span></>}
                    </div>
                  </div>
                  <div className="col-span-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-tighter text-center">Abilities</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {pokemon.abilities.map((a) => (
                          <span 
                            key={a.ability.name} 
                            className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-100 rounded-lg text-xs font-bold capitalize shadow-sm hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-colors"
                          >
                            {a.ability.name.replace("-", " ")}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-widest">Stats</h3>
                  <div className="space-y-2">{pokemon.stats.map((s) => <StatBar key={s.stat.name} label={s.stat.name.replace("special-", "Sp. ")} value={s.base_stat} />)}</div>
                </div>
              </div>
            )}

            {activeTab === "Moves" && (
              <div className="h-full flex flex-col">
                <div className="flex flex-wrap gap-4 mb-6 shrink-0 p-1">
                  <div className="flex flex-col gap-1 relative">
                    <label htmlFor="gen-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Game Version</label>
                    <div className="relative group">
                      <select id="gen-select" value={selectedGen} onChange={(e) => setSelectedGen(e.target.value)} className="appearance-none w-full pl-4 pr-10 py-2 text-sm font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-100 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer capitalize">
                        {availableGenerations.map((gen) => <option key={gen} value={gen} className="capitalize">{gen.replace("-", " ")}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-blue-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 relative">
                    <label htmlFor="method-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Learn Method</label>
                    <div className="relative group">
                      <select id="method-select" value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="appearance-none w-full pl-4 pr-10 py-2 text-sm font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-100 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer capitalize">
                        <option value="level-up">Level Up</option>
                        <option value="machine">TM/HM</option>
                        <option value="egg">Egg Move</option>
                        <option value="tutor">Tutor</option>
                        <option value="all">All Methods</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-blue-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {visibleMoves.length > 0 ? (
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr>
                          {selectedMethod === "level-up" && <th className="p-2 w-[10%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100 text-center">Lv.</th>}
                          <th className="p-2 w-[25%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100">Move</th>
                          <th className="p-2 w-[20%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100">Type</th>
                          <th className="p-2 w-[20%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100">Cat.</th>
                          <th className="p-2 w-[10%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100 text-center">Pwr.</th>
                          <th className="p-2 w-[10%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100 text-center">Acc.</th>
                          <th className="p-2 w-[5%] text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b-2 border-gray-100 text-center">PP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleMoves.map((move, index) => (
                          <tr key={`${move.name}-${index}`} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                            {selectedMethod === "level-up" && <td className="p-2 font-bold text-gray-700 text-sm text-center">{move.level === 0 ? "—" : move.level}</td>}
                            <td className="p-2 font-bold text-gray-800 text-sm capitalize truncate">{move.name.replace("-", " ")}</td>
                            <td className="p-2">
                              {move.type ? (
                                <span className={`${TYPE_COLORS[move.type]} text-white px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shadow-sm inline-block w-full text-center truncate`}>{move.type}</span>
                              ) : <span className="animate-pulse bg-gray-200 h-4 w-full rounded inline-block"></span>}
                            </td>
                            <td className="p-2">
                              {move.category ? (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shadow-sm inline-block w-full text-center truncate ${move.category === "physical" ? "bg-orange-500 text-white" : move.category === "special" ? "bg-blue-500 text-white" : "bg-gray-400 text-white"}`}>{move.category}</span>
                              ) : <span className="animate-pulse bg-gray-200 h-4 w-full rounded inline-block"></span>}
                            </td>
                            <td className="p-2 font-bold text-gray-700 text-sm text-center">{move.type ? (move.power || "—") : "..."}</td>
                            <td className="p-2 font-bold text-gray-700 text-sm text-center">{move.type ? (move.accuracy ? `${move.accuracy}%` : "—") : "..."}</td>
                            <td className="p-2 font-bold text-gray-700 text-sm text-center">{move.type ? move.pp : "..."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <p className="font-bold text-sm">No moves found for this selection.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(activeTab === "Episodes" || activeTab === "Cards") && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300"><p className="font-bold text-lg italic">Coming Soon</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}