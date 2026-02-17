"use client";
import { UserDeck } from "@/app/types/Deck";
import { TokenPayload } from "@/app/types/Token";
import DashboardCard from "./DashboardCard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AlertCard from "../ui/AlertCard";
import GlassLayer from "../ui/GlassLayer";
import { X } from "lucide-react";

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

  const showAlertCard = (color: string, title: string, subtitle: string) => {
    setAlertAttribut({ color, title, subtitle });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const [loading, setLoading] = useState(false);

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
        showAlertCard("red", "Error", data.message || "Save deck failed");
      } else {
        showAlertCard("green", "Success", "Save deck successful");

        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Access Denied. Please Login</p>;
  }
  return (
    <div className=" h-full p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
        {/* Welcome*/}
        <div className="leading-6">
          <h1 className="text-[22px] font-bold">
            Welcome back,{" "}
            <span className="text-amber-500 line-">{user.username}</span>
          </h1>
          <span className="text-[13px] text-gray-500">
            Here's your deck building overview
          </span>
        </div>

        {/* Balance */}
        <div className="text-[18px] font-bold shadow-md p-2 border rounded-xl border-gray-400">
          Balance:{" "}
          <span className="text-amber-500">{userBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="font-bold text-[24px] mt-10 mb-5">Here is Your Decks</div>

      {/* Decks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
      {showAlert && (
        <div className="fixed z-9999 bottom-2 left-2 animate-left-slide-in">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}
      {isShowModalDelete && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setIsShowModalDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all scale-100"
          >
            <div className="flex items-center justify-between  p-5">
              <h1 className="text-lg font-bold text-gray-800">Are you sure?</h1>
              <button
                onClick={() => setIsShowModalDelete(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3 p-3 rounded-b-2xl">
              <button
                onClick={() => setIsShowModalDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteDeck();
                  setIsShowModalDelete(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? <GlassLayer /> : <></>}
      {loading ? (
        <div className="fixed inset-0 bg-black/90 z-99999 flex items-center justify-center text-white">
          <h1>Loading</h1>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DashboardClient;
