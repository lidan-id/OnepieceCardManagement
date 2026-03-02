"use client";

import { useState } from "react";
import { Loader2, Package, Sparkles, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AlertCard from "../ui/AlertCard";

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

type UserPack = {
  id: string; // The unique ID of the owned pack instance
  packId: string; // The type (e.g. 569101)
  packName: string;
};

type PackInfo = {
  id: string;
  raw_title: string;
  title_parts: {
    prefix: string;
    title: string;
    label: string;
  };
};

type Card = {
  cardId: string;
  cardName: string;
  cardImgUrl: string;
  cardCategory: string;
  color: string[];
};

type User = {
  id: string;
  username: string;
  balance: number;
  packs: UserPack[];
};

export default function BoosterPackClient({
  user,
  availablePacks,
}: {
  user: User;
  availablePacks: PackInfo[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(user.balance);
  const [ownedPacks, setOwnedPacks] = useState<UserPack[]>(user.packs || []);
  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[] | null>(null);
  const [openingPackId, setOpeningPackId] = useState<string | null>(null); // The ID of the pack being opened

  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertAttribut, setAlertAttribut] = useState({
    color: "",
    title: "",
    subtitle: "",
  });

  const showAlertCard = (color: string, title: string, subtitle: string) => {
    setAlertAttribut({ color, title, subtitle });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleBuy = async (packInfo: PackInfo) => {
    if (balance < 600) {
      showAlertCard(
        "red",
        "Insufficient Funds",
        "You don't have enough CR to buy this pack.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/booster-packs/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          packId: packInfo.id,
          packName: packInfo.raw_title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBalance(data.user.balance);
      setOwnedPacks((prev) => [...prev, data.pack]);
      router.refresh();
    } catch (error: any) {
      showAlertCard("red", "Purchase Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (userPackId: string, packId: string) => {
    if (isOpening) return;
    setOpeningPackId(userPackId);
    setIsOpening(true);

    try {
      // Small delay for animation start
      await new Promise((resolve) => setTimeout(resolve, 500));

      const res = await fetch("/api/booster-packs/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userPackId: userPackId,
          packId: packId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Simulate opening animation time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setOpenedCards(data.cards);
      setOwnedPacks((prev) => prev.filter((p) => p.id !== userPackId));
      setBalance(user.balance); // In case balance changed (not expected here but safe)
    } catch (error: any) {
      alert(error.message);
      setIsOpening(false);
      setOpeningPackId(null);
    }
  };

  const closeResult = () => {
    setOpenedCards(null);
    setIsOpening(false);
    setOpeningPackId(null);
    router.refresh();
  };

  // Group owned packs by packId to count how many of each type the user has
  const groupedOwnedPacks = ownedPacks.reduce(
    (acc, pack) => {
      if (!acc[pack.packId]) {
        acc[pack.packId] = {
          count: 0,
          instances: [],
          name: pack.packName,
          id: pack.packId,
        };
      }
      acc[pack.packId].count++;
      acc[pack.packId].instances.push(pack);
      return acc;
    },
    {} as Record<
      string,
      { count: number; instances: UserPack[]; name: string; id: string }
    >,
  );

  return (
    <div className="space-y-8 relative">
      <style jsx global>{`
        @keyframes shake {
          0% {
            transform: translate(1px, 1px) rotate(0deg);
          }
          10% {
            transform: translate(-1px, -2px) rotate(-1deg);
          }
          20% {
            transform: translate(-3px, 0px) rotate(1deg);
          }
          30% {
            transform: translate(3px, 2px) rotate(0deg);
          }
          40% {
            transform: translate(1px, -1px) rotate(1deg);
          }
          50% {
            transform: translate(-1px, 2px) rotate(-1deg);
          }
          60% {
            transform: translate(-3px, 1px) rotate(0deg);
          }
          70% {
            transform: translate(3px, 1px) rotate(-1deg);
          }
          80% {
            transform: translate(-1px, -1px) rotate(1deg);
          }
          90% {
            transform: translate(1px, 2px) rotate(0deg);
          }
          100% {
            transform: translate(1px, -2px) rotate(-1deg);
          }
        }
        .shake-animation {
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px #ff0000;
          }
          50% {
            box-shadow:
              0 0 20px #ff0000,
              0 0 10px #ff8800;
          }
          100% {
            box-shadow: 0 0 5px #ff0000;
          }
        }
        .glow-effect {
          animation: glow 1s infinite alternate;
        }
      `}</style>

      {/* --- User Stats --- */}
      <GlassCard className="flex items-center justify-between p-6 bg-linear-to-r from-slate-900/80 to-slate-800/80 border-slate-600/50">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="text-amber-400" />
            My Collection
          </h2>
          <p className="text-slate-400 text-sm">Manage your unopened packs</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-700 shadow-lg">
          <div className="p-2 bg-amber-500/10 rounded-full">
            <Wallet className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Balance
            </p>
            <p className="text-xl font-bold text-white font-mono">
              ¥ {balance.toLocaleString()}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* --- My Packs --- */}
      {ownedPacks.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pl-2 border-l-4 border-amber-500">
            Your Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(groupedOwnedPacks).map((group) => (
              <GlassCard
                key={group.id}
                className="p-4 flex flex-col gap-4 group relative overflow-hidden hover:-translate-y-1 hover:border-amber-500/30"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded-bl-xl z-10 shadow-lg">
                  x{group.count}
                </div>
                <div className="h-56 bg-slate-800/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-slate-800/50 to-transparent"></div>
                  {/* Pack Art Placeholder */}
                  <div className="w-36 h-48 bg-linear-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center text-center p-3 border border-slate-500/30 shadow-2xl skew-y-3 group-hover:skew-y-0 transition-transform duration-500">
                    <span className="font-bold text-slate-300 text-sm drop-shadow-md">
                      {group.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="font-bold text-slate-100 line-clamp-1 text-lg">
                    {group.name}
                  </h4>
                  <button
                    onClick={() => handleOpen(group.instances[0].id, group.id)}
                    disabled={isOpening}
                    className="w-full py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-emerald-500/20"
                  >
                    <Sparkles
                      size={18}
                      className={isOpening ? "animate-spin" : ""}
                    />
                    {isOpening && openingPackId === group.instances[0].id
                      ? "Opening..."
                      : "Open Pack"}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* --- Shop --- */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pl-2 border-l-4 border-purple-500">
          Booster Pack Shop
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availablePacks
            .filter((pack) => !pack.title_parts.label?.includes("ST-")) // Maybe filter out starter decks if wanted, but user asked for "booster pack"
            .map((pack) => (
              <GlassCard
                key={pack.id}
                className="p-4 flex flex-col gap-4 h-full group hover:border-purple-500/30 hover:-translate-y-1"
              >
                <div className="h-56 bg-slate-800/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="w-36 h-48 bg-linear-to-br from-indigo-900 to-purple-900 rounded-lg flex items-center justify-center text-center p-3 border border-indigo-500/30 shadow-xl group-hover:scale-105 transition-transform duration-300 rotate-1 group-hover:rotate-0">
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent rounded-lg"></div>
                    <span className="font-bold text-indigo-100 text-sm relative z-10 drop-shadow-md">
                      {pack.raw_title}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <h4
                    className="font-bold text-slate-200 text-sm line-clamp-2 h-10"
                    title={pack.raw_title}
                  >
                    {pack.raw_title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
                    <span className="text-amber-400 font-bold text-xl drop-shadow-sm">
                      600{" "}
                      <span className="text-xs align-top text-amber-500/80">
                        CR
                      </span>
                    </span>
                    <button
                      onClick={() => handleBuy(pack)}
                      className="px-5 py-2 bg-slate-100 text-slate-900 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] rounded-lg font-bold transition-all active:scale-95 text-sm"
                    >
                      Buy Pack
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
        </div>
      </section>

      {/* --- Opening Animation / Modal --- */}
      {(isOpening || openedCards) && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          {!openedCards ? (
            <div className="flex flex-col items-center relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full animate-pulse"></div>
              <div className="w-48 h-64 bg-linear-to-br from-amber-400 to-orange-600 rounded-xl shadow-[0_0_50px_rgba(255,165,0,0.6)] flex items-center justify-center text-white font-bold text-2xl shake-animation mb-12 border-4 border-white/20 relative z-10">
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                <span className="relative drop-shadow-md">OPENING...</span>
              </div>
              <p className="text-white text-2xl font-bold animate-pulse tracking-widest relative z-10">
                UNSEALING PACK
              </p>
            </div>
          ) : (
            <div className="w-full max-w-6xl p-8 flex flex-col items-center max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={closeResult}
                className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-200 to-amber-400 mb-12 drop-shadow-[0_0_20px_rgba(255,165,0,0.5)] animate-in slide-in-from-top-10 duration-700">
                NEW CARDS ACQUIRED!
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full mb-12 perspective-1000">
                {openedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="aspect-2/3 bg-slate-800 rounded-xl overflow-hidden relative group animate-in fade-in zoom-in spin-in-3 duration-700 hover:scale-110 hover:z-50 transition-all shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-slate-700/50"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <img
                      src={card.cardImgUrl}
                      alt={card.cardName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-card.png";
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs text-white font-bold truncate">
                        {card.cardName}
                      </p>
                      <p className="text-[10px] text-slate-300 truncate">
                        {card.cardCategory}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                      <div
                        className={`w-3 h-3 rounded-full bg-${card.color?.[0]?.toLowerCase()}-500 shadow-[0_0_5px_currentColor]`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={closeResult}
                className="px-10 py-4 bg-linear-to-r from-slate-100 to-slate-300 text-slate-900 font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg tracking-wide uppercase"
              >
                Collect All Cards
              </button>
            </div>
          )}
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-101 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-3 border border-slate-700 shadow-xl">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="font-semibold text-white">Processing...</span>
          </div>
        </div>
      )}
      {showAlert && (
        <div className="fixed z-100 bottom-5 left-5 animate-in slide-in-from-left-5 duration-300">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}
    </div>
  );
}
