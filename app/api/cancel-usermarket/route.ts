import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const body = await request.json();
  const { marketId, userId } = body;

  try {
    await prisma.$transaction(async (tx) => {
      const marketItem = await tx.marketplace.findUnique({
        where: { id: marketId },
        select: { sellerId: true, inventoryId: true },
      });
      if (!marketItem || marketItem.sellerId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized or item not found" },
          { status: 401 },
        );
      }

      await tx.marketplace.delete({
        where: { id: marketId },
      });

      await tx.userInventory.update({
        where: { id: marketItem.inventoryId },
        data: { isListed: false },
      });
    });

    return NextResponse.json({ message: "Market item cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling market item:", error);
    return NextResponse.json(
      { error: "Failed to cancel market item" },
      { status: 500 },
    );
  }
}
