"use client";
import { CardDetailProps } from "@/app/types/Card";
import {
  Search,
  ShoppingBag,
  Users,
  X,
  Store,
  Tag,
  Loader2,
  Info,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import AlertCard from "../ui/AlertCard";
import { Marketplace } from "@/app/types/Marketplace";
import { useRouter } from "next/navigation";
import { decodeHTMLEntities } from "@/app/helper/helper";
import PreviewCard from "../global/PreviewCard";

const MarketPlaceClient = ({
  userData,
  data,
  marketplaceData,
}: {
  userData: { id: string; username: string; email: string } | null;
  data: CardDetailProps[];
  marketplaceData: Marketplace[];
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

  const [searchValue, setSearchValue] = useState("");
  const [shopIndex, setShopIndex] = useState(0);
  const [ITEMS_PER_ROW, setITEMS_PER_ROW] = useState(3);

  // --- RESIZE LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setITEMS_PER_ROW(2);
      } else if (width < 1024) {
        setITEMS_PER_ROW(3);
      } else if (width < 1280) {
        setITEMS_PER_ROW(4);
      } else {
        setITEMS_PER_ROW(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    if (!searchValue) return data;
    const lowerSearch = searchValue.toLowerCase();
    return data.filter(
      (card) =>
        decodeHTMLEntities(card.name).toLowerCase().includes(lowerSearch) ||
        card.id.toLowerCase().includes(lowerSearch),
    );
  }, [data, searchValue]);

  const filteredMarketplaceData = useMemo(() => {
    if (!searchValue) return marketplaceData;
    const lowerSearch = searchValue.toLowerCase();
    console.log(marketplaceData);
    return marketplaceData.filter(
      (card) =>
        decodeHTMLEntities(card.inventory.cardName)
          .toLowerCase()
          .includes(lowerSearch) ||
        card.inventory.cardId.toLowerCase().includes(lowerSearch),
    );
  }, [marketplaceData, searchValue]);

  // --- ROW GENERATION FOR VIRTUOSO ---
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredData.length; i += ITEMS_PER_ROW) {
      result.push(filteredData.slice(i, i + ITEMS_PER_ROW));
    }
    return result;
  }, [filteredData, ITEMS_PER_ROW]);

  const rowsMarketplace = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredMarketplaceData.length; i += ITEMS_PER_ROW) {
      result.push(filteredMarketplaceData.slice(i, i + ITEMS_PER_ROW));
    }
    return result;
  }, [filteredMarketplaceData, ITEMS_PER_ROW]);

  // --- STATES ---
  const [isShowCard, setIsShowCard] = useState(false);
  const [showCardId, setShowCardId] = useState("");

  const [isShowRemoveModal, setIsShowRemoveModal] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<Marketplace | null>(null);

  const [isShowDetailPurchase, setIsShowDetailPurchase] = useState(false);
  const [ShowDetailPurchase, setShowDetailPurchase] =
    useState<CardDetailProps | null>(null);

  const [isShowDetailMarketplacePurchase, setIsShowDetailMarketplacePurchase] =
    useState(false);
  const [ShowDetailMarketplacePurchase, setShowDetailMarketplacePurchase] =
    useState<Marketplace | null>(null);

  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  const openSystemBuyModal = (card: CardDetailProps) => {
    setMarketPrices({ lowest: null, highest: null });
    setShowDetailPurchase(card);
    setUnitPrice(0);
    setQuantity(1);
    setIsShowDetailPurchase(true);
  };

  const openUserBuyModal = (marketItem: Marketplace) => {
    setShowDetailMarketplacePurchase(marketItem);
    setIsShowDetailMarketplacePurchase(true);
  };

  const openRemoveModal = (marketItem: Marketplace) => {
    setCardToRemove(marketItem);
    setIsShowRemoveModal(true);
  };

  const handleRemoveListing = async () => {
    if (!cardToRemove) return;

    try {
      setLoading(true);
      const response = await fetch(`api/cancel-usermarket`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: cardToRemove.id,
          userId: userData?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showAlertCard(
          "red",
          "Error",
          result.message || "Failed to remove listing",
        );
      } else {
        showAlertCard("green", "Success", "Listing removed successfully");
        setIsShowRemoveModal(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCard = async () => {
    if (quantity <= 0) return;

    try {
      setLoading(true);
      const response = await fetch("api/user-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData!.id,
          cardId: ShowDetailPurchase!.id,
          cardName: ShowDetailPurchase!.name,
          cardImgUrl: ShowDetailPurchase!.img_full_url,
          colors: ShowDetailPurchase!.colors,
          isStoredDeck: false,
          purchasePrice: unitPrice,
          quantity,
          cardCategory: ShowDetailPurchase?.category,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Purchase failed");
      } else {
        showAlertCard("green", "Success", "Purchase successful");
        setIsShowDetailPurchase(false);
      }
    } catch (error) {
      showAlertCard("red", "Error", "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyMarketplaceCard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`api/marketplace-buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketplaceId: ShowDetailMarketplacePurchase?.id,
          userId: userData?.id,
          sellerId: ShowDetailMarketplacePurchase?.sellerId,
          cardId: ShowDetailMarketplacePurchase?.inventory.cardId,
          cardName: ShowDetailMarketplacePurchase?.inventory.cardName,
          cardImgUrl: ShowDetailMarketplacePurchase?.inventory.cardImgUrl,
          colors: ShowDetailMarketplacePurchase?.inventory.color,
          isStoredDeck: ShowDetailMarketplacePurchase?.inventory.isStoredInDeck,
          purchasePrice: ShowDetailMarketplacePurchase?.price,
          cardCategory: ShowDetailMarketplacePurchase?.inventory.cardCategory,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Purchase failed");
      } else {
        showAlertCard("green", "Success", data.body);
        setIsShowDetailMarketplacePurchase(false);
        router.refresh();
      }
    } catch (error) {
      showAlertCard("red", "Error", "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [marketPrices, setMarketPrices] = useState<{
    lowest: number | null;
    highest: number | null;
  }>({ lowest: null, highest: null });

  const handleFindPrice = async () => {
    if (!ShowDetailPurchase) return;
    setIsFetchingPrice(true);
    const cardId = ShowDetailPurchase.id.split("_")[0];
    try {
      const response = await fetch(`/api/scrape-price?id=${cardId}`);
      const priceData = await response.json();
      console.log("Raw response from price API:", priceData);
      if (
        priceData.success &&
        priceData.lowestPrice !== undefined &&
        priceData.highestPrice !== undefined
      ) {
        setMarketPrices({
          lowest: priceData.lowestPrice,
          highest: priceData.highestPrice,
        });
      } else {
        setMarketPrices({ lowest: null, highest: null });
        showAlertCard(
          "red",
          "Market Error",
          priceData.error || "Failed to fetch price",
        );
      }
      console.log("Fetched price data:", priceData);
    } catch (error) {
      showAlertCard(
        "red",
        "Error",
        "Failed to fetch price data. Please try again later.",
      );
      console.error("Failed to fetch price data:", error);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-200">
      {/* --- HEADER --- */}
      <div className="flex-none p-6 md:p-8 space-y-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Store className="w-8 h-8 text-amber-500" />
              Marketplace
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Acquire new cards from the system or trade with other captains.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex">
            <button
              onClick={() => setShopIndex(0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                shopIndex === 0
                  ? "bg-amber-500 text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              System Shop
            </button>
            <button
              onClick={() => setShopIndex(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                shopIndex === 1
                  ? "bg-amber-500 text-slate-900 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              User Market
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Search for cards by name or ID..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* --- LIST SECTION (Virtuoso) --- */}
      <div className="flex-1 bg-slate-950 p-4">
        {/* SYSTEM SHOP VIEW */}
        {shopIndex === 0 && (
          <Virtuoso
            style={{ height: "100%" }}
            totalCount={rows.length}
            className="custom-scrollbar"
            itemContent={(index) => {
              const rowItems = rows[index];
              const emptySlots = Math.max(0, ITEMS_PER_ROW - rowItems.length);

              return (
                <div
                  className="grid gap-4 mb-4 px-2"
                  style={{
                    gridTemplateColumns: `repeat(${ITEMS_PER_ROW}, minmax(0, 1fr))`,
                  }}
                >
                  {rowItems.map((card) => (
                    <div
                      key={card.id}
                      className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all flex flex-col"
                    >
                      {/* Image */}
                      <div
                        className="relative aspect-3/4 bg-slate-950 cursor-zoom-in overflow-hidden"
                        onClick={() => {
                          setIsShowCard(true);
                          setShowCardId(card.id);
                        }}
                      >
                        {card.img_full_url ? (
                          <img
                            src={card.img_full_url}
                            alt={decodeHTMLEntities(card.name)}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                            No Image
                          </div>
                        )}
                        {/* Quick Badge */}
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-[10px] text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {card.id}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex flex-col flex-1 gap-2">
                        <div>
                          <h3
                            className="text-sm font-bold text-white truncate"
                            title={decodeHTMLEntities(card.name)}
                          >
                            {decodeHTMLEntities(card.name)}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            {card.category}
                          </p>
                        </div>

                        <button
                          onClick={() => openSystemBuyModal(card)}
                          className="mt-auto w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-900 text-amber-500 border border-slate-700 hover:border-amber-500 text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Buy Card
                        </button>
                      </div>
                    </div>
                  ))}
                  {[...Array(emptySlots)].map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1" />
                  ))}
                </div>
              );
            }}
          />
        )}

        {/* USER MARKETPLACE VIEW */}
        {shopIndex === 1 && (
          <Virtuoso
            style={{ height: "100%" }}
            totalCount={rowsMarketplace.length}
            className="custom-scrollbar"
            itemContent={(index) => {
              const rowItems = rowsMarketplace[index];
              const emptySlots = Math.max(0, ITEMS_PER_ROW - rowItems.length);

              return (
                <div
                  className="grid gap-4 mb-4 px-2"
                  style={{
                    gridTemplateColumns: `repeat(${ITEMS_PER_ROW}, minmax(0, 1fr))`,
                  }}
                >
                  {rowItems.map((marketItem) => (
                    <div
                      key={marketItem.id}
                      className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all flex flex-col"
                    >
                      {/* Image */}
                      <div
                        className="relative aspect-3/4 bg-slate-950 cursor-zoom-in overflow-hidden"
                        onClick={() => {
                          setIsShowCard(true);
                          setShowCardId(marketItem.inventory.cardId);
                        }}
                      >
                        <img
                          src={marketItem.inventory.cardImgUrl}
                          alt={decodeHTMLEntities(
                            marketItem.inventory.cardName,
                          )}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Price Tag */}
                        <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 px-2 py-1 rounded-tl-lg font-bold text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {marketItem.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 flex flex-col flex-1 gap-2 ">
                        <div>
                          <h3 className="text-sm font-bold text-white truncate">
                            {decodeHTMLEntities(marketItem.inventory.cardName)}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            Seller:{" "}
                            <span className="text-amber-500">
                              {marketItem.sellerId.substring(0, 8)}...
                            </span>
                          </p>
                        </div>

                        {userData?.id !== marketItem.sellerId && (
                          <button
                            onClick={() => openUserBuyModal(marketItem)}
                            className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-900 text-amber-500 border border-slate-700 hover:border-amber-500 text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Users className="w-3 h-3" />
                            Buy from User
                          </button>
                        )}

                        {userData?.id === marketItem.sellerId && (
                          <button
                            onClick={() => openRemoveModal(marketItem)}
                            className="mt-auto w-full bg-slate-800 hover:bg-red-900 hover:text-white text-red-500 border border-slate-700 hover:border-red-900 text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {[...Array(emptySlots)].map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1" />
                  ))}
                </div>
              );
            }}
          />
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Image Preview */}
      {isShowCard && (
        <PreviewCard setIsShowCard={setIsShowCard} cardId={showCardId} />
      )}

      {/* 2. System Purchase Modal */}
      {isShowDetailPurchase && ShowDetailPurchase && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => {
            setIsShowDetailPurchase(false);
            setMarketPrices({ lowest: null, highest: null });
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            // max-w-md diubah jadi max-w-3xl agar lebih lebar, dan ditambahkan max-h-[95vh] flex flex-col agar footer tidak terpotong
            className="bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* HEADER (Sticky di atas) */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">System Shop</h3>
                <p className="text-xs text-slate-400">
                  Buy cards directly from the game.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsShowDetailPurchase(false);
                  setMarketPrices({ lowest: null, highest: null });
                }}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY (Dibagi jadi 2 Kolom) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8">
              {/* --- KOLOM KIRI (Info Kartu & Peringatan) --- */}
              <div className="w-full md:w-5/12 flex flex-col gap-4 shrink-0">
                <div className="relative aspect-3/4 w-full max-w-50 mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                  <img
                    src={ShowDetailPurchase.img_full_url}
                    className="w-full h-full object-cover"
                    alt={decodeHTMLEntities(ShowDetailPurchase.name)}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-200 text-lg">
                    {decodeHTMLEntities(ShowDetailPurchase.name)}
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full mt-1.5 inline-block font-semibold uppercase tracking-wider border border-slate-700">
                    {ShowDetailPurchase.category}
                  </span>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex gap-3 items-start mt-auto">
                  <Info className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-500 mb-1">
                      Honesty-Based System
                    </h5>
                    <p className="text-[11px] text-amber-500/80 leading-relaxed">
                      Since this is a manual shop, please enter the agreed
                      community price.
                    </p>
                  </div>
                </div>
              </div>

              {/* --- KOLOM KANAN (Harga & Input) --- */}
              <div className="w-full md:w-7/12 flex flex-col justify-center space-y-6">
                {/* Fitur Find Price */}
                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Market Reference
                    </span>
                    <button
                      type="button"
                      onClick={handleFindPrice}
                      disabled={isFetchingPrice}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 font-bold border border-slate-700 hover:border-amber-500/50"
                    >
                      {isFetchingPrice ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      {isFetchingPrice ? "Searching..." : "Find Price"}
                    </button>
                  </div>

                  {marketPrices.lowest !== null &&
                  marketPrices.highest !== null ? (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                      <div
                        onClick={() => setUnitPrice(marketPrices.lowest!)}
                        className="bg-green-950/20 border border-green-900/50 hover:bg-green-900/40 hover:border-green-500/50 cursor-pointer p-3 rounded-xl flex flex-col items-center justify-center transition-all group"
                        title="Click to set lowest price"
                      >
                        <span className="text-[10px] text-green-500 uppercase font-bold mb-1 group-hover:text-green-400">
                          Lowest Price
                        </span>
                        <span className="text-lg text-green-400 font-extrabold group-hover:text-green-300">
                          ¥ {marketPrices.lowest.toLocaleString() ?? 0}
                        </span>
                      </div>
                      <div
                        onClick={() => setUnitPrice(marketPrices.highest!)}
                        className="bg-red-950/20 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500/50 cursor-pointer p-3 rounded-xl flex flex-col items-center justify-center transition-all group"
                        title="Click to set highest price"
                      >
                        <span className="text-[10px] text-red-500 uppercase font-bold mb-1 group-hover:text-red-400">
                          Highest Price
                        </span>
                        <span className="text-lg text-red-400 font-extrabold group-hover:text-red-300">
                          ¥ {marketPrices.highest.toLocaleString() ?? 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-600 italic">
                      Click "Find Price" to scan market values.
                    </div>
                  )}
                </div>

                {/* Form Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Unit Price (¥)
                    </label>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-800">
                  <span className="text-sm font-semibold text-slate-400">
                    Total Calculation:
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-500">
                      ¥ {(unitPrice * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER (Sticky di Bawah) */}
            <div className="p-5 border-t border-slate-800 flex gap-3 bg-slate-900 shrink-0">
              <button
                onClick={() => {
                  setIsShowDetailPurchase(false);
                  setMarketPrices({ lowest: null, highest: null });
                }}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyCard}
                disabled={loading || unitPrice <= 0 || quantity <= 0}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Marketplace Purchase Modal */}
      {isShowDetailMarketplacePurchase && ShowDetailMarketplacePurchase && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setIsShowDetailMarketplacePurchase(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Buy from Player
                </h3>
                <p className="text-xs text-slate-400">
                  You are buying a single card listing.
                </p>
              </div>
              <button
                onClick={() => setIsShowDetailMarketplacePurchase(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Card Info */}
              <div className="flex gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <img
                  src={ShowDetailMarketplacePurchase.inventory.cardImgUrl}
                  className="w-16 h-auto rounded-md"
                  alt=""
                />
                <div>
                  <h4 className="font-bold text-slate-200">
                    {decodeHTMLEntities(
                      ShowDetailMarketplacePurchase.inventory.cardName,
                    )}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      ID: {ShowDetailMarketplacePurchase.inventory.cardId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Price per unit</p>
                  <p className="text-2xl font-bold text-white">
                    ¥ {ShowDetailMarketplacePurchase.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Quantity</p>
                  <p className="text-lg font-bold text-amber-500">x1</p>
                </div>
              </div>

              <p className="text-xs text-center text-slate-500">
                By confirming, you will transfer{" "}
                <span className="text-white">
                  ¥ {ShowDetailMarketplacePurchase.price.toLocaleString()}
                </span>{" "}
                to the seller.
              </p>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3 bg-slate-900">
              <button
                onClick={() => setIsShowDetailMarketplacePurchase(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyMarketplaceCard}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Remove Listing Modal */}
      {isShowRemoveModal && cardToRemove && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setIsShowRemoveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 w-full max-w-sm rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 bg-red-500/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                <X className="w-5 h-5" />
                Remove Listing?
              </h3>
              <button
                onClick={() => setIsShowRemoveModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-20 h-28 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mb-2">
                <img
                  src={cardToRemove.inventory.cardImgUrl}
                  className="w-full h-full object-cover opacity-50 grayscale"
                  alt=""
                />
              </div>

              <p className="text-sm text-slate-300">
                Are you sure you want to remove{" "}
                <span className="text-white font-bold">
                  {decodeHTMLEntities(cardToRemove.inventory.cardName)}
                </span>{" "}
                from the market?
              </p>
              <p className="text-xs text-slate-500">
                The card will be returned to your inventory and will be
                available for deck building again.
              </p>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3 bg-slate-900">
              <button
                onClick={() => setIsShowRemoveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveListing}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Remove Card"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ALERTS & OVERLAYS --- */}
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
            <span className="text-white font-semibold">
              Processing Transaction...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPlaceClient;
