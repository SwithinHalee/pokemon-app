"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  allPokemon: { name: string; url: string }[];
}

export default function PokemonSearch({ allPokemon }: Props) {
  // --- STATE ---
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; id: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getId = (url: string) => url.split("/").filter(Boolean).pop() || "0";

  // --- LOGIKA FILTER ---
  useEffect(() => {
    if (query.length > 1) { 
      const filtered = allPokemon
        .filter((p) => p.name.includes(query.toLowerCase()))
        .slice(0, 5) // Ambil 5 teratas
        .map((p) => ({ name: p.name, id: getId(p.url) }));
      
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, allPokemon]);

  // Handle Klik di luar (Tutup dropdown)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Navigasi
  const handleSelect = (name: string) => {
    setQuery(""); 
    setIsOpen(false); 
    router.push(`/pokemon/${name}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query && suggestions.length > 0) {
      handleSelect(suggestions[0].name);
    } else if (query) {
        handleSelect(query.toLowerCase());
    }
  };

  // --- RENDER ---
  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto mb-8 z-50">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search Pokemon..."
          className="w-full px-6 py-4 rounded-full border-none shadow-lg bg-white text-gray-700 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
          {suggestions.map((p) => (
            <button key={p.name} onClick={() => handleSelect(p.name)} className="w-full text-left px-6 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none">
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.name} className="w-8 h-8 object-contain" />
              <span className="font-bold text-gray-700 capitalize">{p.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.length > 1 && suggestions.length === 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 text-center text-gray-400 font-medium text-sm">No pokemon found</div>
      )}
    </div>
  );
}