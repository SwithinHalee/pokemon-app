import Link from "next/link";
import PokemonImage from "./PokemonImage";

interface Props {
  name: string;
  url: string;
  index: number;
}

export default function PokemonCard({ name, url, index }: Props) {
const id = url.split("/").filter(Boolean).pop();

  return (
    <Link 
      href={`/pokemon/${name}`} 
      className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col items-center"
    >
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors z-0" />
      <div className="relative z-10 w-full flex justify-between items-start mb-2">
         <span className="text-gray-300 font-bold text-xs">#{String(id).padStart(3, '0')}</span>
      </div>
      <div className="relative z-10 w-32 h-32 mb-4 group-hover:scale-110 transition-transform duration-300">
        <PokemonImage
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
          alt={name}
          width={150}
          height={150}
          className="object-contain w-full h-full drop-shadow-md"
        />
      </div>

      <h2 className="relative z-10 text-lg font-bold text-gray-800 capitalize mb-1 group-hover:text-blue-600 transition-colors">
        {name.replace("-", " ")}
      </h2>
    </Link>
  );
}