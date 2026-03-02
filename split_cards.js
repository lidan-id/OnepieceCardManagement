const fs = require("fs");
const path = require("path");

// Paste array panjangmu di sini

const packDir = path.join(
  process.cwd(),
  "public",
  "english",
  "data",
  "569114.json",
);
const fileContent = fs.readFileSync(packDir, "utf-8");
const cardsData = JSON.parse(fileContent);

const outputFolder = "./public/english/cards/569114/";

// Buat foldernya jika belum ada
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Loop melalui setiap kartu dan buat filenya
cardsData.forEach((card) => {
  // Gunakan card.id sebagai nama file (misal: EB04-011.json)
  const fileName = `${card.id}.json`;
  const filePath = path.join(outputFolder, fileName);

  // Tulis data kartu ke dalam file JSON, format agar rapi (2 spasi indentasi)
  fs.writeFileSync(filePath, JSON.stringify(card, null, 2));

  console.log(`Berhasil membuat file: ${fileName}`);
});

console.log(
  `\nSelesai! ${cardsData.length} file kartu telah dibuat di folder: ${outputFolder}`,
);
