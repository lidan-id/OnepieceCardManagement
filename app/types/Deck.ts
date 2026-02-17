import { UserInventory } from "./UserInventory";

interface UserDeck {
  id: string;
  userId: string;
  name: string;
  leaderCardId: string | null;
  leaderCardImg: string;
  cards: UserInventory[];
}
export type { UserDeck };
