import PokemonListClient from "@/components/PokemonListClient";
import PokemonSearch from "@/components/PokemonSearch";
import { getPokemonList, getAllPokemonSlim } from "@/lib/api";

export default async function Home() {
  // 1. Ambil Data Awal (Server Side)
  const initialData = await getPokemonList(20, 0);

  // 2. Ambil Index Search (Server Side)
  const allPokemonList = await getAllPokemonSlim();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header & Search */}
      <div className="bg-white pb-12 pt-16 px-4 rounded-b-[3rem] shadow-sm mb-8">
        <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 tracking-tight">Pokédex</h1>
            <p className="text-gray-400 font-medium mb-8">Search specifically for any Pokémon by name</p>
            
            <PokemonSearch allPokemon={allPokemonList} />
        </div>
      </div>

      {/* Grid List */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <PokemonListClient initialData={initialData} />
      </div>
    </main>
  );
}