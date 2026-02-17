"use client";
import { CardDetailProps } from "@/app/types/Card";
import { Search, ShoppingBag, Users, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import AlertCard from "../ui/AlertCard";
import GlassLayer from "../ui/GlassLayer";
import { Marketplace } from "@/app/types/Marketplace";
import { useRouter } from "next/navigation";

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
  useEffect(() => {
    setIsShowCard(false);
    setIsShowDetailPurchase(false);
  }, []);

  const [shopIndex, setShopIndex] = useState(0);

  // Initialize with a safe default, will update on mount
  const [ITEMS_PER_ROW, setITEMS_PER_ROW] = useState(3);

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

    handleResize(); // Set initial value correctly
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchValue) return data;
    const lowerSearch = searchValue.toLowerCase();
    return data.filter(
      (card) =>
        card.name.toLowerCase().includes(lowerSearch) ||
        card.id.toLowerCase().includes(lowerSearch),
    );
  }, [data, searchValue]);

  const filteredMarketplaceData = useMemo(() => {
    if (!searchValue) return marketplaceData;
    const lowerSearch = searchValue.toLowerCase();
    return marketplaceData.filter(
      (card) =>
        card.inventory.cardName.toLowerCase().includes(lowerSearch) ||
        card.inventory.cardId.toLowerCase().includes(lowerSearch),
    );
  }, [marketplaceData, searchValue]);

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

  const [isShowCard, setIsShowCard] = useState(false);
  const [showCardUrl, setShowCardUrl] = useState("");

  const [isShowDetailPurchase, setIsShowDetailPurchase] = useState(true);
  const [ShowDetailPurchase, setShowDetailPurchase] =
    useState<CardDetailProps | null>(null);

  const [isShowDetailMarketplacePurchase, setIsShowDetailMarketplacePurchase] =
    useState(true);
  const [ShowDetailMarketplacePurchase, setShowDetailMarketplacePurchase] =
    useState<Marketplace | null>(null);

  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const [loading, setLoading] = useState(false);

  // ... (handleBuyCard and handleBuyMarketplaceCard functions remain unchanged)
  const handleBuyCard = async () => {
    if (quantity <= 0) {
      return;
    }
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
        setIsShowDetailPurchase(false);
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
        setIsShowDetailMarketplacePurchase(false);
      } else {
        showAlertCard("green", "Success", data.body);
        router.refresh();
        setIsShowDetailMarketplacePurchase(false);
      }
    } catch (error) {
      showAlertCard("red", "Error", "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden p-8 gap-5">
      {/* --- HEADER --- */}
      <div className="flex-none">
        <h1 className="text-[22px] font-bold">Marketplace</h1>
        <p className="text-[13px] text-gray-500 ">
          Buy and sell cards with the community
        </p>

        {/* Search */}
        <div className="flex my-3 items-center text-[11px] gap-2 border focus-within:border-amber-400 border-gray-400 p-1.5 rounded-md w-80 bg-white">
          <Search className="w-3 h-3" />
          <input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            className="outline-none w-full"
            type="text"
            placeholder="Search cards"
          />
        </div>

        {/* Navigation */}
        <div className="bg-gray-300 p-1 rounded-md w-fit flex gap-1">
          <div
            onClick={() => setShopIndex(0)}
            className={`cursor-pointer rounded-md gap-1 py-1 px-1.5 flex items-center text-[11px] ${shopIndex === 0 ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            <ShoppingBag className="w-3 h-3" /> System Shop
          </div>
          <div
            onClick={() => setShopIndex(1)}
            className={`cursor-pointer rounded-md gap-1 py-1 px-1.5 flex items-center text-[11px] ${shopIndex === 1 ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            <Users className="w-3 h-3" /> User Marketplace
          </div>
        </div>
      </div>

      {/* --- LIST SECTION (Virtuoso) --- */}
      {shopIndex === 0 && (
        <div className="flex-1  rounded-lg bg-gray-50 pb-1">
          <Virtuoso
            style={{ height: "100%" }}
            totalCount={rows.length}
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
                      className="flex-1 col-span-1 w-full border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-62.5 w-full bg-gray-50 mb-2 rounded flex items-center justify-center overflow-hidden">
                        {card.img_full_url && card.img_full_url !== "" ? (
                          <img
                            src={card.img_full_url}
                            alt={card.name}
                            className="object-contain w-full h-full cursor-zoom-in"
                            loading="lazy"
                            onClick={() => {
                              setIsShowCard(true);
                              setShowCardUrl(card.img_full_url);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold truncate px-1">
                        {card.name}
                      </p>
                      <p className="text-[10px] text-gray-500 px-1">
                        {card.id}
                      </p>
                      <button
                        onClick={() => {
                          setIsShowDetailPurchase(true);
                          setShowDetailPurchase(card);
                        }}
                        className="bg-amber-400 w-full text-[12px] p-2 rounded-md mt-2"
                      >
                        Buy
                      </button>
                    </div>
                  ))}

                  {/* Spacer Kosong (Agar baris terakhir rata kiri) */}
                  {/* SAFE ARRAY GENERATION */}
                  {[...Array(emptySlots)].map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1" />
                  ))}
                </div>
              );
            }}
          />
        </div>
      )}

      {/* User Marketplace */}
      {shopIndex === 1 && (
        <div className="flex-1  rounded-lg bg-gray-50 pb-1">
          <Virtuoso
            style={{ height: "100%" }}
            totalCount={rowsMarketplace.length}
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
                  {rowItems.map((card) => (
                    <div
                      key={card.id}
                      className="flex-1 col-span-1 w-full border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-62.5 w-full bg-gray-50 mb-2 rounded flex items-center justify-center overflow-hidden">
                        {card.inventory.cardImgUrl &&
                        card.inventory.cardImgUrl !== "" ? (
                          <img
                            src={card.inventory.cardImgUrl}
                            alt={card.inventory.cardName}
                            className="object-contain w-full h-full cursor-zoom-in"
                            loading="lazy"
                            onClick={() => {
                              setIsShowCard(true);
                              setShowCardUrl(card.inventory.cardImgUrl);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold truncate px-1">
                        {card.inventory.cardName}
                      </p>
                      <p className="text-[10px] text-gray-500 px-1">
                        {card.inventory.cardId}
                      </p>
                      <p className="text-[10px] text-gray-500 px-1">
                        Price: {card.price}
                      </p>
                      <button
                        onClick={() => {
                          setIsShowDetailMarketplacePurchase(true);
                          setShowDetailMarketplacePurchase(card);
                        }}
                        className="bg-amber-400 w-full text-[12px] p-2 rounded-md mt-2"
                      >
                        Buy
                      </button>
                    </div>
                  ))}

                  {/* Spacer Kosong (Agar baris terakhir rata kiri) */}
                  {/* SAFE ARRAY GENERATION */}
                  {[...Array(emptySlots)].map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1" />
                  ))}
                </div>
              );
            }}
          />
        </div>
      )}

      {/* ... (Modals and loading overlay remain unchanged) */}
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

      {isShowDetailPurchase && ShowDetailPurchase && (
        <div
          onClick={() => {
            setIsShowDetailPurchase(false);
          }}
          className="flex items-center justify-center z-9999 fixed inset-0 bg-black/80 "
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="bg-white p-3 w-100 rounded-md">
              <div className="flex items-center text-[12px] justify-between">
                <h3>Purchase Card</h3>
                <X
                  onClick={() => {
                    setIsShowDetailPurchase(false);
                  }}
                  className="w-3 h-3"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-20">
                  <img
                    src={ShowDetailPurchase.img_full_url}
                    className="w-full h-full"
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-[14px] font-bold">
                    {ShowDetailPurchase.name}
                  </h1>
                  <p className="text-[12px] text-gray-400">
                    {ShowDetailPurchase.category}
                  </p>
                </div>
              </div>

              {/* Honest Transaction */}
              <div className="w-full border border-amber-200 bg-amber-50 p-3 mt-2 rounded-md mb-2">
                <h1 className="text-[12px] text-amber-400 mb-1">
                  Honesty-Based Transaction
                </h1>
                <p className="text-[11px] text-gray-400 leading-3 mb-2">
                  Please enter the agreed price and quantity. This system relies
                  on community trust.
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
                <div className="border-b w-full my-2 border-gray-400"></div>
                <div className="flex justify-between items-center text-[12px]">
                  <p>Total</p>
                  <p className="text-amber-500">{unitPrice * quantity}</p>
                </div>
              </div>

              <div className="flex justify-end items-center text-[11px] gap-2">
                <button
                  onClick={() => {
                    setIsShowDetailPurchase(false);
                  }}
                  className="border p-1 px-2 rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuyCard}
                  className="border p-1 px-2 rounded-md border-gray-300 bg-amber-400 hover:bg-amber-500"
                >
                  {loading ? "Loading..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isShowDetailMarketplacePurchase && ShowDetailMarketplacePurchase && (
        <div
          onClick={() => {
            setIsShowDetailMarketplacePurchase(false);
          }}
          className="flex items-center justify-center z-9999 fixed inset-0 bg-black/80 "
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="bg-white p-3 w-100 rounded-md">
              <div className="flex items-center text-[12px] justify-between">
                <h3>Purchase Card</h3>
                <X
                  onClick={() => {
                    setIsShowDetailMarketplacePurchase(false);
                  }}
                  className="w-3 h-3"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-20">
                  <img
                    src={ShowDetailMarketplacePurchase.inventory.cardImgUrl}
                    className="w-full h-full"
                    alt=""
                  />
                </div>
                <div>
                  <h1 className="text-[14px] font-bold">
                    {ShowDetailMarketplacePurchase.inventory.cardName}
                  </h1>
                  <p className="text-[12px] text-gray-400">
                    Price: {ShowDetailMarketplacePurchase.price}
                  </p>
                </div>
              </div>

              <div className="flex justify-end items-center text-[11px] gap-2">
                <button
                  onClick={() => {
                    setIsShowDetailMarketplacePurchase(false);
                  }}
                  className="border p-1 px-2 rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuyMarketplaceCard}
                  className="border p-1 px-2 rounded-md border-gray-300 bg-amber-400 hover:bg-amber-500"
                >
                  {loading ? "Loading..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="absolute z-9999 bottom-2 left-2 animate-left-slide-in">
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

export default MarketPlaceClient;
