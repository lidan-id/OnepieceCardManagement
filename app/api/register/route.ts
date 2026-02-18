import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { StarterDeckDetailProps } from "@/app/types/Card";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, selectedDeck } = body;

    if (!username || !email || !password || !selectedDeck) {
      return NextResponse.json(
        { message: "Missing required fields (including deck selection)" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "Email already taken" },
          { status: 409 },
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "Username already taken" },
          { status: 409 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: username,
          email: email,
          password: hashedPassword,
          balance: 0,
        },
      });

      const newDeck = await tx.deck.create({
        data: {
          userId: newUser.id,
          name: "Starter Deck",
          leaderCardId: selectedDeck[0].id,
          leaderCardImg: selectedDeck[0].img_full_url,
        },
      });

      const inventoryData = selectedDeck.flatMap(
        (card: StarterDeckDetailProps) => {
          return Array.from({ length: card.quantity }).map(() => {
            return {
              userId: newUser.id,
              deckId: newDeck.id,
              cardId: card.id,
              cardName: card.name,
              cardImgUrl: card.img_full_url,
              color: card.colors,
              isStoredInDeck: true,
              purchasePrice: 0,
              cardCategory: card.category,
            };
          });
        },
      );

      await tx.userInventory.createMany({
        data: inventoryData,
      });

      const userData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };

      const token = jwt.sign(userData, process.env.SECRET_KEY as string, {
        expiresIn: "1d",
      });

      (await cookies()).set({
        name: "authToken",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60,
        sameSite: "strict",
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: result.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
