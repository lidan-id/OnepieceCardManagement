import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, sellerId, price, quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const availableCards = await tx.userInventory.findMany({
        where: {
          userId: sellerId,
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

      const dataToInsert = availableCards.map((item) => ({
        inventoryId: item.id,
        sellerId: sellerId,
        price: price,
      }));

      await tx.marketplace.createMany({
        data: dataToInsert,
      });

      await tx.userInventory.updateMany({
        where: {
          id: { in: availableCards.map((c) => c.id) },
        },
        data: {
          isListed: true,
        },
      });
    });

    return NextResponse.json(
      { message: "Added to Marketplace" },
      { status: 200 },
    );
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
