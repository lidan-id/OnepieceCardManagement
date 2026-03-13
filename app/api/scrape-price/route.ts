import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("id");

  if (!cardId) {
    return NextResponse.json(
      { success: false, error: "Parameter 'id' tidak ditemukan" },
      { status: 400 },
    );
  }

  try {
    const API_KEY = process.env.SCRAPER_API_KEY;
    const targetUrl = `https://yuyu-tei.jp/sell/opc/s/search?search_word=${encodeURIComponent(
      cardId,
    )}`;
    const scraperUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(scraperUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        Referer: "https://yuyu-tei.jp/",
      },
      cache: "no-store", // Jangan simpan cache agar harga selalu realtime
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    if (html.includes("Cloudflare") || html.includes("captcha")) {
      console.log("[SCRAPER] TERKENA BLOKIR CLOUDFLARE/BOT PROTECTION!");
      return NextResponse.json(
        { success: false, error: "Terblokir oleh proteksi website" },
        { status: 403 },
      );
    }

    const $ = cheerio.load(html);

    // 1. Siapkan array untuk menampung semua harga yang ditemukan
    const allPrices: number[] = [];

    // 2. Loop melalui setiap elemen harga kartu di halaman tersebut
    $(".card-product strong.text-end").each((index, element) => {
      const priceRaw = $(element).text().trim();

      // Bersihkan teks (hanya ambil angkanya)
      const numericString = priceRaw.replace(/[^0-9]/g, "");

      if (numericString) {
        // Masukkan ke array sebagai angka (integer)
        allPrices.push(parseInt(numericString, 10));
      }
    });

    // 3. Jika array kosong (tidak ada harga yang ditemukan)
    if (allPrices.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Harga tidak ditemukan (Out of stock / Kartu tidak ada)",
        },
        { status: 404 },
      );
    }

    // 4. Cari harga paling kecil menggunakan Math.min
    const lowestPrice = Math.min(...allPrices);
    const highestPrice = Math.max(...allPrices);
    return NextResponse.json(
      {
        success: true,
        cardId: cardId,
        lowestPrice: lowestPrice,
        highestPrice: highestPrice,
        displayPrice: {
          lowestPrice: lowestPrice.toLocaleString(),
          highestPrice: highestPrice.toLocaleString(),
        },
        currency: "JPY",
        sourceUrl: targetUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat mengambil data" },
      { status: 500 },
    );
  }
}
