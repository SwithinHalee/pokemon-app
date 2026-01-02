import Link from "next/link";
import PokemonImage from "./PokemonImage";

interface PokemonCardProps {
  name: string;
  url: string; // URL dari API list, misal: https://pokeapi.co/api/v2/pokemon/1/
}

export default function PokemonCard({ name, url }: PokemonCardProps) {
  // Extract ID dari URL
  const id = url.split("/").filter(Boolean).pop();
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return (
    <Link href={`/pokemon/${name}`} className="group">
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center cursor-pointer">
        <div className="bg-gray-50 rounded-lg p-4 w-full flex justify-center mb-4 group-hover:bg-gray-100 transition-colors">
          <PokemonImage 
            src={imageUrl} 
            alt={name} 
            width={120} 
            height={120} 
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <span className="text-gray-400 text-xs font-bold mb-1">#{String(id).padStart(3, '0')}</span>
        <h2 className="text-lg font-bold capitalize text-gray-800 group-hover:text-blue-600 transition-colors">
          {name}
        </h2>
      </div>
    </Link>
  );
}