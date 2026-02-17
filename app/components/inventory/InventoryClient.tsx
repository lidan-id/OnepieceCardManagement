"use client";
import { Search, X } from "lucide-react";
import React, { useState } from "react";
import DropDown from "../ui/DropDown";
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
}

const InventoryClient = ({
  userInventory,
  userData,
}: {
  userInventory: UserInventory[];
  userData: { id: string; username: string; email: string } | null;
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

  const [isShowCard, setIsShowCard] = useState(false);
  const [showCardUrl, setShowCardUrl] = useState("");

  const [selectedColor, setSelectedColor] = useState("");

  const [isShowSellDetailMarket, setIsShowSellDetailMarket] = useState(false);
  const [isShowSellDetailSystem, setIsShowSellDetailSystem] = useState(false);
  const [sellDetailCard, setSellDetailCard] = useState<UserInventory | null>(
    null,
  );

  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [userStoredDeckCard, setUserStoredDeckCard] = useState(0);
  const [userCard, setUserCard] = useState(0);

  const [loading, setLoading] = useState(false);

  const handleSellCard = async () => {
    if (quantity > userCard - userStoredDeckCard) {
      showAlertCard(
        "red",
        "Card Quantity Invalid",
        "U can't sell card that is stored in deck",
      );
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: sellDetailCard?.cardId,
          sellerId: userData?.id,
          price: unitPrice,
          quantity,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Sell card failed");
        setIsShowSellDetailMarket(false);
      } else {
        showAlertCard("green", "Success", "Sell card successful");
        setIsShowSellDetailMarket(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSellCardSystem = async () => {
    if (quantity > userCard - userStoredDeckCard) {
      showAlertCard("red", "Card Quantity Invalid", "Not enough card to sell");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("api/sell-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: sellDetailCard?.cardId,
          quantity,
          userId: userData?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Sell card failed");
        setIsShowSellDetailSystem(false);
      } else {
        showAlertCard("green", "Success", "Sell card successful");
        setIsShowSellDetailSystem(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Inventory */}
      <h1 className="text-[22px] font-bold">Inventory</h1>
      <p className="text-[13px] text-gray-500 mb-5">
        Manage your card collection
      </p>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search */}
        <div className="border flex text-[11px] w-fit border-gray-400 p-1.5 rounded-md items-center gap-1.5 focus-within:border-amber-400">
          <Search className="w-3 h-3" />
          <input
            className="outline-none"
            type="text"
            placeholder="Search cards..."
          />
        </div>

        {/* Types */}
        <div className="w-22">
          <DropDown
            listItem={["Red", "Green", "Blue", "Purple", "Yellow", "Black"]}
            setSelectedColor={setSelectedColor}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {userInventory.map((card, index) => {
          return card.color.includes(selectedColor) || selectedColor === "" ? (
            <div
              key={index}
              className="col-span-1 cursor-pointer bg-slate-900 p-2"
            >
              <div className="relative">
                <img
                  onClick={() => {
                    setIsShowCard(true);
                    setShowCardUrl(card.cardImgUrl);
                  }}
                  className="hover:scale-105 transition-transform duration-300"
                  src={card.cardImgUrl}
                ></img>
                <div className="absolute bottom-0 right-0 bg-amber-600 w-5 h-5 flex items-center justify-center text-[12px] text-white p-1 rounded-full">
                  {card.quantity}
                </div>
                <div className="absolute top-0 right-0 bg-slate-900  h-5 flex items-center justify-center text-[12px] text-white p-1 rounded-sm">
                  {card.storedDeckQuantity} stored in deck
                </div>
              </div>
              <button
                onClick={() => {
                  setSellDetailCard(card);
                  setIsShowSellDetailMarket(true);
                  setUserStoredDeckCard(card.storedDeckQuantity);
                  setUserCard(card.quantity);
                }}
                className="w-full bg-amber-400 text-[12px] p-1 rounded-md mt-2"
              >
                Sell This Card (Marketplace)
              </button>
              <button
                onClick={() => {
                  setSellDetailCard(card);
                  setIsShowSellDetailSystem(true);
                  setUserStoredDeckCard(card.storedDeckQuantity);
                  setUserCard(card.quantity);
                }}
                className="w-full bg-amber-400 text-[12px] p-1 rounded-md mt-2"
              >
                Sell This Card (System)
              </button>
            </div>
          ) : null;
        })}
      </div>
      {isShowCard && (
        <div
          onClick={() => {
            setIsShowCard(false);
          }}
          className="flex items-center z-9999 justify-center fixed inset-0 bg-black/80 "
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img src={showCardUrl} alt="" />
          </div>
        </div>
      )}

      {/* Modal Sell Card (Marketplace) */}
      {isShowSellDetailMarket && sellDetailCard && (
        <div
          onClick={() => {
            setIsShowSellDetailMarket(false);
          }}
          className="flex items-center justify-center fixed inset-0 z-50 bg-black/80"
        >
          <div
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="bg-white p-3 w-full max-w-100 rounded-md mx-auto">
              <div className="flex items-center text-[12px] justify-between">
                <h3>Sell Card</h3>
                <X
                  onClick={() => {
                    setIsShowSellDetailMarket(false);
                  }}
                  className="w-3 h-3"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-20">
                  <img
                    src={sellDetailCard.cardImgUrl}
                    className="w-full h-full"
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-[14px] font-bold">
                    {sellDetailCard.cardName}
                  </h1>
                  <p className="text-[12px] text-gray-400">
                    Quantity - {sellDetailCard.quantity}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    Stored in Deck - {sellDetailCard.storedDeckQuantity}
                  </p>
                </div>
              </div>

              {/* Transaction */}
              <div className="w-full border border-amber-200 bg-amber-50 p-3 mt-2 rounded-md mb-2">
                <h1 className="text-[12px] text-amber-400 mb-1">
                  Transaction With Other Player
                </h1>
                <p className="text-[11px] text-gray-400 leading-3 mb-2">
                  Please enter make sense price. This system relies on community
                  trust.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-full text-[12px]">
                    <h1>Unit Price</h1>
                    <input
                      value={unitPrice}
                      onChange={(e) => {
                        setUnitPrice(Number(e.target.value));
                      }}
                      type="number"
                      className="border bg-white rounded-sm w-full p-1 border-gray-400"
                    />
                  </div>
                  <div className="w-full text-[12px]">
                    <h1>Quantity</h1>
                    <input
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(Number(e.target.value));
                      }}
                      type="number"
                      className="border bg-white rounded-sm w-full p-1 border-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center text-[11px] gap-2">
                <button
                  onClick={() => {
                    setIsShowSellDetailMarket(false);
                  }}
                  className="border p-1 px-2 rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSellCard}
                  className="border p-1 px-2 rounded-md border-gray-300 bg-amber-400 hover:bg-amber-500"
                >
                  {loading ? "Loading..." : "Sell Card"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isShowSellDetailSystem && sellDetailCard && (
        <div
          onClick={() => {
            setIsShowSellDetailSystem(false);
          }}
          className="flex items-center justify-center fixed inset-0 z-50 bg-black/80"
        >
          <div
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="bg-white p-3 w-full max-w-100 rounded-md mx-auto">
              <div className="flex items-center text-[12px] justify-between">
                <h3>Sell Card</h3>
                <X
                  onClick={() => {
                    setIsShowSellDetailSystem(false);
                  }}
                  className="w-3 h-3"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-20">
                  <img
                    src={sellDetailCard.cardImgUrl}
                    className="w-full h-full"
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-[14px] font-bold">
                    {sellDetailCard.cardName}
                  </h1>
                  <p className="text-[12px] text-gray-400">
                    Quantity - {sellDetailCard.quantity}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    Stored in Deck - {sellDetailCard.storedDeckQuantity}
                  </p>
                </div>
              </div>

              {/* Transaction */}
              <div className="w-full border border-amber-200 bg-amber-50 p-3 mt-2 rounded-md mb-2">
                <h1 className="text-[12px] text-amber-400 mb-1">
                  Transaction With System
                </h1>
                <p className="text-[11px] text-gray-400 leading-3 mb-2">
                  You only get half price from purchase price
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-[50%] text-[12px]">
                    <h1>Quantity</h1>
                    <input
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(Number(e.target.value));
                      }}
                      type="number"
                      className="border bg-white rounded-sm w-full p-1 border-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center text-[11px] gap-2">
                <button
                  onClick={() => {
                    setIsShowSellDetailSystem(false);
                  }}
                  className="border p-1 px-2 rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSellCardSystem}
                  className="border p-1 px-2 rounded-md border-gray-300 bg-amber-400 hover:bg-amber-500"
                >
                  {loading ? "Loading..." : "Sell Card"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  );
};

export default InventoryClient;
