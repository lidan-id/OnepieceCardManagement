interface UserInventory {
  id: string;
  userId: string;
  cardId: string;
  cardName: string;
  cardImgUrl: string;
  color: string[];
  isStoredInDeck: boolean;
  purchasePrice: number;
  deckId: string | null;
  isListed: boolean;
  cardCategory: string;
}

export type { UserInventory };
