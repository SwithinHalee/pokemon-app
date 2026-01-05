import PokemonListClient from "@/components/PokemonListClient";
import PokemonSearch from "@/components/PokemonSearch";
import { getPokemonList, getAllPokemonSlim } from "@/lib/api";

// Halaman Utama (Server Side)
export default async function Home() {
  // Ambil data awal dan daftar semua pokemon untuk search
  const initialData = await getPokemonList(20, 0);
  const allPokemonList = await getAllPokemonSlim();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header & Search Bar */}
      <div className="bg-white pb-12 pt-16 px-4 rounded-b-[3rem] shadow-sm mb-8">
        <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 tracking-tight">Pokédex</h1>
            <p className="text-gray-400 font-medium mb-8">Search specifically for any Pokémon by name</p>
            
            <PokemonSearch allPokemon={allPokemonList} />
        </div>
      </div>

      {/* Daftar Pokemon dengan Fitur Filter */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <PokemonListClient initialData={initialData} />
      </div>
    </main>
  );
}