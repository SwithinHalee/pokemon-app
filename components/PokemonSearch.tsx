"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  allPokemon: { name: string; id: number }[];
}

// Sub-komponen untuk menampilkan gambar di hasil pencarian
const SearchItemImage = ({ id, name }: { id: number; name: string }) => {
  const [error, setError] = useState(false);
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  if (error) return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-blue-600 uppercase">{name.substring(0, 2)}</span></div>;
  return <img src={src} alt={name} className="w-8 h-8 object-contain" onError={() => setError(true)} />;
};

// Komponen pencarian cerdas dengan suggestion
export default function PokemonSearch({ allPokemon }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; id: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Logika filtering suggestion berdasarkan input 
  useEffect(() => {
    if (query.length === 0) { setSuggestions([]); setIsOpen(false); return; }
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = allPokemon
        .filter((p) => p.name.toLowerCase().includes(lowerQuery) || String(p.id).includes(lowerQuery))
        .slice(0, 5);
      setSuggestions(filtered);
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, allPokemon]);

  // Tutup suggestion jika klik di luar area 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => { setIsOpen(false); router.push(`/pokemon/${name}`); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) handleSelect(suggestions[0].name);
    else if (query) handleSelect(query.toLowerCase());
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto mb-0 z-50">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input type="text" placeholder="Search by Name or ID..." className="w-full px-6 py-4 rounded-full border-none shadow-lg bg-white text-gray-700 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => query.length > 0 && setIsOpen(true)} />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> </button>
      </form>
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
          {suggestions.length > 0 ? suggestions.map((p) => (
              <button key={p.name} onClick={() => handleSelect(p.name)} onMouseEnter={() => router.prefetch(`/pokemon/${p.name}`)} className="w-full text-left px-6 py-3 hover:bg-blue-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-none">
                <div className="flex items-center gap-3">
                    <SearchItemImage id={p.id} name={p.name} />
                    <div className="flex flex-col">
                    <span className="font-bold text-gray-700 capitalize">{p.name.replace("-", " ")}</span>
                    <span className="text-xs text-gray-400 font-bold">#{String(p.id).padStart(3, "0")}</span>
                    </div>
                </div>
              </button>
            )) : <div className="p-4 text-center text-gray-400 font-medium text-sm">No pokemon found</div>}
        </div>
      )}
    </div>
  );
}