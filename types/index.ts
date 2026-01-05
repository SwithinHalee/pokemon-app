/* Interface utama untuk data TypeScript project */

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string; }[];
}

export interface EvolutionSpecies {
  id: string;
  name: string;
  image: string;
  min_level: number | null;
  types: string[]; 
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: { ability: { name: string; url: string }; is_hidden: boolean; }[];
  types: { slot: number; type: { name: string; url: string }; }[];
  stats: { base_stat: number; stat: { name: string }; }[];
  sprites: { front_default: string; other: { "official-artwork": { front_default: string; front_shiny: string; }; }; };
  cries: { latest: string; };
  story: string;
  category: string;
  gender_rate: number; 
  evolutions: EvolutionSpecies[];
  held_items: { item: { name: string; url: string }; }[];
  game_indices: { game_index: number; version: { name: string; url: string }; }[];
  moves: { move: { name: string; url: string }; }[];
}