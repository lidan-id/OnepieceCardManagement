const fs = require("fs");
const path = require("path");



const packDir = path.join(
  process.cwd(),
  "public",
  "english",
  "data",
  "569204.json",
);
const fileContent = fs.readFileSync(packDir, "utf-8");
const cardsData = JSON.parse(fileContent);

const outputFolder = "./public/english/cards/569204/";


if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}


cardsData.forEach((card) => {
  
  const fileName = `${card.id}.json`;
  const filePath = path.join(outputFolder, fileName);

  
  fs.writeFileSync(filePath, JSON.stringify(card, null, 2));

  console.log(`Berhasil membuat file: ${fileName}`);
});

console.log(
  `\nSelesai! ${cardsData.length} file kartu telah dibuat di folder: ${outputFolder}`,
);
