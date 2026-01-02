"use client";

import { useState } from "react";
import { getPokemonList } from "@/lib/api";
import { PokemonListResponse } from "@/types";
import PokemonCard from "./PokemonCard"; // Import komponen baru
import Pagination from "./Pagination";   // Import komponen baru

interface Props {
  initialData: PokemonListResponse;
}

export default function PokemonListClient({ initialData }: Props) {
  // --- STATE ---
  const [pokemonList, setPokemonList] = useState(initialData.results);
  const [nextOffset, setNextOffset] = useState(20);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialData.next);

  // --- HANDLER LOAD MORE ---
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      // Fetch 20 data berikutnya
      const newData = await getPokemonList(20, nextOffset);
      
      // Gabungkan data lama + data baru
      setPokemonList((prev) => [...prev, ...newData.results]);
      setNextOffset((prev) => prev + 20);
      setHasMore(!!newData.next);
    } catch (error) {
      console.error("Gagal load more:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="pb-12">
      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {pokemonList.map((pokemon, index) => (
          <PokemonCard 
            key={`${pokemon.name}-${index}`} 
            name={pokemon.name} 
            url={pokemon.url} 
            index={index} 
          />
        ))}
      </div>

      {/* Tombol Pagination */}
      <Pagination 
        onLoadMore={loadMore} 
        loading={loading} 
        hasMore={hasMore} 
      />
    </div>
  );
}