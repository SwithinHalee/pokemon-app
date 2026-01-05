"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPokemonList, getPokemonByType, enrichPokemonList } from "@/lib/api";
import { TYPE_COLORS, GENERATION_DATA } from "@/lib/constants";

interface PokemonSlim {
  id: number;
  name: string;
  image: string;
  types: string[];
}

interface Props {
  initialData: PokemonSlim[];
}

const STORAGE_KEY = "pokedex_state";

// Komponen daftar pokemon di halaman utama (Client Side)
export default function PokemonListClient({ initialData }: Props) {
  const [pokemons, setPokemons] = useState<PokemonSlim[]>(initialData);
  const [filteredMasterList, setFilteredMasterList] = useState<PokemonSlim[]>([]);
  const [offset, setOffset] = useState(24);
  const [localPage, setLocalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeGen, setActiveGen] = useState<string>(""); 
  const [activeType, setActiveType] = useState<string>("");
  const [isRestored, setIsRestored] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Ref untuk mencegah data lama menimpa data baru saat berpindah filter dengan cepat
  const lastRequestId = useRef<number>(0);

  // Restore posisi scroll dan state filter saat kembali dari halaman detail
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { data, scroll, loadedOffset, gen, type, master, filterOpen } = JSON.parse(savedState);
      setPokemons(data);
      setOffset(loadedOffset);
      setActiveGen(gen || "");
      setActiveType(type || "");
      setFilteredMasterList(master || []);
      if (filterOpen !== undefined) setIsFilterOpen(filterOpen);
      
      setTimeout(() => {
        window.scrollTo({ top: scroll, behavior: "instant" });
        setIsRestored(true);
      }, 0);
    } else {
      setIsRestored(true);
    }
  }, []);

  // Listener untuk tombol Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simpan status saat ini sebelum navigasi ke detail
  const saveScrollPosition = () => {
    const stateToSave = {
      data: pokemons,
      scroll: window.scrollY,
      loadedOffset: offset,
      gen: activeGen,
      type: activeType,
      master: filteredMasterList,
      filterOpen: isFilterOpen
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  // Logika filter pokemon berdasarkan Tipe dan Generasi
  const handleFilterChange = async (genId: string, typeName: string) => {
    const requestId = Date.now();
    lastRequestId.current = requestId;

    setLoading(true);
    setPokemons([]);
    setFilteredMasterList([]);
    setHasMore(true);
    setLocalPage(1);
    setOffset(0);
    
    setActiveGen(genId);
    setActiveType(typeName);

    try {
      let results: PokemonSlim[] = [];

      // Reset ke kondisi awal jika filter dihapus
      if (!genId && !typeName) {
        results = await getPokemonList(24, 0); 
        if (lastRequestId.current !== requestId) return;
        setPokemons(results);
        setOffset(24);
        setLoading(false);
        return;
      }

      // Ambil data filter spesifik
      if (typeName) {
        results = await getPokemonByType(typeName); 
        if (genId) {
          const gen = GENERATION_DATA.find(g => g.id === genId);
          if (gen) {
            results = results.filter(p => p.id >= (gen.offset + 1) && p.id <= (gen.offset + gen.limit));
          }
        }
      } 
      else if (genId) {
        const gen = GENERATION_DATA.find(g => g.id === genId);
        if (gen) {
          results = await getPokemonList(gen.limit, gen.offset); 
        }
      }

      if (lastRequestId.current !== requestId) return;

      setFilteredMasterList(results);
      
      const pageSize = 24;
      const initialSlice = results.slice(0, pageSize);
      
      // Perkayaan data tipe (Grass/Poison) secara dinamis
      let enrichedSlice = initialSlice;
      if (typeName) {
         enrichedSlice = await enrichPokemonList(initialSlice);
      }

      if (lastRequestId.current !== requestId) return;

      setPokemons(enrichedSlice);
      setHasMore(results.length > pageSize);

    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      if (lastRequestId.current === requestId) {
        setLoading(false);
      }
    }
  };

  // Logika muat data lebih banyak (Infinity Scroll manual)
  const loadMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (activeGen || activeType) {
        // Pagination dari memori lokal jika mode filter aktif
        const pageSize = 24;
        const nextIdx = localPage * pageSize;
        const nextSlice = filteredMasterList.slice(nextIdx, nextIdx + pageSize);

        if (nextSlice.length > 0) {
          let enrichedSlice = nextSlice;
          if (activeType) {
             enrichedSlice = await enrichPokemonList(nextSlice);
          }
          setPokemons(prev => [...prev, ...enrichedSlice]);
          setLocalPage(prev => prev + 1);
          if (nextIdx + pageSize >= filteredMasterList.length) setHasMore(false);
        } else {
          setHasMore(false);
        }
      } 
      else {
        // Pagination dari API jika mode normal
        const newPokemons = await getPokemonList(24, offset);
        if (newPokemons.length === 0) {
          setHasMore(false);
        } else {
          setPokemons((prev) => [...prev, ...newPokemons]);
          setOffset((prev) => prev + 24);
        }
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeGenName = GENERATION_DATA.find(g => g.id === activeGen)?.name;

  if (!isRestored) return <div className="min-h-screen"></div>;

  return (
    <div className="pb-10 relative">
      {/* Panel Filter Collapsible */}
      <div className="mb-6 -mt-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-lg shadow-blue-900/5 overflow-hidden">
          {/* Filter Header */}
          <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex items-center gap-2 text-gray-800 font-extrabold text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                <span>Filters</span>
              </div>
              {!isFilterOpen && (
                <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pl-2">
                  {activeGen && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap border border-blue-200">{activeGenName}</span>}
                  {activeType && <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border text-white ${TYPE_COLORS[activeType]}`}>{activeType}</span>}
                  {!activeGen && !activeType && <span className="text-xs text-gray-400 font-medium italic">All Pokemon</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
               {(activeGen || activeType) && <button onClick={(e) => { e.stopPropagation(); handleFilterChange("", ""); }} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-full hover:bg-red-50">Reset</button>}
              <div className={`p-2 rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${isFilterOpen ? "rotate-180 bg-gray-100 text-gray-600" : ""}`}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></div>
            </div>
          </div>

          {/* Filter Content */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFilterOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="p-6 pt-0 border-t border-gray-100">
              <div className="mb-6 mt-4">
                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase mb-3">Region / Generation</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleFilterChange("", activeType)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeGen === "" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-100"}`}>All</button>
                  {GENERATION_DATA.map((gen) => (
                    <button key={gen.id} onClick={() => handleFilterChange(gen.id, activeType)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeGen === gen.id ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:text-blue-600"}`}>{gen.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase mb-3">Pokemon Type</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleFilterChange(activeGen, "")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeType === "" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-100"}`}>All</button>
                  {Object.keys(TYPE_COLORS).map((type) => (
                    type !== 'unknown' && type !== 'shadow' && (
                      <button key={type} onClick={() => handleFilterChange(activeGen, activeType === type ? "" : type)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize border ${activeType === type ? `${TYPE_COLORS[type]} text-white border-transparent` : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}>{type}</button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Utama Pokemon */}
      {pokemons.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
           <p className="text-gray-500 font-bold mb-1">No Pokemon Found</p>
           <button onClick={() => handleFilterChange("", "")} className="text-blue-600 text-sm font-bold hover:underline">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 animate-fadeIn">
          {pokemons.map((pokemon) => (
            <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`} onClick={saveScrollPosition} className="group relative bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 block">
              <span className="absolute top-4 right-6 text-5xl font-extrabold text-gray-100/80 z-0 group-hover:text-gray-200/50">#{String(pokemon.id).padStart(3, "0")}</span>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 mb-5 relative transition-transform duration-300 group-hover:scale-110"><Image src={pokemon.image} alt={pokemon.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={false}/></div>
                <h2 className="text-lg font-extrabold text-gray-800 capitalize tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{pokemon.name.replace("-", " ")}</h2>
                <div className="flex gap-1.5 justify-center">{pokemon.types.map((type) => ( <span key={type} className={`${TYPE_COLORS[type] || "bg-gray-400"} text-white text-[10px] font-bold px-3 py-1 rounded-full capitalize shadow-sm`}>{type}</span> ))}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Button Muat Lebih Banyak */}
      {hasMore && (
        <div className="flex justify-center">
          <button onClick={loadMore} disabled={loading} className="px-8 py-3 bg-white border border-gray-100 text-gray-800 rounded-full font-bold shadow-lg shadow-gray-200/50 hover:bg-gray-50 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 group">
            {loading ? <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span>Load More</span>}
          </button>
        </div>
      )}

      <button onClick={scrollToTop} className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gray-900 text-white shadow-2xl transition-all duration-500 ease-in-out transform hover:bg-black hover:scale-110 active:scale-95 ${showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg></button>
    </div>
  );
}