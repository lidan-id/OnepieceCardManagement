import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PACK_PRICE = 600;

export async function POST(req: Request) {
  try {
    const { userId, packId, packName } = await req.json();

    if (!userId || !packId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check availability and balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.balance < PACK_PRICE) {
        throw new Error("Insufficient balance");
      }

      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: PACK_PRICE } },
      });

      // Add pack to inventory
      const newPack = await tx.userPack.create({
        data: {
          userId,
          packId,
          packName: packName || "Unknown Pack",
        },
      });

      return { user: updatedUser, pack: newPack };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error buying pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to buy pack" },
      { status: 500 },
    );
  }
}
