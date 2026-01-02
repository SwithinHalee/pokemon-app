"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PokemonImage from "./PokemonImage";
import StatBar from "./StatBar";
import { PokemonDetail } from "@/types";
import { TYPE_COLORS, BG_COLORS } from "@/lib/constants";

interface Props {
  pokemon: PokemonDetail;
}

export default function PokemonDetailClient({ pokemon }: Props) {
  const [activeTab, setActiveTab] = useState<"About" | "Moves" | "Episodes" | "Cards">("About");
  const [isShiny, setIsShiny] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mainType = pokemon.types[0].type.name;
  const bgGradient = BG_COLORS[mainType] || "from-gray-100 to-gray-200";

  const formatVal = (val: number) => (val / 10).toString().replace(".", ",");
  
  const genderRate = pokemon.gender_rate;
  const isGenderless = genderRate === -1;
  const femalePercentage = isGenderless ? 0 : (genderRate / 8) * 100;
  const malePercentage = isGenderless ? 0 : 100 - femalePercentage;

  const playCry = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  };

  const currentImage = isShiny 
    ? pokemon.sprites.other["official-artwork"].front_shiny 
    : pokemon.sprites.other["official-artwork"].front_default;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 md:p-8`}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden h-[850px] relative">
        
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col relative z-10 h-full justify-between">
          
          <div className="w-full mb-6">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold capitalize text-gray-800 tracking-tight">
                    {pokemon.name}
                </h1>
                <span className="text-2xl md:text-3xl font-bold text-gray-300">
                    #{String(pokemon.id).padStart(3, "0")}
                </span>
                
                <button onClick={playCry} className="ml-2 p-2 bg-white/50 rounded-full hover:bg-white text-gray-600 transition-colors shadow-sm" title="Play Cry">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                </button>
                <audio ref={audioRef} src={pokemon.cries.latest} hidden />
            </div>
            
            <div className="flex gap-2 mt-3">
              {pokemon.types.map((t) => (
                <span key={t.type.name} className={`${TYPE_COLORS[t.type.name] || 'bg-gray-400'} text-white px-6 py-1.5 rounded-full text-sm font-bold capitalize shadow-md shadow-gray-200`}>
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-4 relative">
             <div className="relative w-64 h-64 md:w-80 md:h-80 hover:scale-105 transition-transform duration-500 z-20 cursor-pointer">
                <PokemonImage
                  key={currentImage} 
                  src={currentImage}
                  alt={pokemon.name}
                  width={400}
                  height={400}
                  className="object-contain drop-shadow-2xl"
                />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/30 rounded-full blur-2xl -z-10" />
          </div>

          <div className="mt-4">
            <h3 className="text-gray-700/60 font-bold text-xs uppercase tracking-widest mb-4 text-center">Evolution Chain</h3>
            <div className="flex items-end justify-center gap-2">
                {pokemon.evolutions.map((evo, index) => (
                  <div key={evo.name} className="flex items-center">
                    <Link href={`/pokemon/${evo.name}`} className="group flex flex-col items-center gap-1 cursor-pointer">
                      <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 ${pokemon.name === evo.name ? 'border-white bg-white/40 shadow-lg' : 'border-white/30 bg-white/20'} flex items-center justify-center p-1 transition-all hover:bg-white/60 hover:scale-110`}>
                        <PokemonImage src={evo.image} alt={evo.name} width={60} height={60} className="object-contain" />
                      </div>
                      <div className="text-center mt-1">
                        <p className={`text-xs font-bold capitalize ${pokemon.name === evo.name ? 'text-gray-900' : 'text-gray-600'}`}>
                          {evo.name} <span className="text-gray-400 font-normal ml-1">#{String(evo.id).padStart(3, "0")}</span>
                        </p>
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {evo.types.map((type) => (
                          <span key={type} className={`${TYPE_COLORS[type] || 'bg-gray-400'} text-[9px] text-white px-2 py-0.5 rounded-full capitalize font-bold shadow-sm`}>{type}</span>
                        ))}
                      </div>
                    </Link>
                    {index < pokemon.evolutions.length - 1 && (
                      <div className="mx-1 md:mx-2 mb-8 text-gray-400/50 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        {pokemon.evolutions[index+1].min_level && (<span className="text-[9px] font-bold mt-0.5">Lvl {pokemon.evolutions[index+1].min_level}</span>)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col h-full">
          
          <div className="flex gap-8 border-b border-gray-100 mb-6 pb-1 shrink-0">
            {["About", "Moves", "Episodes", "Cards"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`capitalize pb-3 font-bold text-sm transition-colors relative ${activeTab === tab ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden relative">
            {activeTab === "About" && (
              <div className="animate-fadeIn h-full overflow-y-auto pr-2 custom-scrollbar pb-4">
                
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Weaknesses</h3>
                  <div className="flex gap-2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-sm shadow-blue-200">Water</span>
                    <span className="bg-yellow-600 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-sm shadow-yellow-200">Ground</span>
                    <span className="bg-gray-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-sm shadow-gray-200">Rock</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Story</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{pokemon.story}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Versions</h3>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setIsShiny(false)}
                        className={`px-4 py-1 rounded-full text-sm font-bold border transition-all ${!isShiny ? 'border-blue-600 text-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        Normal
                      </button>
                      <button 
                        onClick={() => setIsShiny(true)}
                        className={`px-4 py-1 rounded-full text-sm font-bold border transition-all ${isShiny ? 'border-amber-500 text-amber-600 bg-amber-50 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        Shiny ✨
                      </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">Height</p>
                    <p className="text-gray-800 font-bold text-sm">{formatVal(pokemon.height)}m</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">Category</p>
                    <p className="text-gray-800 font-bold text-sm truncate">{pokemon.category}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">Gender</p>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {isGenderless ? <span className="text-gray-400">Unknown</span> : <><span className="text-blue-500 flex items-center">♂ {malePercentage}%</span><span className="text-pink-500 flex items-center">♀ {femalePercentage}%</span></>}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">Weight</p>
                    <p className="text-gray-800 font-bold text-sm">{formatVal(pokemon.weight)}kg</p>
                  </div>
                  
                  <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                    <p className="text-gray-400 text-[10px] font-bold mb-1">Abilities</p>
                    <div className="flex gap-2 flex-wrap">
                      {pokemon.abilities.map((a) => (<span key={a.ability.name} className="capitalize text-gray-800 font-bold text-sm">{a.ability.name.replace("-", " ")}</span>))}
                    </div>
                  </div>

                  {pokemon.held_items.length > 0 && (
                    <div className="col-span-3 bg-white p-3 rounded-xl border border-gray-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                      <p className="text-gray-400 text-[10px] font-bold mb-2">Held Items</p>
                      <div className="flex gap-2 flex-wrap">
                        {pokemon.held_items.map((h) => (
                          <span key={h.item.name} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold capitalize border border-amber-200">
                            {h.item.name.replace("-", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Game Appearances</h3>
                  <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto custom-scrollbar pr-1">
                      {pokemon.game_indices.map((g) => (
                        <span key={g.version.name} className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium capitalize border border-gray-200">
                            {g.version.name.replace("-", " ")}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Stats</h3>
                  <div className="space-y-3">
                    {pokemon.stats.map((s) => (
                      <StatBar key={s.stat.name} label={s.stat.name.replace("special-", "Sp. ")} value={s.base_stat} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Moves" && (
              <div className="animate-fadeIn h-full overflow-y-auto pr-2 custom-scrollbar pb-4">
                <div className="flex flex-wrap gap-2">
                  {pokemon.moves.map((m) => (<div key={m.move.name} className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs text-gray-700 font-bold capitalize border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">{m.move.name.replace("-", " ")}</div>))}
                </div>
              </div>
            )}

            {(activeTab === "Episodes" || activeTab === "Cards") && (
              <div className="animate-fadeIn h-full flex flex-col items-center justify-center text-gray-400"><p className="font-medium text-sm">No Data</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}