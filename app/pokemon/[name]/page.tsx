import PokemonDetailClient from "@/components/PokemonDetailClient";
import { getPokemon, getPreviousNextPokemon } from "@/lib/api";

interface Props {
  params: Promise<{ name: string }>;
}

// Halaman Detail Pokemon (Server Side)
export default async function PokemonPage({ params }: Props) {
  // Resolusi parameter URL
  const { name } = await params;

  // Fetch data utama pokemon
  const pokemon = await getPokemon(name);

  // Cek validitas data
  if (!pokemon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl">Pokemon <span className="font-bold text-gray-800">"{name}"</span> not found.</p>
        <a href="/" className="mt-6 text-blue-500 hover:underline">Back to Pokedex</a>
      </div>
    );
  }

  // Fetch navigasi prev/next secara paralel
  const { prevPokemon, nextPokemon } = await getPreviousNextPokemon(pokemon.id);

  return (
    <PokemonDetailClient 
      pokemon={pokemon} 
      prevPokemon={prevPokemon} 
      nextPokemon={nextPokemon} 
    />
  );
}