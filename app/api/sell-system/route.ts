import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

const priceList = {
  Common: 10,
  Uncommon: 20,
  Rare: 30,
  SuperRare: 50,
  SecretRare: 100,
  Special: 500,
  Promo: 40,
  Leader: 10,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, quantity, userId } = body;

    const jsonPath = path.join(
      process.cwd(),
      "public",
      "data",
      "master-cards.json",
    );
    const fileContents = await readFile(jsonPath, "utf8");
    const allCards = JSON.parse(fileContents);

    const cardData = allCards.find((c: any) => c.id === cardId);

    if (!cardData) {
      return NextResponse.json(
        { message: "Card not found in database" },
        { status: 404 },
      );
    }

    const rarity = cardData.rarity as keyof typeof priceList;
    const unitPrice = priceList[rarity] || 0;
    const totalRefund = unitPrice * quantity;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const availableCards = await tx.userInventory.findMany({
        where: {
          userId: userId,
          cardId: cardId,
          isStoredInDeck: false,
          isListed: false,
        },
        take: quantity,
        select: { id: true },
      });

      if (availableCards.length < quantity) {
        throw new Error("Not enough cards");
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: totalRefund } },
      });

      const cardIdsToDelete = availableCards.map((card) => card.id);

      await tx.userInventory.deleteMany({
        where: {
          id: {
            in: cardIdsToDelete,
          },
        },
      });
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Not enough cards") {
      return NextResponse.json(
        { message: "Jumlah kartu tidak cukup atau sedang dipakai di Deck" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
