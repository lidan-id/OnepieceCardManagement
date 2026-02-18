"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/onboarding/Header";
import { ChevronRight, X, Loader2, Anchor } from "lucide-react"; // Tambah icon Anchor jika mau, atau tetap Chevron
import { StarterDeckDetailProps } from "../types/Card";
import StarterCard from "../components/onboarding/StarterCard";
import { useRouter } from "next/navigation";
import AlertCard from "../components/ui/AlertCard";
import GlassLayer from "../components/ui/GlassLayer";

const DECK_FILES = [
  "st01",
  "st02",
  "st03",
  "st04",
  "st05",
  "st06",
  "st07",
  "st08",
  "st09",
  "st11",
  "st12",
  "st14",
  "st15",
  "st16",
  "st17",
  "st18",
  "st19",
  "st20",
  "st21",
  "st22",
  "st23",
  "st24",
  "st25",
  "st26",
  "st27",
  "st28",
];

interface StarterDeckData {
  id: string;
  cards: StarterDeckDetailProps[];
}

const OnboardingPage = () => {
  const router = useRouter();
  const [starterDecks, setStarterDecks] = useState<StarterDeckData[]>([]);
  const [isFetchingDecks, setIsFetchingDecks] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [selectedDeckData, setSelectedDeckData] = useState<
    StarterDeckDetailProps[]
  >([]);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    color: "",
    title: "",
    subtitle: "",
  });

  // --- HELPERS & EFFECTS (Sama seperti sebelumnya, hanya logic) ---
  const showAlert = (
    color: string,
    title: string,
    subtitle: string,
    redirect = false,
  ) => {
    setAlertConfig({ show: true, color, title, subtitle });
    setTimeout(() => {
      if (redirect) router.push("/register");
      setAlertConfig((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("registration_data");
    if (!storedData) router.replace("/register");
    else setUserData(JSON.parse(storedData));
  }, [router]);

  useEffect(() => {
    const fetchAllDecks = async () => {
      setIsFetchingDecks(true);
      try {
        const responses = await Promise.all(
          DECK_FILES.map(async (fileId) => {
            const res = await fetch(`starter-deck/${fileId}.json`);
            if (!res.ok) throw new Error(`Failed to load ${fileId}`);
            const data = await res.json();
            return { id: fileId.toUpperCase(), cards: data };
          }),
        );
        setStarterDecks(responses);
      } catch (error) {
        console.error(error);
        showAlert("red", "System Error", "Failed to load starter decks.");
      } finally {
        setIsFetchingDecks(false);
      }
    };
    fetchAllDecks();
  }, []);

  const handleFinalRegister = async () => {
    if (!userData || !selectedDeckData.length) {
      showAlert("red", "Selection Required", "Please select a starter deck.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, selectedDeck: selectedDeckData }),
      });
      const data = await response.json();
      if (response.ok) {
        showAlert("green", "Welcome Aboard!", "Setting sail...", false);
        sessionStorage.removeItem("registration_data");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        showAlert(
          "red",
          "Registration Failed",
          data.message || "Unknown error occurred",
        );
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      }
    } catch (error) {
      showAlert("red", "Network Error", "Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Background Dark Slate (Deep Ocean)
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-200 selection:bg-amber-500/30">
      <Header />

      <main className="pt-24 w-full px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in-up">
            {/* Badge yang lebih premium */}
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-amber-500/30 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest text-amber-400 mb-4 shadow-lg shadow-black/20">
              <span>⚔️</span> WELCOME NEW CAPTAIN
            </div>

            {/* Font Serif untuk nuansa One Piece / Peta */}
            <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-white mb-3 tracking-wide drop-shadow-lg">
              Choose Your <span className="text-amber-400">Vessel</span>
            </h1>

            <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              Before we set sail to the{" "}
              <span className="text-slate-200 font-semibold">Grand Line</span>,
              you must choose your starter deck. Pick wisely, Captain!
            </p>
          </div>

          {/* Grid Content */}
          {isFetchingDecks ? (
            <div className="flex flex-col items-center justify-center h-64 text-amber-500/50">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-bold tracking-widest uppercase">
                Loading Decks...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full">
              {starterDecks.map((deck, index) => (
                <StarterCard
                  key={deck.id}
                  e={deck}
                  index={index}
                  selectedCard={selectedCardIndex}
                  setSelectedCard={setSelectedCardIndex}
                  setSelectedCardList={setSelectedDeckData}
                  setImageClickedUrl={setPreviewImage}
                  setImageClicked={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL IMAGE PREVIEW --- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-87.5 md:max-w-md w-full animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <span className="text-xs uppercase font-bold tracking-widest">
                Close
              </span>
              <div className="bg-slate-800 p-2 rounded-full border border-slate-700">
                <X className="w-5 h-5" />
              </div>
            </button>

            {/* Frame Emas di sekitar Preview */}
            <div className="p-1.5 bg-linear-to-br from-amber-300 via-amber-600 to-amber-800 rounded-2xl shadow-2xl shadow-amber-900/50">
              <img
                src={previewImage}
                alt="Card Preview"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING ACTION BUTTON --- */}
      <div className="fixed bottom-6 right-6 z-30 md:bottom-10 md:right-10">
        <button
          onClick={handleFinalRegister}
          disabled={selectedCardIndex === -1 || isSubmitting}
          className={`
            group flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform border-2
            ${
              selectedCardIndex === -1
                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-amber-400 border-amber-300 text-slate-900 hover:bg-amber-300 hover:scale-105 hover:shadow-amber-500/40"
            }
          `}
        >
          <div className="flex flex-col items-start">
            <span className="font-extrabold text-xs uppercase tracking-widest">
              {isSubmitting ? "Loading..." : "Confirm Deck"}
            </span>
            {selectedCardIndex !== -1 && !isSubmitting && (
              <span className="text-[9px] opacity-80 font-serif italic">
                Ready to set sail
              </span>
            )}
          </div>

          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
          ) : (
            <div
              className={`bg-slate-900/10 p-1 rounded-full transition-transform ${selectedCardIndex !== -1 ? "group-hover:translate-x-1" : ""}`}
            >
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {alertConfig.show && (
        <div className="fixed z-50 bottom-24 right-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <AlertCard
            bgColor={alertConfig.color}
            title={alertConfig.title}
            subtitle={alertConfig.subtitle}
          />
        </div>
      )}

      {isSubmitting && <GlassLayer />}
    </div>
  );
};

export default OnboardingPage;
