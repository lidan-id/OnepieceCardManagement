import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { UserInventory } from "@/app/types/UserInventory";

export async function POST(req: Request) {
  try {
    const { userId, userPackId, packId } = await req.json();

    if (!userId || !userPackId || !packId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userPack = await prisma.userPack.findUnique({
      where: { id: userPackId },
    });

    if (!userPack || userPack.userId !== userId) {
      return NextResponse.json(
        { error: "Pack not found or not owned" },
        { status: 404 },
      );
    }

    const packDir = path.join(
      process.cwd(),
      "public",
      "english-asia",
      "cards",
      packId,
    );

    if (!fs.existsSync(packDir)) {
      return NextResponse.json(
        { error: `Pack data for ${packId} not found` },
        { status: 404 },
      );
    }

    const files = fs
      .readdirSync(packDir)
      .filter((file) => file.endsWith(".json"));

    if (files.length < 12) {
      return NextResponse.json(
        { error: "Not enough cards in this pack to pull 12 unique cards" },
        { status: 500 },
      );
    }

    
    const allCards: any[] = [];
    files.forEach((file) => {
      const filePath = path.join(packDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      allCards.push(JSON.parse(fileContent));
    });

    const pools: Record<string, any[]> = {
      Common: [],
      Uncommon: [],
      Rare: [],
      SuperRare: [],
      SecretRare: [],
      Leader: [],
      AA: [], 
      Promo: [],
    };

    allCards.forEach((card) => {
      
      const isAA =
        card.id.includes("_p") ||
        ["Special Card", "Special", "TreasureRare"].includes(card.rarity);

      if (isAA) pools.AA.push(card);
      else if (card.rarity === "Common") pools.Common.push(card);
      else if (card.rarity === "Uncommon") pools.Uncommon.push(card);
      else if (card.rarity === "Rare") pools.Rare.push(card);
      else if (card.rarity === "SuperRare") pools.SuperRare.push(card);
      else if (card.rarity === "SecretRare") pools.SecretRare.push(card);
      else if (card.rarity === "Leader") pools.Leader.push(card);
      else if (card.rarity === "Promo") pools.Promo.push(card);
      else pools.Common.push(card); 
    });

    
    const selectedCards: any[] = [];
    const selectedIds = new Set();

    const drawFromPool = (
      primaryPool: any[],
      fallbackPool: any[],
      count: number,
    ) => {
      for (let i = 0; i < count; i++) {
        
        let available = primaryPool.filter((c) => !selectedIds.has(c.id));

        
        if (available.length === 0) {
          available = fallbackPool.filter((c) => !selectedIds.has(c.id));
        }
        
        if (available.length === 0) {
          available = allCards.filter((c) => !selectedIds.has(c.id));
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedCard = available[randomIndex];

        selectedCards.push(selectedCard);
        selectedIds.add(selectedCard.id);
      }
    };

    

    drawFromPool(pools.Common, pools.Uncommon, 7); 
    drawFromPool(pools.Uncommon, pools.Common, 2); 
    drawFromPool(pools.Rare, pools.Uncommon, 1); 

    
    if (Math.random() < 0.6 && pools.Leader.length > 0) {
      drawFromPool(pools.Leader, pools.Uncommon, 1);
    } else {
      drawFromPool(pools.Uncommon, pools.Common, 1);
    }

    
    const hitRoll = Math.random() * 100;
    if (hitRoll < 8) {
      
      drawFromPool(pools.AA, pools.SuperRare, 1);
    } else if (hitRoll < 12) {
      
      drawFromPool(pools.SecretRare, pools.SuperRare, 1);
    } else if (hitRoll < 40) {
      
      drawFromPool(pools.SuperRare, pools.Rare, 1);
    } else {
      
      drawFromPool(pools.Rare, pools.Uncommon, 1);
    }

    
    const createdCards: UserInventory[] = [];
    console.log(
      "Selected Cards:",
      selectedCards.map((c) => c.rarity),
    ); 
    await prisma.$transaction(async (tx) => {
      for (const cardData of selectedCards) {
        const newCard = await tx.userInventory.create({
          data: {
            userId: userId,
            cardId: cardData.id,
            cardName: cardData.name,
            cardImgUrl: cardData.img_full_url || cardData.img_url || "",
            cardCategory: cardData.category || "Unknown",
            color: cardData.colors || [],
            purchasePrice: 0,
            isStoredInDeck: false,
            isListed: false,
          },
        });
        createdCards.push(newCard);
      }

      
      await tx.userPack.delete({
        where: { id: userPackId },
      });
    });

    return NextResponse.json({
      message: "Pack opened successfully",
      cards: createdCards,
    });
  } catch (error: any) {
    console.error("Error opening pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to open pack" },
      { status: 500 },
    );
  }
}
