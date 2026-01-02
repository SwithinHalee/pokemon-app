import { PokemonDetail, PokemonListResponse, EvolutionSpecies } from "../types";
import dns from "node:dns"; // Import module DNS Node.js

// === SOLUSI PAMUNGKAS: PAKSA IPV4 DI LEVEL KODE ===
// Ini memaksa Node.js untuk tidak menggunakan IPv6 sama sekali saat fetch
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Abaikan jika error (misal di environment non-Node)
}

const BASE_URL = "https://pokeapi.co/api/v2";
// Cache 24 jam
const CACHE_CONFIG = { next: { revalidate: 86400 } };

// === HELPER FETCH DENGAN RETRY & TIMEOUT KUAT ===
async function fetchWithRetry(url: string, options?: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const controller = new AbortController();
    
    // UPDATE: Timeout diperpanjang jadi 30 detik! 
    // Koneksi pertama kali seringkali butuh waktu lama untuk handshake.
    const id = setTimeout(() => controller.abort(), 30000); 

    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err: any) { // Tangkap error lengkap
    if (retries <= 1) {
      console.error(`💀 Gagal Fetch Final [${url}]:`, err.message || err);
      throw err;
    }
    
    // Log peringatan santai agar kita tahu server sedang berusaha
    console.warn(`⚠️ Koneksi lambat, mencoba ulang... (${retries - 1} sisa) - ${url}`);
    
    await new Promise((r) => setTimeout(r, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2); // Exponential backoff (1s, 2s, 4s)
  }
}

// === 1. GET LIST ===
export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  try {
    const res = await fetchWithRetry(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, 
      CACHE_CONFIG
    );
    return res.json();
  } catch (error) {
    console.error("❌ Gagal di getPokemonList:", error);
    // Return empty fallback agar halaman tidak error 500
    return { count: 0, next: null, previous: null, results: [] };
  }
}

// === HELPER FUNCTIONS ===
function getIdFromUrl(url: string): string {
  return url.split("/").filter(Boolean).pop() || "0";
}

function parseEvolutionChain(chain: any): EvolutionSpecies[] {
  const speciesId = getIdFromUrl(chain.species.url);
  const evo: EvolutionSpecies = {
    id: speciesId,
    name: chain.species.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
    min_level: chain.evolution_details[0]?.min_level || null,
    types: [],
  };

  let nextEvos: EvolutionSpecies[] = [];
  if (chain.evolves_to.length > 0) {
    nextEvos = parseEvolutionChain(chain.evolves_to[0]);
  }
  return [evo, ...nextEvos];
}

async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/pokemon/${name}`, CACHE_CONFIG);
    const data = await res.json();
    return data.types.map((t: any) => t.type.name);
  } catch (error) {
    return ["normal"]; 
  }
}

// === 2. GET DETAIL ===
export async function getPokemonDetail(name: string): Promise<PokemonDetail> {
  try {
    // A. Main Data
    const res = await fetchWithRetry(`${BASE_URL}/pokemon/${name}`, CACHE_CONFIG);
    const pokemonData = await res.json();

    // B. Species Data
    const speciesRes = await fetchWithRetry(pokemonData.species.url, CACHE_CONFIG);
    const speciesData = await speciesRes.json();

    const storyEntry = speciesData.flavor_text_entries.find((entry: any) => entry.language.name === "en");
    const story = storyEntry ? storyEntry.flavor_text.replace(/[\f\n]/g, " ") : "No description available.";

    const generaEntry = speciesData.genera.find((entry: any) => entry.language.name === "en");
    const category = generaEntry ? generaEntry.genus.replace(" Pokémon", "") : "Unknown";

    // C. Evolution Data
    const evoRes = await fetchWithRetry(speciesData.evolution_chain.url, CACHE_CONFIG);
    const evoData = await evoRes.json();
    const rawEvolutions = parseEvolutionChain(evoData.chain);

    // D. Enrichment (Sequential Loop)
    const evolutionsWithTypes: EvolutionSpecies[] = [];
    for (const evo of rawEvolutions) {
      try {
        const types = await fetchPokemonTypes(evo.name);
        evolutionsWithTypes.push({ ...evo, types });
      } catch (err) {
        evolutionsWithTypes.push({ ...evo, types: ["normal"] });
      }
    }

    return {
      ...pokemonData,
      story,
      category,
      gender_rate: speciesData.gender_rate,
      evolutions: evolutionsWithTypes,
    };

  } catch (error) {
    console.error(`❌ CRITICAL ERROR di Detail ${name}:`, error);
    throw error;
  }
}