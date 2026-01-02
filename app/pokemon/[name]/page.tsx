import { Metadata } from "next";
import Link from "next/link";
import { getPokemonDetail } from "@/lib/api";
import PokemonDetailClient from "@/components/PokemonDetailClient";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${name.charAt(0).toUpperCase() + name.slice(1)} | Pokedex`,
  };
}

export default async function PokemonDetail({ params }: Props) {
  const { name } = await params;
  const pokemon = await getPokemonDetail(name);

  return (
    <div>
      {/* Tombol Back global */}
      <Link href="/" className="fixed top-8 left-8 z-50 bg-white/30 backdrop-blur-md p-3 rounded-full hover:bg-white/50 transition-colors shadow-lg border border-white/20 text-gray-800 font-bold">
        ← Back
      </Link>
      
      {/* Panggil Client Component */}
      <PokemonDetailClient pokemon={pokemon} />
    </div>
  );
}