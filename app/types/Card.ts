interface CardDetailProps {
  id: string;
  pack_id: string;
  name: string;
  rarity: string;
  category: string;
  img_url: string;
  img_full_url: string;
  colors: string[];
  cost: number;
  attributes: string[];
  power: number;
  counter: number | null;
  types: string[];
  effect: string;
  trigger: string | null;
}

interface StarterDeckDetailProps {
  id: string;
  quantity: number;
  pack_id: string;
  name: string;
  rarity: string;
  category: string;
  img_url: string;
  img_full_url: string;
  colors: string[];
  cost: number;
  attributes: string[];
  power: number;
  counter: number | null;
  types: string[];
  effect: string;
  trigger: string | null;
}

export type { CardDetailProps, StarterDeckDetailProps };
