"use client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Save,
  Search,
  Trash2,
  X,
  Loader2,
  Layers,
  LayoutGrid,
  Filter,
  Import,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
  const [searchCardCollection, setSearchCardCollection] = useState("");

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
  }, [userInventory, existDeck]);

  const moveCard = (
    card: UserInventory,
    sourceList: UserInventory[],
    setSourceList: React.Dispatch<React.SetStateAction<UserInventory[]>>,
    targetList: UserInventory[],
    setTargetList: React.Dispatch<React.SetStateAction<UserInventory[]>>,
    addToNewDeck: boolean,
  ) => {
    const existingCardInTarget = targetList.find(
      (item) => item.cardId === card.cardId,
    );

    if (addToNewDeck && existingCardInTarget?.quantity === 4) {
      showAlertCard(
        "red",
        "Limit Reached",
        "Max 4 copies of the same card allowed.",
      );
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
      showAlertCard("red", "Leader Exists", "You can only have 1 Leader.");
      return;
    }

    if (addToNewDeck && totalCardsInDeck >= 51) {
      showAlertCard("red", "Deck Full", "Max 51 cards (1 Leader + 50 Deck).");
      return;
    }

    if (card.cardCategory === "Leader") {
      setLeaderId(card.cardId);
      setLeaderCardImg(card.cardImgUrl);
    }

    if (existingCardInTarget) {
      setTargetList((prev) =>
        prev.map((item) =>
          item.cardId === card.cardId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
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

  const totalCardsCollection = collection.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );

  const itHasLeader = newDeck.find((item) => item.cardCategory === "Leader");

  const handleTrash = () => {
    setNewDeck([]);
    setCollection(userInventory); // Reset collection visually not accurate but simple reset logic
  };

  const handleSave = () => {
    if (totalCardsInDeck !== 51) {
      showAlertCard(
        "red",
        "Invalid Deck Size",
        "Deck must have exactly 51 cards (1 Leader + 50 cards).",
      );
      return;
    }
    if (!itHasLeader) {
      showAlertCard(
        "red",
        "Missing Leader",
        "Deck must include a Leader card.",
      );
      return;
    }

    setIsShowSaveModal(true);
  };

  const handleImport = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText) {
        alert("Clipboard kosong! Silakan copy list kartu terlebih dahulu.");
        return;
      }

      const lines = clipboardText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      let importedDeck: UserInventory[] = [];
      let collectionCards: UserInventory[] = userInventory.map((card) => ({
        ...card,
      }));

      for (const line of lines) {
        const [quantityPart, cardIdPart] = line
          .split("x")
          .map((part) => part.trim());
        const quantity = parseInt(quantityPart, 10);
        const cardId = cardIdPart;

        const inventoryCard = userInventory.find(
          (card) => card.cardId === cardId,
        );

        if (!inventoryCard) {
          showAlertCard(
            "red",
            "Import Failed",
            `Card with ID ${cardId} not found in user inventory`,
          );
          importedDeck = [];
          collectionCards = userInventory;
          break;
        }

        if (quantity > inventoryCard.quantity) {
          showAlertCard(
            "red",
            "Import Failed",
            `You only have ${inventoryCard.quantity} copies of ${inventoryCard.cardName} (ID: ${inventoryCard.cardId}) in your inventory, but the imported deck requires ${quantity}.`,
          );
          importedDeck = [];
          collectionCards = userInventory;
          console.log(userInventory);
          break;
        }

        importedDeck.push({ ...inventoryCard, quantity });
        if (inventoryCard.quantity - quantity === 0) {
          collectionCards.splice(
            collectionCards.findIndex(
              (card) => card.cardId === inventoryCard.cardId,
            ),
            1,
          );
        } else {
          const index = collectionCards.findIndex(
            (card) => card.cardId === inventoryCard.cardId,
          );
          if (index !== -1) {
            collectionCards[index] = {
              ...inventoryCard,
              quantity: inventoryCard.quantity - quantity,
            };
          }
        }
      }

      setNewDeck(importedDeck);
      setCollection(collectionCards);
      if (importedDeck.length > 0) {
        showAlertCard(
          "green",
          "Import Success",
          "Deck list loaded from clipboard",
        );
      }
    } catch (error) {
      console.error("Gagal membaca clipboard:", error);
      showAlertCard("red", "Import Failed", "Please allow clipboard access");
    }
  };

  const handleModalSave = async () => {
    const payload = {
      userId: userData?.id,
      name: deckName,
      leaderCardId: leaderId,
      leaderCardImg: leaderCardImg,
      collection: collection,
      newDeck: newDeck,
      deckId: paramsId !== "create-new" ? paramsId : undefined,
    };

    const url =
      paramsId !== "create-new" ? "/api/edit-deck" : "/api/create-deck";
    const method = paramsId !== "create-new" ? "PUT" : "POST";

    try {
      setLoading(true);
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Save deck failed");
        setIsShowSaveModal(false);
      } else {
        showAlertCard("green", "Success", "Deck saved successfully!");
        setIsShowSaveModal(false);
        router.push("/dashboard");
      }
    } catch (error) {
      showAlertCard("red", "Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden">
        {/* --- LEFT SIDE: COLLECTION --- */}
        <div className="flex-1 flex flex-col h-[50vh] md:h-full border-b md:border-b-0 md:border-r border-slate-800">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 z-10 shadow-md">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-500" />
                Collection
              </h1>
              <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400 border border-slate-700">
                {totalCardsCollection} cards
              </span>
            </div>

            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              <input
                value={searchCardCollection}
                onChange={(e) => setSearchCardCollection(e.target.value)}
                type="text"
                placeholder="Search card name or ID..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/50">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {collection.map((card) => {
                const matches =
                  card.cardName
                    .toLowerCase()
                    .includes(searchCardCollection.toLowerCase()) ||
                  card.cardId
                    .toLowerCase()
                    .includes(searchCardCollection.toLowerCase());

                if (!matches) return null;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleAddToDeck(card)}
                    className="group relative cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-3/4 rounded-lg overflow-hidden border border-slate-800 group-hover:border-amber-500/50 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                      <img
                        src={card.cardImgUrl}
                        alt={card.cardName}
                        className="w-full h-full object-cover"
                      />

                      {/* Quantity Badge */}
                      <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                        x{card.quantity}
                      </div>

                      {/* Type Badge (Leader) */}
                      {card.cardCategory === "Leader" && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg">
                          L
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- MIDDLE: SEPARATOR (Desktop) / INDICATOR --- */}
        <div className="hidden md:flex flex-col justify-center items-center px-2 bg-slate-900 border-r border-slate-800 z-20">
          <div className="bg-slate-800 p-2 rounded-full mb-2">
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </div>
          <div className="h-16 w-px bg-slate-700"></div>
          <div className="bg-slate-800 p-2 rounded-full mt-2">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        {/* --- RIGHT SIDE: DECK --- */}
        <div className="flex-1 flex flex-col h-[50vh] md:h-full bg-slate-900">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 z-10 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Current Deck
              </h1>

              <div className="flex gap-2">
                <button
                  onClick={handleTrash}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Clear Deck"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold px-4 py-2 rounded-lg transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Deck</span>
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold px-4 py-2 rounded-lg transition-transform active:scale-95"
                >
                  <Import className="w-4 h-4" />
                  <span className="hidden sm:inline">Import Deck</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span
                  className={
                    totalCardsInDeck === 51
                      ? "text-green-400"
                      : "text-slate-400"
                  }
                >
                  {totalCardsInDeck} / 51 Cards
                </span>
                <span className="text-slate-500">Target: 50 + 1 Leader</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${totalCardsInDeck > 51 ? "bg-red-500" : totalCardsInDeck === 51 ? "bg-green-500" : "bg-amber-500"}`}
                  style={{
                    width: `${Math.min((totalCardsInDeck / 51) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900">
            {newDeck.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-3">
                <Layers className="w-16 h-16" />
                <p className="text-sm">
                  Deck is empty. Click cards on the left to add.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {newDeck.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleRemoveFromDeck(card)}
                    className="group relative cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <div
                      className={`relative aspect-3/4 rounded-lg overflow-hidden border transition-all ${card.cardCategory === "Leader" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-700 hover:border-red-500/50"}`}
                    >
                      <img
                        src={card.cardImgUrl}
                        alt={card.cardName}
                        className="w-full h-full object-cover"
                      />

                      {/* Quantity Badge */}
                      <div className="absolute bottom-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg border-t border-l border-slate-600">
                        x{card.quantity}
                      </div>

                      {/* Leader Badge */}
                      {card.cardCategory === "Leader" && (
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-lg pointer-events-none shadow-[inset_0_0_10px_rgba(245,158,11,0.5)]"></div>
                      )}

                      {/* Hover Remove Icon */}
                      <div className="absolute inset-0 bg-red-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-red-600 text-white p-1 rounded-full">
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SAVE MODAL --- */}
      {isShowSaveModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsShowSaveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <h1 className="text-lg font-bold text-white">Save Your Deck</h1>
              <button
                onClick={() => setIsShowSaveModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Deck Name
              </label>
              <input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                type="text"
                autoFocus
                placeholder="e.g. Zoro Rush V1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
              />
              <p className="text-xs text-slate-500 mt-3">
                Ensure your deck name is unique to easily identify it later in
                battle.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-slate-800 bg-slate-950/30">
              <button
                onClick={() => setIsShowSaveModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleModalSave();
                }}
                disabled={!deckName.trim()}
                className="px-6 py-2 text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-amber-900/20 transition-all active:scale-95"
              >
                Save Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ALERTS & LOADING --- */}
      {showAlert && (
        <div className="fixed z-110 bottom-5 right-5 animate-in slide-in-from-right-5">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 z-120 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <span className="text-white font-semibold">Saving Deck...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default DeckBuilderClient;
