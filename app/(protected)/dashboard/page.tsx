import { jwtDecode } from "jwt-decode";
import DashboardClient from "@/app/components/dashboard/DashboardClient";
import { cookies } from "next/headers";
import { TokenPayload } from "@/app/types/Token";
import { prisma } from "@/lib/prisma";

const DashBoard = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  let userData: TokenPayload | null = null;
  let currentBalance = 0;

  if (token) {
    try {
      userData = jwtDecode<TokenPayload>(token);

      const dbUser = await prisma.user.findUnique({
        where: { id: userData.id },
        select: { balance: true }, // Kita cuma butuh kolom balance
      });

      if (dbUser) {
        currentBalance = dbUser.balance;
      }
    } catch (error) {
      console.log("invalid token");
    }
  }

  const userDecks = userData
    ? await prisma.deck.findMany({
        where: {
          userId: userData.id,
        },
        include: {
          cards: true,
        },
      })
    : [];

  return (
    <DashboardClient
      user={userData}
      userDecks={userDecks}
      userBalance={currentBalance}
    />
  );
};

export default DashBoard;
