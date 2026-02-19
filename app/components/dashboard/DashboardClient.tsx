"use client";
import { UserDeck } from "@/app/types/Deck";
import { TokenPayload } from "@/app/types/Token";
import DashboardCard from "./DashboardCard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AlertCard from "../ui/AlertCard";
import { X, Loader2, Wallet, Plus, AlertTriangle } from "lucide-react";

const DashboardClient = ({
  user,
  userDecks,
  userBalance,
}: {
  user: TokenPayload | null;
  userDecks: UserDeck[];
  userBalance: number;
}) => {
  const router = useRouter();

  const handleEditDeck = (id: string) => {
    router.push(`/deck-builder/${id}`);
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertAttribut, setAlertAttribut] = useState({
    color: "",
    title: "",
    subtitle: "",
  });

  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [deckId, setDeckId] = useState("");
  const [loading, setLoading] = useState(false);

  const showAlertCard = (color: string, title: string, subtitle: string) => {
    setAlertAttribut({ color, title, subtitle });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleOpenDeleteModal = (id: string) => {
    setIsShowModalDelete(true);
    setDeckId(id);
  };

  const handleDeleteDeck = async () => {
    try {
      setLoading(true);
      const response = await fetch("api/delete-deck", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: deckId,
          userId: user?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Delete failed");
      } else {
        showAlertCard("green", "Success", "Deck deleted successfully");
        setIsShowModalDelete(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500">
                {user.username}
              </span>
            </h1>
            <p className="text-slate-400">
              Manage your decks and prepare for battle.
            </p>
          </div>

          {/* Balance Card */}
          <div className="flex items-center gap-4 bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-700 shadow-lg">
            <div className="p-2 bg-amber-500/10 rounded-full">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Balance
              </p>
              <p className="text-xl font-bold text-white font-mono">
                ¥ {userBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1 h-8 bg-amber-500 rounded-full block"></span>
              Your Decks
            </h2>
            <button
              onClick={() => {
                router.push("/deck-builder/create-new");
              }}
              className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> New Deck
            </button>
          </div>

          {userDecks.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500 text-lg">
                You don't have any decks yet.
              </p>
              <button
                onClick={() => {
                  router.push("/deck-builder/create-new");
                }}
                className="mt-4 text-amber-500 hover:text-amber-400 font-bold"
              >
                Create one now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {userDecks.map((deck, index) => (
                <div key={index} className="col-span-1">
                  <DashboardCard
                    deck={deck}
                    handleEditDeck={handleEditDeck}
                    handleOpenDeleteModal={handleOpenDeleteModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Toast */}
      {showAlert && (
        <div className="fixed z-100 bottom-5 left-5 animate-in slide-in-from-left-5 duration-300">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}

      {/* Delete Modal */}
      {isShowModalDelete && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsShowModalDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl transform transition-all"
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Deck?
              </h3>
              <p className="text-slate-400 text-sm">
                Are you sure you want to delete this deck? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setIsShowModalDelete(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteDeck();
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !isShowModalDelete && (
        <div className="fixed inset-0 bg-black/50 z-101 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-3 border border-slate-700 shadow-xl">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="font-semibold text-white">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardClient;
