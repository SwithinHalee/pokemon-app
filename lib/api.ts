import { PokemonDetail, PokemonListResponse, EvolutionSpecies } from "../types";

const BASE_URL = "https://pokeapi.co/api/v2";
// Cache 24 jam
const CACHE_CONFIG = { next: { revalidate: 86400 } };

// --- KONFIGURASI NETWORK (SERVER SIDE) ---

// Fix: Paksa DNS IPv4 agar fetch tidak timeout di server tertentu
if (typeof window === "undefined") {
  import("node:dns").then((dns) => {
    try {
      if (typeof dns.setDefaultResultOrder === "function") {
        dns.setDefaultResultOrder("ipv4first");
      }
    } catch (e) { /*baikan jika gagal*/ }
  });
}

// Helper: Buat HTTPS Agent (Keep-Alive) secara dinamis
// Mencegah error "Module not found" di browser
async function getAgent() {
  if (typeof window === "undefined") {
    try {
      const https = await import("node:https");
      return new https.Agent({ keepAlive: true, family: 4 });
    } catch (e) { return undefined; }
  }
  return undefined;
}

// --- HELPER FETCH UTAMA ---

async function fetchWithRetry(url: string, options?: RequestInit, retries = 3, backoff = 2000): Promise<Response> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // Timeout 30 detik

    // Ambil agent jika di server
    const agent = await getAgent();
    const fetchOptions: any = { ...options, signal: controller.signal };
    if (agent) fetchOptions.agent = agent;

    const res = await fetch(url, fetchOptions);
    clearTimeout(id);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;

  } catch (err: any) {
    if (retries <= 1) {
      console.error(`💀 Fetch Gagal [${url}]:`, err.message);
      throw err;
    }
    // Retry jika gagal
    if (typeof window === "undefined") console.warn(`⚠️ Retry... [${url}]`);
    await new Promise((r) => setTimeout(r, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
  }
}

// --- API PUBLIC ---

// Ambil list pokemon (Pagination)
export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, CACHE_CONFIG);
    return res.json();
  } catch (error) {
    console.error("❌ Error List:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

// Ambil index semua nama pokemon (Untuk Search Bar)
export async function getAllPokemonSlim(): Promise<{ name: string; url: string }[]> {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/pokemon?limit=10000&offset=0`, CACHE_CONFIG);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("❌ Error Search Index:", error);
    return [];
  }
}

// Ambil detail lengkap pokemon + species + evolusi
export async function getPokemonDetail(name: string): Promise<PokemonDetail> {
  try {
    // 1. Data Utama
    const res = await fetchWithRetry(`${BASE_URL}/pokemon/${name}`, CACHE_CONFIG);
    const pokemonData = await res.json();

    // 2. Data Species (Deskripsi, Gender)
    const speciesRes = await fetchWithRetry(pokemonData.species.url, CACHE_CONFIG);
    const speciesData = await speciesRes.json();
    
    // Format Deskripsi (Hapus karakter aneh)
    const storyEntry = speciesData.flavor_text_entries.find((e: any) => e.language.name === "en");
    const story = storyEntry ? storyEntry.flavor_text.replace(/[\f\n]/g, " ") : "No description.";
    
    const genusEntry = speciesData.genera.find((e: any) => e.language.name === "en");
    const category = genusEntry ? genusEntry.genus.replace(" Pokémon", "") : "Unknown";

    // 3. Data Evolusi
    const evoRes = await fetchWithRetry(speciesData.evolution_chain.url, CACHE_CONFIG);
    const evoData = await evoRes.json();
    const rawEvolutions = parseEvolutionChain(evoData.chain);

    // 4. Perkaya data evolusi dengan Tipe (Sequential Loop)
    const evolutionsWithTypes: EvolutionSpecies[] = [];
    for (const evo of rawEvolutions) {
      try {
        const types = await fetchPokemonTypes(evo.name);
        evolutionsWithTypes.push({ ...evo, types });
      } catch {
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
    console.error(`❌ Error Detail ${name}:`, error);
    throw error;
  }
}

export async function getPokemonNameById(id: number): Promise<string | null> {
  if (id < 1) return null; // Tidak ada pokemon dengan ID < 1
  try {
    // Kita gunakan endpoint utama, tapi tujuannya cuma ambil namanya
    const res = await fetchWithRetry(`${BASE_URL}/pokemon/${id}`, { next: { revalidate: 604800 } }); // Cache seminggu
    const data = await res.json();
    return data.name;
  } catch (error) {
    // Jangan log error ini, karena wajar jika ID tidak ditemukan (misal di ujung list)
    return null;
  }
}

// --- UTILITIES ---

function getIdFromUrl(url: string): string {
  return url.split("/").filter(Boolean).pop() || "0";
}

// Rekursif: Flatkan tree evolusi menjadi array
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
  } catch { return ["normal"]; }
}