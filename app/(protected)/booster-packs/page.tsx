import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import BoosterPackClient from "@/app/components/booster-packs/BoosterPackClient";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    if (!payload || !payload.id) {
      console.error("Token valid tapi sub (User ID) tidak ditemukan");
      return null;
    }

    const userId = payload?.id as string;

    if (!userId) {
      console.error("User ID (id) tidak ditemukan di dalam token");
      return null;
    }

    // Fetch user details including inventory of packs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        packs: true,
      },
    });

    if (!user) return null;

    // Serialize user data to avoid Date object issues
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

async function getPacks() {
  const filePath = path.join(process.cwd(), "public", "english", "packs.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const allPacks = JSON.parse(fileContent);

  // Filter for booster packs
  return allPacks.filter(
    (pack: any) =>
      pack.title_parts &&
      (pack.title_parts.prefix === "BOOSTER PACK" ||
        pack.title_parts.prefix === "PREMIUM BOOSTER" ||
        pack.title_parts.prefix === "EXTRA BOOSTER"),
  );
}

export default async function BoosterPacksPage() {
  const user = await getUser();
  const packs = await getPacks();

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-8 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-orange-600 mb-2">
          Booster Packs
        </h1>
        <p className="text-slate-400">
          Buy and open booster packs to expand your collection.
        </p>
      </div>

      <BoosterPackClient user={user} availablePacks={packs} />
    </div>
  );
}
