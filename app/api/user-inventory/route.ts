import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      cardId,
      cardName,
      cardImgUrl,
      colors,
      isStoredDeck,
      purchasePrice,
      quantity,
      cardCategory,
    } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    const dataToInsert = Array.from({ length: quantity }).map(() => ({
      userId: userId,
      cardId: cardId,
      cardName: cardName,
      cardImgUrl: cardImgUrl,
      color: colors,
      isStoredInDeck: isStoredDeck,
      purchasePrice: purchasePrice,
      deckId: null,
      cardCategory: cardCategory,
    }));
    const totalCost = purchasePrice * quantity;
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.balance < totalCost) {
        throw new Error("Insufficient funds");
      }

      await tx.userInventory.createMany({
        data: dataToInsert,
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: totalCost,
          },
        },
      });

      return updatedUser;
    });
    return NextResponse.json({ message: "Purchase Complete" }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Insufficient funds") {
      return NextResponse.json(
        { message: "Insufficient funds" },
        { status: 400 },
      );
    }

    if (error.message === "User not found") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
