import MarketPlaceClient from "@/app/components/marketplace/MarketPlaceClient";
import { TokenPayload } from "@/app/types/Token";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import path from "path";
import { promises as fs } from "fs";
import { PackInfo } from "@/app/types/PackInfo";

const Marketplace = async () => {
  const fileName = "556001.json";

  let userData: TokenPayload | null = null;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (token) {
    try {
      userData = jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.log("invalid token");
    }
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "english-asia",
    "data",
    fileName,
  );
  const fileContents = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(fileContents);

  const marketplace = await prisma.marketplace.findMany({
    include: { inventory: true },
    orderBy: { createdAt: "desc" },
  });

  async function getPacks() {
    const filePath = path.join(
      process.cwd(),
      "public",
      "english-asia",
      "packs.json",
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const allPacks = JSON.parse(fileContent) as Record<string, PackInfo>;

    const arrayAllPacks = Object.values(allPacks);

    return arrayAllPacks;
  }

  const allPacks = await getPacks();

  return (
    <MarketPlaceClient
      userData={userData}
      allPacks={allPacks}
      cardData={data}
      marketplaceData={marketplace}
    />
  );
};

export default Marketplace;
