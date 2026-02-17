import { UserInventory } from "./UserInventory";

interface Marketplace {
  id: string;
  inventory: UserInventory;
  inventoryId: string;
  price: number;
  sellerId: string;
}
export type { Marketplace };
