"use client";
import { CardDetailProps } from "@/app/types/Card";
import {
  X,
  Info,
  Award,
  ShieldAlert,
  Layers3,
  Target,
  FlaskConical,
  Binary,
  UserCircle2,
} from "lucide-react";
import React, { useEffect } from "react";
import PreviewCardSkeleton from "./PreviewCardSkeleton";

// Props disesuaikan dengan kebutuhan Anda, tambahkan cardData jika datanya dinamis
interface PreviewCardProps {
  setIsShowCard: (value: boolean) => void;
  cardId: string;
}

const PreviewCard = ({ setIsShowCard, cardId }: PreviewCardProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<CardDetailProps | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/data/master-cards.json");
        const allCards: CardDetailProps[] = await response.json();

        const selectedCard = allCards.find((card) => card.id === cardId);

        if (selectedCard) {
          setData(selectedCard);
        } else {
          console.error("Card not found");
        }
      } catch (error) {
        console.error("Failed to fetch card data:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    if (cardId) {
      fetchCardData();
    }
  }, [cardId]);

  const StatLabel = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-1">
      <Icon className="w-3.5 h-3.5 text-slate-600" />
      {label}
    </div>
  );

  return data === null ? null : (
    <div
      onClick={() => setIsShowCard(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200"
    >
      {isLoading ? (
        <PreviewCardSkeleton />
      ) : (
        <div
          className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Close Button (Mobile Floating) --- */}
          <button
            onClick={() => setIsShowCard(false)}
            className="absolute top-4 right-4 z-50 md:hidden bg-black/50 p-2 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* --- KIRI: Image Area (Sticky on Desktop) --- */}
          <div className="w-full md:w-[380px] p-6 md:p-8 bg-slate-950/40 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            <div className="relative w-full max-w-[250px] md:max-w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-slate-700 group">
              <img
                src={data.img_full_url}
                alt="Card"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="mt-4 text-center hidden md:block">
              <span className="text-xs font-mono text-slate-500">
                {data.id}
              </span>
            </div>
          </div>

          {/* --- KANAN: Content Area (Scrollable) --- */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header (Sticky) */}
            <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight">
                  {data.name}
                </h2>
                <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mt-1">
                  {data.category}
                </p>
              </div>
              <button
                onClick={() => setIsShowCard(false)}
                className="hidden md:flex text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-8">
              {/* Grid Statistik Utama */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <StatLabel icon={Target} label="Cost" />
                  <p className="text-2xl font-black text-white">
                    {data.cost || "-"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <StatLabel icon={Award} label="Power" />
                  <p className="text-2xl font-black text-white">
                    {data.power || "-"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <StatLabel icon={ShieldAlert} label="Counter" />
                  <p className="text-2xl font-black text-white">
                    {data.counter || "0"}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <StatLabel icon={Award} label="Attribute" />
                  <p className="text-sm font-bold text-slate-200 uppercase">
                    {data.attributes?.join(", ") || "-"}
                  </p>
                </div>
              </div>

              {/* Tags / Properties */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="space-y-2">
                  <StatLabel icon={Binary} label="Color" />
                  <div className="flex gap-2">
                    {data.colors?.map((c: string) => (
                      <span
                        key={c}
                        className={`px-3 py-1 bg-${c === "Red" ? "red" : c === "Green" ? "green" : c === "Purple" ? "purple" : c === "Blue" ? "blue" : c === "Yellow" ? "yellow" : "black"}-900/30 text-${c === "Red" ? "red" : c === "Green" ? "green" : c === "Purple" ? "purple" : c === "Blue" ? "blue" : c === "Yellow" ? "yellow" : "black"}-400 border border-${c === "Red" ? "red" : c === "Green" ? "green" : c === "Purple" ? "purple" : c === "Blue" ? "blue" : c === "Yellow" ? "yellow" : "black"}-800 rounded-md text-xs font-bold uppercase`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <StatLabel icon={UserCircle2} label="Type" />
                  <div className="flex flex-wrap gap-2">
                    {data.types?.map((t: string) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Effect Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Card Effect
                  </span>
                </div>
                <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/50 leading-relaxed italic">
                  {data.effect?.split("\n").map((line: string, i: number) => (
                    <p
                      key={i}
                      className="text-slate-300 text-sm mb-2 last:mb-0"
                    >
                      {line}
                    </p>
                  ))}
                  {data.trigger && (
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mt-4">
                      {data.trigger}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer / ID */}
              <div className="pt-6 border-t border-slate-800 flex justify-between items-center opacity-50">
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  Official Card Game Data
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {data.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewCard;
