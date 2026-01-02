export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonBasicInfo[];
}

export interface PokemonBasicInfo {
  name: string;
  url: string;
}

export interface EvolutionSpecies {
  id: string;
  name: string;
  image: string;
  min_level?: number;
  types: string[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  story: string;
  category: string;
  gender_rate: number;
  // --- UPDATE BARU DARI SINI ---
  cries: {
    latest: string; // 
    legacy: string; // 
  };
  held_items: {     // 
    item: {
      name: string;
      url: string;
    };
  }[];
  game_indices: {   // 
    version: {
      name: string;
    };
  }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string; // 
        front_shiny: string;   // 
      };
    };
  };
  // ... sisanya (types, stats, abilities, moves, evolutions) tetap sama
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  moves: {
    move: {
      name: string;
      url: string;
    };
  }[];
  evolutions: EvolutionSpecies[]; 
}