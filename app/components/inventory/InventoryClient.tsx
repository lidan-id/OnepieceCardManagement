"use client";
import {
  Search,
  X,
  Filter,
  ShoppingBag,
  Wallet,
  PackageOpen,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import DropDown from "../ui/DropDown";
import AlertCard from "../ui/AlertCard";
import { useRouter } from "next/navigation";
import { Tooltip } from "@heroui/tooltip";
import { decodeHTMLEntities } from "@/app/helper/helper";

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

  const [searchText, setSearchText] = useState("");

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

  const openSellModal = (card: UserInventory, type: "market" | "system") => {
    setSellDetailCard(card);
    setUserStoredDeckCard(card.storedDeckQuantity);
    setUserCard(card.quantity);
    setQuantity(1);
    setUnitPrice(0);

    if (type === "market") setIsShowSellDetailMarket(true);
    else setIsShowSellDetailSystem(true);
  };

  const handleSellCard = async () => {
    if (quantity > userCard - userStoredDeckCard) {
      showAlertCard(
        "red",
        "Invalid Quantity",
        "Cannot sell cards currently in decks",
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
      } else {
        showAlertCard("green", "Success", "Card listed on marketplace");
        setIsShowSellDetailMarket(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSellCardSystem = async () => {
    if (quantity > userCard - userStoredDeckCard) {
      showAlertCard("red", "Invalid Quantity", "Not enough available cards");
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
      } else {
        showAlertCard("green", "Sold!", "Card sold to system");
        setIsShowSellDetailSystem(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = userInventory.filter(
    (card) => card.color.includes(selectedColor) || selectedColor === "",
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-8">
      {/* Header & Filters */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <PackageOpen className="w-8 h-8 text-amber-500" />
              Inventory
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your collection. You have{" "}
              <span className="text-amber-500 font-bold">
                {filteredInventory.length}
              </span>{" "}
              cards displayed.
            </p>
          </div>

          {/* Search & Filter Group */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all shadow-sm"
                placeholder="Search cards..."
              />
            </div>

            <div className="w-32 relative">
              <div className="pl-2">
                {" "}
                {/* Wrapper to adjust padding if DropDown doesn't support className */}
                <DropDown
                  listItem={[
                    "Red",
                    "Green",
                    "Blue",
                    "Purple",
                    "Yellow",
                    "Black",
                  ]}
                  setSelectedColor={setSelectedColor}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Display */}
        {filteredInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
            <p>No cards found with these filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredInventory.map((card, index) =>
              searchText === "" ||
              card.cardName.toLowerCase().includes(searchText.toLowerCase()) ||
              card.cardId.toLowerCase().includes(searchText.toLowerCase()) ? (
                <div
                  key={index}
                  className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col"
                >
                  {/* Card Image Area */}
                  <div
                    className="relative aspect-3/4 overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => {
                      setIsShowCard(true);
                      setShowCardUrl(card.cardImgUrl);
                    }}
                  >
                    <img
                      src={card.cardImgUrl}
                      alt={decodeHTMLEntities(card.cardName)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-2 right-2 z-10">
                      <Tooltip
                        content={
                          <span className="text-white text-xs font-medium">
                            Total quantity cards
                          </span>
                        }
                        showArrow={true}
                      >
                        <div className=" bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                          x{card.quantity}
                        </div>
                      </Tooltip>
                    </div>

                    {card.storedDeckQuantity > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <Tooltip
                          content={
                            <span className="text-white text-xs font-medium">
                              Stored in deck quantity
                            </span>
                          }
                          showArrow={true}
                        >
                          <div className="bg-slate-800/90 backdrop-blur border border-slate-600 text-slate-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help">
                            <PackageOpen className="w-3 h-3" />
                            {card.storedDeckQuantity}
                          </div>
                        </Tooltip>
                      </div>
                    )}

                    {/* Hover Overlay for Quick View */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-slate-300 truncate text-center">
                      {decodeHTMLEntities(card.cardName)}
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openSellModal(card, "market")}
                        className="bg-slate-800 hover:bg-amber-500 hover:text-slate-900 text-amber-500 border border-slate-700 hover:border-amber-500 text-[10px] font-bold py-1.5 rounded-lg transition-all active:scale-95 flex flex-col items-center gap-0.5"
                        title="Sell to Marketplace"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Market</span>
                      </button>
                      <button
                        onClick={() => openSellModal(card, "system")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition-all active:scale-95 flex flex-col items-center gap-0.5"
                        title="Quick Sell to System"
                      >
                        <Wallet className="w-3 h-3" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Image Preview Modal */}
      {isShowCard && (
        <div
          onClick={() => setIsShowCard(false)}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={showCardUrl}
              alt="Card Preview"
              className="w-full rounded-2xl shadow-2xl border border-slate-700"
            />
            <button
              onClick={() => setIsShowCard(false)}
              className="absolute -top-12 right-0 text-white hover:text-amber-500 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Marketplace Sell Modal */}
      {isShowSellDetailMarket && sellDetailCard && (
        <SellModal
          title="List on Marketplace"
          subtitle="Set your price. Other players can buy this from you."
          card={sellDetailCard}
          onClose={() => setIsShowSellDetailMarket(false)}
          onConfirm={handleSellCard}
          loading={loading}
          type="market"
          quantity={quantity}
          setQuantity={setQuantity}
          unitPrice={unitPrice}
          setUnitPrice={setUnitPrice}
          maxQty={sellDetailCard.quantity - sellDetailCard.storedDeckQuantity}
        />
      )}

      {/* 3. System Sell Modal */}
      {isShowSellDetailSystem && sellDetailCard && (
        <SellModal
          title="Quick Sell to System"
          subtitle="Sell instantly for 50% of base value."
          card={sellDetailCard}
          onClose={() => setIsShowSellDetailSystem(false)}
          onConfirm={handleSellCardSystem}
          loading={loading}
          type="system"
          quantity={quantity}
          setQuantity={setQuantity}
          maxQty={sellDetailCard.quantity - sellDetailCard.storedDeckQuantity}
        />
      )}

      {/* Alert Toast */}
      {showAlert && (
        <div className="fixed z-110 bottom-5 right-5 animate-in slide-in-from-right-5">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}
    </div>
  );
};

const SellModal = ({
  title,
  subtitle,
  card,
  onClose,
  onConfirm,
  loading,
  type,
  quantity,
  setQuantity,
  unitPrice,
  setUnitPrice,
  maxQty,
}: any) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
    >
      <div
        className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Info */}
          <div className="flex gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <img
              src={card.cardImgUrl}
              className="w-16 h-auto rounded-md"
              alt=""
            />
            <div>
              <h4 className="font-bold text-slate-200">
                {decodeHTMLEntities(card.cardName)}
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
                  Total: {card.quantity}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
                  Available: {maxQty}
                </span>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Quantity to Sell
              </label>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              {quantity > maxQty && (
                <p className="text-xs text-red-500 mt-1">
                  Cannot sell more than available amount ({maxQty}).
                </p>
              )}
            </div>

            {type === "market" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Unit Price (¥)
                </label>
                <input
                  type="number"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Summary Box */}
          {type === "market" ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
              <p className="text-xs text-amber-500 text-center">
                Total listing value:{" "}
                <span className="font-bold font-mono">
                  ¥ {(quantity * unitPrice).toLocaleString()}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-10 bg-slate-800 p-3 rounded-lg text-xs text-slate-400">
              <ol className="list-disc list-inside space-y-1">
                <li>Common: 10 ¥</li>
                <li>Leader: 10 ¥</li>
                <li>Uncommon: 20 ¥</li>
                <li>Rare: 30 ¥</li>
              </ol>
              <ol className="list-disc list-inside space-y-1">
                <li>Promo: 40 ¥</li>
                <li>Super Rare: 50 ¥</li>
                <li>Secret Rare: 100 ¥</li>
                <li>Special: 500 ¥</li>
              </ol>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-slate-800 flex gap-3 bg-slate-900">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || quantity <= 0 || quantity > maxQty}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirm Sell"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryClient;
