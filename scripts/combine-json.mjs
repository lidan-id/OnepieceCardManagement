import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "public/english/data");
const outputDir = path.join(process.cwd(), "public/data");
const outputFile = path.join(outputDir, "master-cards.json");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Folder public/data berhasil dibuat!");
}

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

const allData = files
  .map((file) => {
    const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const parsed = JSON.parse(content);

    return parsed;
  })
  .flat();

fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));

console.log(`🚀 Sukses! Master file created at: ${outputFile}`);
console.log(`Total kartu yang digabung: ${allData.length}`);
