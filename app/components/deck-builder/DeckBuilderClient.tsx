"use client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Edit,
  Plus,
  Save,
  Search,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import GlassLayer from "../ui/GlassLayer";
import AlertCard from "../ui/AlertCard";
import { useRouter } from "next/navigation";

interface UserInventory {
  id: string;
  userId: string;
  cardId: string;
  cardName: string;
  cardImgUrl: string;
  color: string[];
  isStoredInDeck: boolean;
  purchasePrice: number;
  deckId: string | null;
  quantity: number;
  storedDeckQuantity: number;
  cardCategory: string;
}

const DeckBuilderClient = ({
  userInventory,
  userData,
  existDeck,
  paramsId,
}: {
  userInventory: UserInventory[];
  userData: { id: string; username: string; email: string } | null;
  existDeck: UserInventory[];
  paramsId: string;
}) => {
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);

  const [collection, setCollection] = useState<UserInventory[]>([]);
  const [newDeck, setNewDeck] = useState<UserInventory[]>([]);

  const [leaderId, setLeaderId] = useState("");
  const [leaderCardImg, setLeaderCardImg] = useState("");

  const [isShowSaveModal, setIsShowSaveModal] = useState(false);

  const [deckName, setDeckName] = useState("");

  useEffect(() => {
    setCollection(userInventory);
    setNewDeck(existDeck);
    const currentLeader = existDeck.find(
      (card) => card.cardCategory === "Leader",
    );
    if (currentLeader) {
      setLeaderId(currentLeader.cardId);
      setLeaderCardImg(currentLeader.cardImgUrl);
    }

    console.log(existDeck);
  }, [userInventory, existDeck]);

  const moveCard = (
    card: UserInventory,
    sourceList: UserInventory[],
    setSourceList: React.Dispatch<React.SetStateAction<UserInventory[]>>,
    targetList: UserInventory[],
    setTargetList: React.Dispatch<React.SetStateAction<UserInventory[]>>,
    addToNewDeck: boolean,
  ) => {
    const existingCardInTarget = targetList.find((item) => item.id === card.id);
    if (addToNewDeck && existingCardInTarget?.quantity === 4) {
      showAlertCard("red", "Failed", "Cannot add 4 same card to the deck");
      return;
    }

    const existingLeaderCardInTarget = targetList.find(
      (item) => item.cardCategory === "Leader",
    );
    if (
      addToNewDeck &&
      existingLeaderCardInTarget &&
      card.cardCategory === "Leader"
    ) {
      showAlertCard("red", "Failed", "Cannot add 2 Leader in 1 deck");
      return;
    }

    if (addToNewDeck && totalCardsInDeck >= 51) {
      showAlertCard("red", "Failed", "Cannot add more than 51 cards in 1 deck");
      return;
    }

    if (card.cardCategory === "Leader") {
      setLeaderId(card.cardId);
      setLeaderCardImg(card.cardImgUrl);
    }

    if (existingCardInTarget) {
      setTargetList((prev) =>
        prev.map((item) =>
          item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setTargetList((prev) => [...prev, { ...card, quantity: 1 }]);
    }
    const updatedSource = sourceList
      .map((item) => {
        if (item.id === card.id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setSourceList(updatedSource);
  };

  const handleAddToDeck = (card: UserInventory) => {
    moveCard(card, collection, setCollection, newDeck, setNewDeck, true);
  };

  const handleRemoveFromDeck = (card: UserInventory) => {
    moveCard(card, newDeck, setNewDeck, collection, setCollection, false);
  };

  const totalCardsInDeck = newDeck.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );

  const itHasLeader = newDeck.find((item) => item.cardCategory === "Leader");

  const handleTrash = () => {
    setNewDeck([]);
    setCollection(userInventory);
  };

  const handleSave = () => {
    if (totalCardsInDeck !== 51) {
      showAlertCard("red", "Failed", "Must be atleast 51 cards");
      return;
    }
    if (!itHasLeader) {
      showAlertCard("red", "Failed", "Deck must has Leader in it");
      return;
    }

    setIsShowSaveModal(true);
  };

  const handleModalSave = async () => {
    if (paramsId !== "create-new") {
      try {
        setLoading(true);
        const response = await fetch("/api/edit-deck", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData?.id,
            name: deckName,
            leaderCardId: leaderId,
            leaderCardImg: leaderCardImg,
            collection: collection,
            newDeck: newDeck,
            deckId: paramsId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          showAlertCard("red", "Error", data.message || "Edit deck failed");
        } else {
          showAlertCard("green", "Success", "Save deck successful");
          setIsShowSaveModal(false);
          router.push("/dashboard");
        }
      } catch (error: any) {
        console.log(error);
        showAlertCard("red", "Error", "Edit failed");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const response = await fetch("/api/create-deck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userData?.id,
            name: deckName,
            leaderCardId: leaderId,
            leaderCardImg: leaderCardImg,
            collection: collection,
            newDeck: newDeck,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          showAlertCard("red", "Error", data.message || "Save deck failed");
          setIsShowSaveModal(false);
        } else {
          showAlertCard("green", "Success", "Save deck successful");
          setIsShowSaveModal(false);
          router.push("/dashboard");
        }
      } catch (error) {
        showAlertCard("red", "Error", "Save failed");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="h-screen p-8 flex sm:flex-row flex-col">
        {/* Left Side */}
        <div className="flex bg-white flex-1 border border-gray-300 rounded-md overflow-hidden">
          <div className="flex flex-col w-full h-full">
            {/* Left Header */}
            <div className="border-b p-4 border-gray-300">
              <div className="flex items-center justify-between text-[14px] mb-2">
                <h1 className="font-bold">Your Collection</h1>
                <p className="text-[11px] text-gray-400">6 cards available</p>
              </div>
              <div className="flex items-center border border-gray-300 bg-gray-100 text-[11px] rounded-md p-1.5 gap-1">
                <Search className="w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  className="outline-none w-full"
                />
              </div>
            </div>

            {/* Card List */}
            <div className=" grid grid-cols-3 gap-1 p-4 overflow-y-auto">
              {collection.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    handleAddToDeck(card);
                  }}
                  className="relative col-span-1"
                >
                  <img src={card.cardImgUrl}></img>
                  <div className="absolute bottom-0 right-0 bg-amber-600 w-5 h-5 flex items-center justify-center text-[12px] text-white p-1 rounded-full">
                    {card.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle */}
        <div className="p-2 flex sm:flex-col flex-row items-center justify-center gap-2">
          <div className="bg-amber-100 p-2 rounded-full">
            <ArrowRight className="w-4 h-4 stroke-amber-400 hidden sm:block" />
            <ArrowUp className="w-4 h-4 stroke-amber-400 sm:hidden block" />
          </div>
          <div className="bg-amber-100 p-2 rounded-full">
            <ArrowLeft className="w-4 h-4 stroke-amber-400 hidden sm:block" />
            <ArrowDown className="w-4 h-4 stroke-amber-400 sm:hidden block" />
          </div>
        </div>
        {/* -------- */}

        {/* Right Side */}
        <div className="flex bg-white flex-1 border border-gray-300 rounded-md overflow-hidden">
          <div className="flex flex-col w-full h-full">
            {/* Right Header */}
            <div className="border-b p-4 border-gray-300">
              <h1 className="font-bold text-[14px] mb-2">New Deck</h1>

              <div className="flex items-center justify-between text-[11px] gap-1">
                <div className="bg-amber-100 py-1 px-2 rounded-full text-amber-400">
                  {totalCardsInDeck}/51 cards
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <div
                    onClick={() => {
                      handleTrash();
                    }}
                    className=" bg-gray-100 border border-gray-300 px-2 py-1 rounded-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </div>
                  <div
                    onClick={() => {
                      handleSave();
                    }}
                    className="flex gap-1 items-center bg-amber-500 border border-gray-300 px-2 py-1 rounded-md text-[10px]"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </div>
                </div>
              </div>
            </div>

            {/* Card List */}
            {newDeck.length !== 0 ? (
              <div className=" grid grid-cols-3 gap-1 p-4 overflow-y-auto">
                {newDeck.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      handleRemoveFromDeck(card);
                    }}
                    className="relative col-span-1"
                  >
                    <img src={card.cardImgUrl}></img>
                    <div className="absolute bottom-0 right-0 bg-amber-600 w-5 h-5 flex items-center justify-center text-[12px] text-white p-1 rounded-full">
                      {card.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 w-full flex-1 text-[12px] text-gray-400 gap-1 text-center">
                <Plus /> <p>Click Cards from your collection to add them</p>
              </div>
            )}
          </div>
        </div>
        <div className="h-15 sm:hidden block"></div>
        {showAlert && (
          <div className="fixed z-9999 bottom-2 left-2 animate-left-slide-in">
            <AlertCard
              bgColor={alertAttribut.color}
              title={alertAttribut.title}
              subtitle={alertAttribut.subtitle}
            />
          </div>
        )}
        {loading ? <GlassLayer /> : <></>}
      </div>
      {isShowSaveModal && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setIsShowSaveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all scale-100"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h1 className="text-lg font-bold text-gray-800">
                Name Your Deck
              </h1>
              <button
                onClick={() => setIsShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Deck Name
              </label>
              <input
                value={deckName}
                onChange={(e) => {
                  setDeckName(e.target.value);
                }}
                type="text"
                autoFocus
                placeholder="e.g. Aggro Zoro v1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all placeholder:text-gray-400"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                Give your deck a unique name to easily find it later.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setIsShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleModalSave();
                  setIsShowSaveModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Save Deck
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="fixed inset-0 bg-black/90 z-99999 flex items-center justify-center text-white">
          <h1>Loading</h1>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default DeckBuilderClient;
