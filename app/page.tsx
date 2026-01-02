import PokemonCard from "@/components/PokemonCard";
import Pagination from "@/components/Pagination";
import { getPokemonList } from "@/lib/api";

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;
  
  // Logic Pagination
  const page = Number(params.page) || 1;
  const limit = 20; // Jumlah pokemon per halaman
  const offset = (page - 1) * limit;

  // Fetch data dengan offset yang dinamis
  const pokemonData = await getPokemonList(limit, offset);
  const totalPages = Math.ceil(pokemonData.count / limit);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex justify-between items-center py-6 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Pokedex</h1>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-500">
          Total Pokemon: <span className="text-gray-900 font-bold">{pokemonData.count}</span>
        </div>
      </header>

      {/* Grid Pokemon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pokemonData.results.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            url={pokemon.url}
          />
        ))}
      </div>

      {/* Komponen Pagination */}
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}