import PokemonDetailClient from "@/components/PokemonDetailClient";
import { getPokemonDetail, getPokemonNameById } from "@/lib/api";

interface Props {
  params: Promise<{ name: string }>;
}

export default async function PokemonDetailPage({ params }: Props) {
  const { name } = await params;

  // 1. Fetch data utama Pokemon
  const pokemon = await getPokemonDetail(name);
  const currentId = pokemon.id;

  // 2. Fetch data Pokemon Sebelum & Sesudah secara paralel
  // Menggunakan Promise.allSettled agar jika satu gagal (misal ID 0), yang lain tetap jalan
  const [prevResult, nextResult] = await Promise.allSettled([
    getPokemonNameById(currentId - 1),
    getPokemonNameById(currentId + 1),
  ]);

  // 3. Olah hasil fetch
  const prevPokemon = prevResult.status === "fulfilled" && prevResult.value 
    ? { id: currentId - 1, name: prevResult.value } 
    : null;
    
  const nextPokemon = nextResult.status === "fulfilled" && nextResult.value 
    ? { id: currentId + 1, name: nextResult.value } 
    : null;

  // 4. Render Client Component dengan data lengkap
  return (
    <PokemonDetailClient 
      pokemon={pokemon}
      prevPokemon={prevPokemon}
      nextPokemon={nextPokemon}
    />
  );
}