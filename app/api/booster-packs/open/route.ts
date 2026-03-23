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

    // 1. BACA SEMUA KARTU & KELOMPOKKAN BERDASARKAN RARITY
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
      AA: [], // Alternate Arts / Specials
      Promo: [],
    };

    allCards.forEach((card) => {
      // Deteksi Alternate Art atau Kartu Spesial (dari suffix _p atau rarity khusus)
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
      else pools.Common.push(card); // Fallback jika format rarity aneh
    });

    // 2. FUNGSI PENARIKAN (PULL) 12 KARTU UNIK
    const selectedCards: any[] = [];
    const selectedIds = new Set();

    const drawFromPool = (
      primaryPool: any[],
      fallbackPool: any[],
      count: number,
    ) => {
      for (let i = 0; i < count; i++) {
        // Hanya pilih kartu yang belum ditarik
        let available = primaryPool.filter((c) => !selectedIds.has(c.id));

        // Jika pool utama habis (misal pack tidak punya SEC), ambil dari fallback pool
        if (available.length === 0) {
          available = fallbackPool.filter((c) => !selectedIds.has(c.id));
        }
        // Jika masih habis juga, ambil acak dari semua kartu tersisa
        if (available.length === 0) {
          available = allCards.filter((c) => !selectedIds.has(c.id));
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedCard = available[randomIndex];

        selectedCards.push(selectedCard);
        selectedIds.add(selectedCard.id);
      }
    };

    // --- ALGORITMA PULL RATE 12 KARTU (Distribusi Standar TCG) ---

    drawFromPool(pools.Common, pools.Uncommon, 7); // 7 Slot Common
    drawFromPool(pools.Uncommon, pools.Common, 2); // 2 Slot Uncommon
    drawFromPool(pools.Rare, pools.Uncommon, 1); // 1 Slot Guaranteed Rare

    // 1 Slot untuk Leader (60% Peluang, kalau gagal dapat Uncommon)
    if (Math.random() < 0.6 && pools.Leader.length > 0) {
      drawFromPool(pools.Leader, pools.Uncommon, 1);
    } else {
      drawFromPool(pools.Uncommon, pools.Common, 1);
    }

    // 1 Hit Slot (Gacha Utama: Peluang dapat kartu mahal)
    const hitRoll = Math.random() * 100;
    if (hitRoll < 8) {
      // 8% Peluang AA / Manga (~2 Kartu per Booster Box)
      drawFromPool(pools.AA, pools.SuperRare, 1);
    } else if (hitRoll < 12) {
      // 4% Peluang Secret Rare (~1 Kartu per Booster Box)
      drawFromPool(pools.SecretRare, pools.SuperRare, 1);
    } else if (hitRoll < 40) {
      // 28% Peluang Super Rare (~6-7 Kartu per Booster Box)
      drawFromPool(pools.SuperRare, pools.Rare, 1);
    } else {
      // 60% Zonk/Standar (Dapat Rare tambahan)
      drawFromPool(pools.Rare, pools.Uncommon, 1);
    }

    // 3. SIMPAN KE DATABASE
    const createdCards: UserInventory[] = [];
    console.log(
      "Selected Cards:",
      selectedCards.map((c) => c.rarity),
    ); // Debug: Tampilkan kartu yang dipilih
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

      // Hapus pack yang sudah dibuka
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
