import DeckBuilderClient from "@/app/components/deck-builder/DeckBuilderClient";
import { TokenPayload } from "@/app/types/Token";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

const Deckbuilder = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id: id },
    include: {
      cards: true,
    },
  });
  let existDeck: any = [];
  if (deck) {
    const groupedObjectExistDeck = deck.cards.reduce(
      (acc, item) => {
        if (acc[item.cardId] && !item.isListed) {
          acc[item.cardId].quantity += 1;
          if (item.isStoredInDeck) {
            acc[item.cardId].storedDeckQuantity += 1;
          }
        } else if (!item.isListed) {
          acc[item.cardId] = { ...item, quantity: 1, storedDeckQuantity: 0 };
          if (item.isStoredInDeck) {
            acc[item.cardId].storedDeckQuantity += 1;
          }
        }
        return acc;
      },
      {} as Record<string, any>,
    );
    existDeck = Object.values(groupedObjectExistDeck);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  let userData: TokenPayload | null = null;

  if (token) {
    try {
      userData = jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.log("invalid token");
    }
  }

  const userInventory = userData
    ? await prisma.userInventory.findMany({
        where: {
          userId: userData.id,
        },
      })
    : [];

  const groupedObject = userInventory.reduce(
    (acc, item) => {
      if (acc[item.cardId] && !item.isListed && !item.isStoredInDeck) {
        acc[item.cardId].quantity += 1;
        if (item.isStoredInDeck) {
          acc[item.cardId].storedDeckQuantity += 1;
        }
      } else if (!item.isListed && !item.isStoredInDeck) {
        acc[item.cardId] = { ...item, quantity: 1, storedDeckQuantity: 0 };
        if (item.isStoredInDeck) {
          acc[item.cardId].storedDeckQuantity += 1;
        }
      }
      return acc;
    },
    {} as Record<string, any>,
  );
  const result = Object.values(groupedObject);
  return (
    <DeckBuilderClient
      userInventory={result}
      userData={userData}
      existDeck={existDeck}
      paramsId={id}
    />
  );
};

export default Deckbuilder;
