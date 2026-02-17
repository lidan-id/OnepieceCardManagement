import MarketPlaceClient from "@/app/components/marketplace/MarketPlaceClient";
import { TokenPayload } from "@/app/types/Token";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import React from "react";

const Marketplace = async () => {
  const fileNames = [
    "569001.json",
    "569002.json",
    "569003.json",
    "569004.json",
    "569005.json",
    "569006.json",
    "569007.json",
    "569008.json",
    "569009.json",
    "569010.json",
    "569011.json",
    "569012.json",
    "569013.json",
    "569014.json",
    "569015.json",
    "569016.json",
    "569017.json",
    "569018.json",
    "569019.json",
    "569020.json",
    "569021.json",
    "569022.json",
    "569023.json",
    "569024.json",
    "569025.json",
    "569026.json",
    "569027.json",
    "569028.json",
    "569101.json",
    "569102.json",
    "569103.json",
    "569104.json",
    "569105.json",
    "569106.json",
    "569107.json",
    "569108.json",
    "569109.json",
    "569110.json",
    "569111.json",
    "569112.json",
    "569113.json",
    "569201.json",
    "569202.json",
    "569301.json",
    "569302.json",
    "569801.json",
    "569901.json",
  ];
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

  const data = await Promise.all(
    fileNames.map(async (fileName) => {
      const response = await fetch(`/english/data/${fileName}`);
      return await response.json();
    }),
  );

  const allData = data.flat();

  const marketplace = await prisma.marketplace.findMany({
    include: { inventory: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <MarketPlaceClient
      userData={userData}
      data={allData}
      marketplaceData={marketplace}
    />
  );
};

export default Marketplace;
