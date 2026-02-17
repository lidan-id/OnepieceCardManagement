import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      marketplaceId,
      userId,
      sellerId,
      cardId,
      cardName,
      cardImgUrl,
      colors,
      isStoredDeck,
      purchasePrice,
      cardCategory,
    } = body;

    if (
      !userId ||
      !sellerId ||
      purchasePrice === undefined ||
      purchasePrice < 0
    ) {
      return NextResponse.json(
        { message: "Data transaksi tidak valid" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const buyer = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });

      if (!buyer) {
        throw new Error("BUYER_NOT_FOUND");
      }

      if (buyer.balance < purchasePrice) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: purchasePrice },
        },
      });

      await tx.user.update({
        where: { id: sellerId },
        data: {
          balance: { increment: purchasePrice },
        },
      });

      await tx.userInventory.create({
        data: {
          userId: userId,
          cardId: cardId,
          cardName: cardName,
          cardImgUrl: cardImgUrl,
          color: colors,
          isStoredInDeck: isStoredDeck || false,
          purchasePrice: purchasePrice,
          deckId: null,
          cardCategory: cardCategory,
        },
      });

      await tx.marketplace.delete({
        where: { id: marketplaceId },
      });
    });

    return NextResponse.json(
      { message: "Transaction & Inventory update complete" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Transaction Error:", error);

    if (error.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { message: "Saldo tidak mencukupi" },
        { status: 400 },
      );
    }

    if (error.message === "BUYER_NOT_FOUND") {
      return NextResponse.json(
        { message: "Pembeli tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
