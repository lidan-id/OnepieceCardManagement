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
  return (
    <div
      className={`col-span-1 ${selectedCard === index ? "scale-110" : "scale-100"} transition-transform duration-300`}
    >
      <img
        onClick={() => {
          setImageClickedUrl(e.cards[0].img_full_url);
          setImageClicked(true);
        }}
        className="hover:rotate-3 transition-transform duration-300 ease-in-out cursor-pointer"
        src={e.cards[0].img_full_url}
      ></img>
      <p className="text-[10px] font-bold">{e.id}</p>
      <p className="text-[12px] font-bold mb-1">{e.cards[0].name}</p>
      <button
        onClick={() => {
          setSelectedCard(index);
          setSelectedCardList(e.cards);
        }}
        className={`cursor-pointer w-full text-[12px] font-medium py-1 rounded-md ${selectedCard === index ? "bg-amber-400" : "bg-slate-800 text-white "}`}
      >
        {selectedCard === index ? "Selected" : "Select"}
      </button>
    </div>
  );
};

export default StarterCard;
