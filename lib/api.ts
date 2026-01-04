const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 604800 }, 
    });

    if (res.status === 404) throw new Error(`HTTP 404`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    return await res.json();
  } catch (err: any) {
    if (err.message === "HTTP 404") throw err;
    if (retries <= 1) {
      console.error(`💀 Fetch Gagal [${url}]:`, err.message);
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}

async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    return data.types.map((t: any) => t.type.name);
  } catch (error) {
    return [];
  }
}

export async function getPokemon(name: string) {
  try {
    const pokemon = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${name}`);
    const species = await fetchWithRetry(pokemon.species.url);

    const evolutionChainUrl = species.evolution_chain.url;
    const evolutionData = await fetchWithRetry(evolutionChainUrl);
    const evolutions = await getEvolutionChain(evolutionData.chain);

    const storyEntry = species.flavor_text_entries.find(
      (entry: any) => entry.language.name === "en"
    );
    const story = storyEntry
      ? storyEntry.flavor_text.replace(/[\n\f]/g, " ")
      : "No description available.";
    
    const varieties = species.varieties.map((v: any) => ({
      is_default: v.is_default,
      name: v.pokemon.name,
      url: v.pokemon.url
    }));

    return {
      id: pokemon.id,
      name: pokemon.name,
      speciesName: species.name,
      types: pokemon.types,
      height: pokemon.height,
      weight: pokemon.weight,
      abilities: pokemon.abilities,
      stats: pokemon.stats,
      sprites: pokemon.sprites,
      cries: pokemon.cries,
      held_items: pokemon.held_items || [],
      category: species.genera.find((g: any) => g.language.name === "en")?.genus || "Pokemon",
      gender_rate: species.gender_rate,
      game_indices: pokemon.game_indices,
      moves: pokemon.moves, 
      story,
      evolutions,
      varieties,
    };
  } catch (error) {
    console.error("Critical Error in getPokemon:", error);
    return null;
  }
}

async function getEvolutionChain(chain: any): Promise<any[]> {
  const speciesUrl = chain.species.url;
  const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)\//);
  const id = idMatch ? parseInt(idMatch[1]) : 0;
  let validName = chain.species.name;
  
  try {
    const speciesData = await fetchWithRetry(speciesUrl);
    const defaultVariety = speciesData.varieties.find((v: any) => v.is_default);
    if (defaultVariety) {
      validName = defaultVariety.pokemon.name;
    }
  } catch (error) {
    console.warn(`Failed to resolve variety for ${validName}, using species name.`);
  }

  const types = await fetchPokemonTypes(validName);

  const currentEvo = {
    name: validName,
    id: id,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    types: types,
  };

  let nextEvos: any[] = [];
  if (chain.evolves_to.length > 0) {
    const promises = chain.evolves_to.map((nextChain: any) => getEvolutionChain(nextChain));
    const results = await Promise.all(promises);
    nextEvos = results.flat();
  }

  return [currentEvo, ...nextEvos];
}

export async function getPreviousNextPokemon(currentId: number) {
  const checkPokemon = async (id: number) => {
    try {
      const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${id}`);
      return { id: data.id, name: data.name };
    } catch {
      return null;
    }
  };

  const [prev, next] = await Promise.all([
    currentId > 1 ? checkPokemon(currentId - 1) : null,
    checkPokemon(currentId + 1),
  ]);

  return { prevPokemon: prev, nextPokemon: next };
}

export async function getPokemonList(limit: number = 24, offset: number = 0) {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    
    const detailedPromises = data.results.map(async (p: any) => {
      const urlParts = p.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      
      let types: string[] = [];
      try {
        const detail = await fetchWithRetry(p.url);
        types = detail.types.map((t: any) => t.type.name);
      } catch (err) {
        console.error(`Failed to fetch types for ${p.name}`);
      }

      return {
        id: id,
        name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        types: types,
      };
    });

    return await Promise.all(detailedPromises);
  } catch (error) {
    console.error("Failed to fetch pokemon list:", error);
    return [];
  }
}

export async function getAllPokemonSlim() {
  try {
    const data = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon?limit=2000`);
    return data.results.map((p: any) => {
      const urlParts = p.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      return { name: p.name, id: id };
    });
  } catch (error) {
    console.error("Failed to fetch all pokemon slim:", error);
    return [];
  }
}