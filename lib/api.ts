const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/* Helper Fetch dengan retry logic dan error handling otomatis */
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  try {
    const res = await fetch(url, { next: { revalidate: 604800 } }); // Cache seminggu
    if (res.status === 404) throw new Error(`HTTP 404`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    if (err.message === "HTTP 404") throw err;
    if (retries <= 1) throw err;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}

/* Melengkapi list pokemon sederhana dengan data tipe asli (Lazy Enrichment) */
export async function enrichPokemonList(slimList: any[]) {
  const promises = slimList.map(async (p) => {
    try {
      const detail = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${p.id}`);
      return { ...p, types: detail.types.map((t: any) => t.type.name) };
    } catch (err) { return p; }
  });
  return await Promise.all(promises);
}

/* Fetch daftar tipe pokemon tertentu */
async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    return data.types.map((t: any) => t.type.name);
  } catch (error) { return []; }
}

/* Fetch data lengkap satu pokemon untuk halaman detail */
export async function getPokemon(name: string) {
  try {
    const pokemon = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    const species = await fetchWithRetry(pokemon.species.url);
    const evolutionChainUrl = species.evolution_chain.url;
    const evolutionData = await fetchWithRetry(evolutionChainUrl);
    const evolutions = await getEvolutionChain(evolutionData.chain);
    const storyEntry = species.flavor_text_entries.find((entry: any) => entry.language.name === "en");
    const story = storyEntry ? storyEntry.flavor_text.replace(/[\n\f]/g, " ") : "No description available.";
    const varieties = species.varieties.map((v: any) => ({ is_default: v.is_default, name: v.pokemon.name, url: v.pokemon.url }));

    return { id: pokemon.id, name: pokemon.name, speciesName: species.name, types: pokemon.types, height: pokemon.height, weight: pokemon.weight, abilities: pokemon.abilities, stats: pokemon.stats, sprites: pokemon.sprites, cries: pokemon.cries, story, evolutions, varieties, category: species.genera.find((g: any) => g.language.name === "en")?.genus || "Pokemon", gender_rate: species.gender_rate, held_items: pokemon.held_items || [], game_indices: pokemon.game_indices, moves: pokemon.moves };
  } catch (error) { return null; }
}

/* Logika rekursif untuk membangun evolution chain yang valid */
async function getEvolutionChain(chain: any): Promise<any[]> {
  const speciesUrl = chain.species.url;
  const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)\//);
  const id = idMatch ? parseInt(idMatch[1]) : 0;
  let validName = chain.species.name;
  try {
    const speciesData = await fetchWithRetry(speciesUrl);
    const defaultVariety = speciesData.varieties.find((v: any) => v.is_default);
    if (defaultVariety) validName = defaultVariety.pokemon.name;
  } catch (error) {}
  const types = await fetchPokemonTypes(validName);
  const currentEvo = { name: validName, id: id, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`, types: types };
  let nextEvos: any[] = [];
  if (chain.evolves_to.length > 0) {
    const promises = chain.evolves_to.map((nextChain: any) => getEvolutionChain(nextChain));
    const results = await Promise.all(promises);
    nextEvos = results.flat();
  }
  return [currentEvo, ...nextEvos];
}

/* Helper navigasi ke ID pokemon sebelumnya/berikutnya */
export async function getPreviousNextPokemon(currentId: number) {
  const checkPokemon = async (id: number) => {
    try {
      const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${id}`);
      return { id: data.id, name: data.name };
    } catch { return null; }
  };
  const [prev, next] = await Promise.all([currentId > 1 ? checkPokemon(currentId - 1) : null, checkPokemon(currentId + 1)]);
  return { prevPokemon: prev, nextPokemon: next };
}

/* Ambil daftar pokemon dengan pagination */
export async function getPokemonList(limit: number = 24, offset: number = 0) {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const basicList = data.results.map((p: any) => {
      const urlParts = p.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      return { id: id, name: p.name, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`, types: [] };
    });
    return await enrichPokemonList(basicList);
  } catch (error) { return []; }
}

/* Ambil daftar pokemon berdasarkan tipe tertentu */
export async function getPokemonByType(type: string) {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/type/${type}`);
    return data.pokemon.map((p: any) => {
      const urlParts = p.pokemon.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      return { id: id, name: p.pokemon.name, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`, types: [type] };
    });
  } catch (error) { return []; }
}

/* Ambil daftar semua nama pokemon untuk search (Limit 2000) */
export async function getAllPokemonSlim() {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon?limit=2000`);
    return data.results.map((p: any) => {
      const urlParts = p.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      return { name: p.name, id: id };
    });
  } catch (error) { return []; }
}