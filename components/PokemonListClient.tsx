"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPokemonList } from "@/lib/api";
import { TYPE_COLORS } from "@/lib/constants";

// Tipe data sesuai dengan return dari getPokemonList di lib/api.ts
interface PokemonSlim {
  id: number;
  name: string;
  image: string;
}

interface Props {
  initialData: PokemonSlim[];
}

export default function PokemonListClient({ initialData }: Props) {
  const [pokemons, setPokemons] = useState<PokemonSlim[]>(initialData);
  const [offset, setOffset] = useState(24); // Mulai offset setelah batch pertama (default 24)
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Panggil API untuk halaman berikutnya
      const newPokemons = await getPokemonList(24, offset);
      
      if (newPokemons.length === 0) {
        setHasMore(false);
      } else {
        setPokemons((prev) => [...prev, ...newPokemons]);
        setOffset((prev) => prev + 24);
      }
    } catch (error) {
      console.error("Gagal memuat pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      {/* GRID LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {pokemons.map((pokemon) => (
          <Link
            key={pokemon.id}
            href={`/pokemon/${pokemon.name}`}
            className="group relative bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100 block"
          >
            {/* Background ID Number */}
            <span className="absolute top-4 right-6 text-5xl font-extrabold text-gray-100 z-0 group-hover:text-blue-50 transition-colors">
              #{String(pokemon.id).padStart(3, "0")}
            </span>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Image Container */}
              <div className="w-32 h-32 mb-4 relative transition-transform duration-300 group-hover:scale-110">
                 {/* Menggunakan Image component dari Next.js untuk performa */}
                 <Image 
                    src={pokemon.image} 
                    alt={pokemon.name}
                    fill
                    className="object-contain drop-shadow-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={pokemon.id <= 12} // Load prioritas untuk 12 item pertama
                 />
              </div>

              {/* Name */}
              <h2 className="text-lg font-extrabold text-gray-800 capitalize tracking-tight mb-1">
                {pokemon.name.replace("-", " ")}
              </h2>
              
              {/* View Details Label */}
              <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors mt-2">
                View Details →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              "Load More Pokemon"
            )}
          </button>
        </div>
      )}
    </div>
  );
}