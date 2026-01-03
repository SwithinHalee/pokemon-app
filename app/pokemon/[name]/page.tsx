import PokemonDetailClient from "@/components/PokemonDetailClient";
// Penting: Import fungsi getPokemon dan getPreviousNextPokemon dari lib/api
import { getPokemon, getPreviousNextPokemon } from "@/lib/api";

interface Props {
  params: Promise<{ name: string }>;
}

export default async function PokemonPage({ params }: Props) {
  // 1. Ambil nama pokemon dari URL (Await params untuk Next.js 15)
  const { name } = await params;

  // 2. Fetch Data Utama
  const pokemon = await getPokemon(name);

  // 3. Handle jika Pokemon tidak ditemukan (404 / null)
  if (!pokemon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl">Pokemon <span className="font-bold text-gray-800">"{name}"</span> not found.</p>
        <a href="/" className="mt-6 text-blue-500 hover:underline">Back to Pokedex</a>
      </div>
    );
  }

  // 4. Fetch Navigasi (Prev/Next) secara paralel agar lebih cepat
  const { prevPokemon, nextPokemon } = await getPreviousNextPokemon(pokemon.id);

  // 5. Render Client Component (UI Utama)
  return (
    <PokemonDetailClient 
      pokemon={pokemon} 
      prevPokemon={prevPokemon} 
      nextPokemon={nextPokemon} 
    />
  );
}