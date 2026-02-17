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
  counter?: number;
  types: string[];
  effect: string;
  trigger?: string;
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
  counter?: number;
  types: string[];
  effect: string;
  trigger?: string;
}

export type { CardDetailProps, StarterDeckDetailProps };
