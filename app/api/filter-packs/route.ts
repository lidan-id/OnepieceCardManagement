import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("packId");
  const color = searchParams.get("color");
  const search = searchParams.get("search");

  if (!packId) {
    return NextResponse.json(
      { success: false, message: "packId harus diisi" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "english-asia",
      "data",
      `${packId}.json`,
    );

    const fileContents = await fs.readFile(filePath, "utf8");
    let cards = JSON.parse(fileContents);
    if (color !== "All Colors") {
      cards = cards.filter((card: any) => card.colors.includes(color));
    }

    if (search) {
      cards = cards.filter((card: any) =>
        card.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return NextResponse.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Data kartu tidak ditemukan" },
      { status: 404 },
    );
  }
}
