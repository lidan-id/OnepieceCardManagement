import { UserDeck } from "@/app/types/Deck";
import { Edit, Trash2 } from "lucide-react";
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
    <div className="group relative bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-500/50 transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Overlay Effect */}
      <div className="relative aspect-3/4 overflow-hidden bg-slate-800">
        <img
          src={deck.leaderCardImg}
          alt={deck.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Floating Badge (Optional - e.g. Deck Type) */}
        <div className="absolute top-2 right-2">
          <span className="bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full border border-white/10">
            Leader
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3 flex-1 justify-between relative bg-slate-900">
        {/* Deck Name */}
        <div>
          <h3
            className="font-bold text-white text-lg truncate"
            title={deck.name}
          >
            {deck.name}
          </h3>
          <p className="text-slate-400 text-xs">Custom Deck</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleEditDeck(deck.id)}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => handleOpenDeleteModal(deck.id)}
            className="bg-slate-800 hover:bg-red-500/20 hover:text-red-500 border border-slate-700 hover:border-red-500 text-slate-400 p-2 rounded-lg transition-all active:scale-95"
            title="Delete Deck"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
