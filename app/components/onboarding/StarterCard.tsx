import { StarterDeckDetailProps } from "@/app/types/Card";
import React from "react";

interface AllSTProps {
  id: string;
  cards: StarterDeckDetailProps[];
}
interface StarterCardProps {
  e: AllSTProps;
  selectedCard: number;
  index: number;
  setImageClickedUrl: (url: string) => void;
  setImageClicked: (clicked: boolean) => void;
  setSelectedCard: (index: number) => void;
  setSelectedCardList: (cards: StarterDeckDetailProps[]) => void;
}

const StarterCard = ({
  e,
  selectedCard,
  index,
  setImageClickedUrl,
  setImageClicked,
  setSelectedCard,
  setSelectedCardList,
}: StarterCardProps) => {
  const isSelected = selectedCard === index;

  return (
    <div
      onClick={() => {
        setSelectedCard(index);
        setSelectedCardList(e.cards);
      }}
      className={`
        relative col-span-1 group rounded-xl p-3 cursor-pointer transition-all duration-300 border
        ${
          isSelected
            ? "bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 -translate-y-1"
            : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800"
        }
      `}
    >
      {/* Label ID Deck (Top Left) */}
      <div
        className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider
        ${isSelected ? "bg-amber-400 text-slate-900" : "bg-slate-950/80 text-slate-400 backdrop-blur-sm"}
      `}
      >
        {e.id}
      </div>

      {/* Image Container */}
      <div className="relative  rounded-lg mb-3 aspect-2/3">
        <img
          onClick={(ev) => {
            ev.stopPropagation(); // Mencegah trigger select saat ingin zoom
            setImageClickedUrl(e.cards[0].img_full_url);
            setImageClicked(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-in-out cursor-zoom-in
            ${isSelected ? "scale-110" : "group-hover:rotate-6 grayscale-30% group-hover:grayscale-0"}
          `}
          src={e.cards[0].img_full_url}
          alt={e.cards[0].name}
          loading="lazy"
        />
        {/* Shine Effect Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-linear-to-tr from-amber-500/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Card Info */}
      <div className="text-center space-y-2">
        <h3
          className={`text-[11px] md:text-xs font-bold truncate px-1 transition-colors ${isSelected ? "text-amber-400" : "text-slate-300"}`}
        >
          {e.cards[0].name}
        </h3>

        {/* Selection Indicator / Button */}
        <div
          className={`
          w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all duration-300
          ${
            isSelected
              ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20"
              : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
          }
        `}
        >
          {isSelected ? "Selected" : "Select"}
        </div>
      </div>
    </div>
  );
};

export default StarterCard;
