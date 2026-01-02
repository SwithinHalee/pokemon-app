import PokemonDetailClient from "@/components/PokemonDetailClient";
import { getPokemonDetail } from "@/lib/api";

interface Props {
  params: Promise<{ name: string }>; // Next.js 15+ params harus Promise
}

export default async function PokemonDetailPage({ params }: Props) {
  // 1. Ambil nama dari URL
  const { name } = await params;

  // 2. Fetch data detail di Server
  const pokemon = await getPokemonDetail(name);

  // 3. Render Client Component
  return <PokemonDetailClient pokemon={pokemon} />;
}