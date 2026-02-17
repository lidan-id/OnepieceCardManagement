import { UserDeck } from "@/app/types/Deck";
import React from "react";

const DashboardCard = ({
  deck,
  handleEditDeck,
  handleOpenDeleteModal,
}: {
  deck: UserDeck;
  handleEditDeck: (id: string) => void;
  handleOpenDeleteModal: (id: string) => void;
}) => {
  return (
    <div className="p-2 bg-slate-900 rounded-xl flex flex-col gap-1">
      <img src={deck.leaderCardImg}></img>
      <div className="font-bold text-white">Name: {deck.name}</div>
      <button
        onClick={() => {
          handleEditDeck(deck.id);
        }}
        className="bg-amber-600 w-full rounded-md text-[14px] py-1 text-white font-semibold"
      >
        Edit Deck
      </button>
      <button
        onClick={() => {
          handleOpenDeleteModal(deck.id);
        }}
        className="w-full rounded-md text-[14px] py-1 text-red-600 font-semibold"
      >
        Delete Deck
      </button>
    </div>
  );
};

export default DashboardCard;
