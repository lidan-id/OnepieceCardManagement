import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const userId = params.id;

  const userDecks = await prisma.deck.findMany({ where: { userId: userId } });

  return NextResponse.json(userDecks);
}
