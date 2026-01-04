const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
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

async function fetchMoveDetails(url: string): Promise<any> {
  try {
    return await fetchWithRetry(url, 1, 500); 
  } catch (error) {
    return null;
  }
}

async function calculateWeaknesses(types: any[]): Promise<string[]> {
  try {
    const damageMap: Record<string, number> = {};
    const typePromises = types.map((t) => fetchWithRetry(t.type.url));
    const typeDetails = await Promise.all(typePromises);

    typeDetails.forEach((typeData: any) => {
      const damageRelations = typeData.damage_relations;

      damageRelations.double_damage_from.forEach((t: any) => {
        damageMap[t.name] = (damageMap[t.name] || 1) * 2;
      });

      damageRelations.half_damage_from.forEach((t: any) => {
        damageMap[t.name] = (damageMap[t.name] || 1) * 0.5;
      });

      damageRelations.no_damage_from.forEach((t: any) => {
        damageMap[t.name] = (damageMap[t.name] || 1) * 0;
      });
    });

    const weaknesses = Object.keys(damageMap).filter((type) => damageMap[type] > 1);
    return weaknesses;
  } catch (error) {
    console.error("Gagal hitung weakness:", error);
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

    const weaknesses = await calculateWeaknesses(pokemon.types);

    const allMoves = [];
    const BATCH_SIZE = 15; 

    for (let i = 0; i < pokemon.moves.length; i += BATCH_SIZE) {
      const batch = pokemon.moves.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (moveEntry: any) => {
        const moveDetails = await fetchMoveDetails(moveEntry.move.url);
        if (!moveDetails) return null;

        return {
          name: moveDetails.name,
          type: moveDetails.type.name,
          category: moveDetails.damage_class.name,
          power: moveDetails.power,
          accuracy: moveDetails.accuracy,
          pp: moveDetails.pp,
          learn_details: moveEntry.version_group_details.map((vgd: any) => ({
            generation: vgd.version_group.name,
            level: vgd.level_learned_at,
            method: vgd.move_learn_method.name,
          })),
        };
      });

      const batchResults = await Promise.all(batchPromises);
      allMoves.push(...batchResults.filter((m) => m !== null));
    }

    const storyEntry = species.flavor_text_entries.find(
      (entry: any) => entry.language.name === "en"
    );
    const story = storyEntry
      ? storyEntry.flavor_text.replace(/[\n\f]/g, " ")
      : "No description available.";

    return {
      id: pokemon.id,
      name: pokemon.name,
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
      moves: allMoves,
      weaknesses,
      story,
      evolutions,
    };
  } catch (error) {
    console.error("Critical Error in getPokemon:", error);
    return null;
  }
}

async function getEvolutionChain(chain: any): Promise<any[]> {
  const speciesName = chain.species.name;
  const speciesUrl = chain.species.url;

  const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)\//);
  const id = idMatch ? parseInt(idMatch[1]) : 0;

  const types = await fetchPokemonTypes(speciesName);

  const currentEvo = {
    name: speciesName,
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
    return data.results.map((p: any) => {
      const urlParts = p.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 2]);
      return {
        id: id,
        name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      };
    });
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