import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const {
    userId,
    name,
    leaderCardId,
    leaderCardImg,
    collection,
    newDeck,
    deckId,
  } = body;

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.userInventory.updateMany({
          where: { deckId: deckId },
          data: {
            deckId: null,
            isStoredInDeck: false,
          },
        });

        await tx.deck.delete({ where: { id: deckId, userId: userId } });
        const createDeck = await tx.deck.create({
          data: {
            userId: userId,
            name: name,
            leaderCardId: leaderCardId,
            leaderCardImg: leaderCardImg,
          },
        });
        for (const card of collection) {
          const availableCards = await tx.userInventory.findMany({
            where: {
              userId: userId,
              cardId: card.cardId,
              isStoredInDeck: true,
            },
            take: card.quantity,
            select: { id: true },
          });

          const idsToUpdate = availableCards.map((c) => c.id);

          await tx.userInventory.updateMany({
            where: { id: { in: idsToUpdate } },
            data: { isStoredInDeck: false, deckId: null },
          });
        }
        for (const card of newDeck) {
          const availableCards = await tx.userInventory.findMany({
            where: {
              userId: userId,
              cardId: card.cardId,
              isStoredInDeck: false,
            },
            take: card.quantity,
            select: { id: true },
          });

          if (availableCards.length < card.quantity) {
            throw new Error(
              `Stok kartu ${card.cardName} (${card.cardId}) tidak cukup.`,
            );
          }

          const idsToUpdate = availableCards.map((c) => c.id);
          await tx.userInventory.updateMany({
            where: { id: { in: idsToUpdate } },
            data: { isStoredInDeck: true, deckId: createDeck.id },
          });
        }
      },
      {
        maxWait: 5000,
        timeout: 20000,
      },
    );
    return NextResponse.json(
      { message: "Deck saved successfully" },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
