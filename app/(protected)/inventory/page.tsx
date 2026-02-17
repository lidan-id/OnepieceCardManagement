import InventoryClient from "@/app/components/inventory/InventoryClient";
import { TokenPayload } from "@/app/types/Token";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

const Inventory = async () => {
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

  const result = Object.values(groupedObject);

  return <InventoryClient userInventory={result} userData={userData} />;
};

export default Inventory;
