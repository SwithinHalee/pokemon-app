"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PokemonImage from "./PokemonImage";
import StatBar from "./StatBar";
import { PokemonDetail } from "@/types";
import { TYPE_COLORS, BG_COLORS } from "@/lib/constants";

// Update: NavButton Minimalis (Sesuai Referensi Gambar Charmander)
const NavButton = ({ direction, id, name }: { direction: 'left' | 'right', id: number, name: string }) => {
  const isLeft = direction === 'left';
  
  return (
    <Link
      href={`/pokemon/${name}`}
      className={`
        absolute top-1/2 -translate-y-1/2 z-50
        hidden md:flex items-center gap-3
        ${isLeft ? 'left-8 lg:left-12' : 'right-8 lg:right-12'}
        group transition-transform duration-300 hover:scale-105
      `}
    >
      {/* LOGIKA KIRI: Arrow < dulu, baru Teks */}
      {isLeft && (
        <>
          <div className="text-red-500/80 group-hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">#{String(id).padStart(3, '0')}</span>
            <span className="text-xs font-semibold text-gray-400 capitalize mt-1">{name.replace("-", " ")}</span>
          </div>
        </>
      )}

      {/* LOGIKA KANAN: Teks dulu, baru Arrow > */}
      {!isLeft && (
        <>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">#{String(id).padStart(3, '0')}</span>
            <span className="text-xs font-semibold text-gray-400 capitalize mt-1">{name.replace("-", " ")}</span>
          </div>
          <div className="text-red-500/80 group-hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
        </>
      )}
    </Link>
  );
};

interface Props {
  pokemon: PokemonDetail;
  prevPokemon: { id: number; name: string } | null;
  nextPokemon: { id: number; name: string } | null;
}

export default function PokemonDetailClient({ pokemon, prevPokemon, nextPokemon }: Props) {
  const [activeTab, setActiveTab] = useState<"About" | "Moves" | "Episodes" | "Cards">("About");
  const [isShiny, setIsShiny] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mainType = pokemon.types[0].type.name;
  const bgGradient = BG_COLORS[mainType] || "from-gray-100 to-gray-200";
  const formatVal = (val: number) => (val / 10).toString().replace(".", ",");
  const isGenderless = pokemon.gender_rate === -1;
  const femalePct = isGenderless ? 0 : (pokemon.gender_rate / 8) * 100;
  const malePct = isGenderless ? 0 : 100 - femalePct;
  const currentImage = isShiny ? pokemon.sprites.other["official-artwork"].front_shiny : pokemon.sprites.other["official-artwork"].front_default;

  const playCry = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 md:p-10`}>
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-[85rem] flex flex-col md:flex-row overflow-hidden h-[850px] relative">
        
        {/* Navigasi Minimalis */}
        {prevPokemon && <NavButton direction="left" id={prevPokemon.id} name={prevPokemon.name} />}
        {nextPokemon && <NavButton direction="right" id={nextPokemon.id} name={nextPokemon.name} />}

        {/* KOLOM KIRI */}
        <div className="md:w-[45%] py-12 pr-10 pl-10 md:pl-44 flex flex-col relative h-full justify-between border-r border-gray-50">
          
          <div className="w-full mb-4 relative z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-5xl font-extrabold capitalize text-gray-800 tracking-tight">{pokemon.name}</h1>
                <span className="text-3xl font-bold text-gray-200">#{String(pokemon.id).padStart(3, "0")}</span>
                <button onClick={playCry} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors active:scale-95">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                </button>
                <audio ref={audioRef} src={pokemon.cries.latest} hidden />
            </div>
            <div className="flex gap-3 mt-4">
              {pokemon.types.map((t) => (
                <span key={t.type.name} className={`${TYPE_COLORS[t.type.name]} text-white px-6 py-2 rounded-full text-sm font-bold capitalize shadow-md`}>
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
             <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] z-20 transition-transform duration-700 hover:scale-105">
                <PokemonImage key={currentImage} src={currentImage} alt={pokemon.name} width={500} height={500} className="object-contain drop-shadow-2xl" />
            </div>
            <div className="absolute w-[450px] h-[450px] bg-gray-100/40 rounded-full blur-[90px] -z-10" />
          </div>

          <div className="mt-4 relative z-10">
            <h3 className="text-gray-300 font-bold text-[11px] uppercase tracking-[0.3em] mb-8 text-center">Evolution Chain</h3>
            <div className="flex items-center justify-center gap-8">
                {pokemon.evolutions.map((evo, index) => (
                  <div key={evo.name} className="flex items-center gap-4">
                    <Link href={`/pokemon/${evo.name}`} className="group flex flex-col items-center gap-2">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center p-3 transition-all ${pokemon.name === evo.name ? 'bg-white shadow-xl border-2 border-orange-100 scale-110' : 'bg-gray-50 opacity-50 hover:opacity-100 hover:bg-white hover:shadow-lg'}`}>
                        <PokemonImage src={evo.image} alt={evo.name} width={80} height={80} className="object-contain" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-800 capitalize leading-none">{evo.name}</p>
                        <p className="text-[10px] text-gray-300 font-bold mt-1.5">#{String(evo.id).padStart(3, "0")}</p>
                      </div>
                    </Link>
                    {index < pokemon.evolutions.length - 1 && (
                      <div className="text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="md:w-[55%] py-12 pl-10 pr-10 md:pr-44 bg-white flex flex-col h-full">
          <div className="flex gap-12 border-b border-gray-100 mb-10 pb-1 shrink-0">
            {["About", "Moves", "Episodes", "Cards"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`capitalize pb-5 font-bold text-base transition-all relative ${activeTab === tab ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-blue-600 after:rounded-full" : "text-gray-300 hover:text-gray-500"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "About" && (
              <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-8 animate-fadeIn">
                <div className="mb-10">
                  <h3 className="font-bold text-gray-900 text-xs mb-5 uppercase tracking-widest">Weaknesses</h3>
                  <div className="flex gap-3">
                    <span className="bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Water</span>
                    <span className="bg-yellow-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Ground</span>
                    <span className="bg-gray-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Rock</span>
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="font-bold text-gray-900 text-xs mb-4 uppercase tracking-widest">Story</h3>
                  <p className="text-gray-500 text-base leading-loose font-medium max-w-xl">{pokemon.story}</p>
                </div>
                <div className="mb-10">
                  <h3 className="font-bold text-gray-900 text-xs mb-5 uppercase tracking-widest">Versions</h3>
                  <div className="flex gap-4">
                      <button onClick={() => setIsShiny(false)} className={`px-7 py-2 rounded-full text-sm font-bold border-2 transition-all ${!isShiny ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-gray-100 text-gray-300'}`}>Normal</button>
                      <button onClick={() => setIsShiny(true)} className={`px-7 py-2 rounded-full text-sm font-bold border-2 transition-all ${isShiny ? 'border-orange-400 text-orange-500 bg-orange-50' : 'border-gray-100 text-gray-300'}`}>Shiny ✨</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[11px] font-bold mb-2 uppercase tracking-tighter">Height</p>
                    <p className="text-gray-800 font-extrabold text-lg">{formatVal(pokemon.height)}m</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[11px] font-bold mb-2 uppercase tracking-tighter">Category</p>
                    <p className="text-gray-800 font-extrabold text-lg truncate">{pokemon.category}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[11px] font-bold mb-2 uppercase tracking-tighter">Gender</p>
                    <div className="flex items-center justify-center gap-3 text-sm font-extrabold">
                      {isGenderless ? <span className="text-gray-400">N/A</span> : <><span className="text-blue-500">♂ {malePct}%</span><span className="text-pink-500">♀ {femalePct}%</span></>}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[11px] font-bold mb-2 uppercase tracking-tighter">Weight</p>
                    <p className="text-gray-800 font-extrabold text-lg">{formatVal(pokemon.weight)}kg</p>
                  </div>
                  <div className="col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-hover hover:border-blue-100">
                    <p className="text-gray-400 text-[11px] font-bold mb-3 uppercase tracking-tighter text-center">Abilities</p>
                    <div className="flex gap-3 flex-wrap justify-center">{pokemon.abilities.map((a) => (<span key={a.ability.name} className="capitalize text-gray-800 font-extrabold text-base">{a.ability.name.replace("-", " ")}</span>))}</div>
                  </div>
                </div>
                <div className="mb-12">
                  <h3 className="font-bold text-gray-900 text-xs mb-5 uppercase tracking-widest">Game Appearances</h3>
                  <div className="flex gap-3 flex-wrap">
                      {pokemon.game_indices.map((g) => (<span key={g.version.name} className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[11px] font-bold capitalize border border-gray-100 transition-colors hover:bg-gray-100 hover:text-gray-600">{g.version.name.replace("-", " ")}</span>))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs mb-8 uppercase tracking-widest">Stats</h3>
                  <div className="space-y-5">{pokemon.stats.map((s) => (<StatBar key={s.stat.name} label={s.stat.name.replace("special-", "Sp. ")} value={s.base_stat} />))}</div>
                </div>
              </div>
            )}
            {activeTab === "Moves" && (
              <div className="h-full overflow-y-auto pr-4 custom-scrollbar pb-8 animate-fadeIn">
                <div className="flex flex-wrap gap-3">
                  {pokemon.moves.map((m) => (<div key={m.move.name} className="bg-gray-50 px-5 py-3 rounded-2xl text-xs text-gray-600 font-bold capitalize border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default">{m.move.name.replace("-", " ")}</div>))}
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