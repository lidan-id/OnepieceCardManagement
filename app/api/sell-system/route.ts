import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, quantity, userId } = body;

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
        select: { id: true, purchasePrice: true },
      });

      if (availableCards.length < quantity) {
        throw new Error("Not enough cards");
      }

      const totalPrice = availableCards.reduce(
        (sum, card) => sum + (Math.max(0, card.purchasePrice / 2) || 0),
        0,
      );

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: totalPrice } },
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
