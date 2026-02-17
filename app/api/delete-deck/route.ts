import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const body = await request.json();
  const { deckId, userId } = body;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.userInventory.updateMany({
        where: { deckId: deckId },
        data: {
          deckId: null,
          isStoredInDeck: false,
        },
      });

      await tx.deck.delete({ where: { id: deckId, userId: userId } });
    });
    return NextResponse.json({ message: "Delete success" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
