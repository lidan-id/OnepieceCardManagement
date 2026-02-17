"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/onboarding/Header";
import { ChevronRight } from "lucide-react";
import { StarterDeckDetailProps } from "../types/Card";
import StarterCard from "../components/onboarding/StarterCard";
import { useRouter } from "next/navigation";
import AlertCard from "../components/ui/AlertCard";
import GlassLayer from "../components/ui/GlassLayer";

interface AllSTProps {
  id: string;
  cards: StarterDeckDetailProps[];
}
const OnboardingPage = () => {
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
      if (color === "red") router.push("/register");
      setShowAlert(false);
    }, 3000);
  };

  const router = useRouter();
  const [AllST, setAllST] = useState<AllSTProps[]>([]);
  const fileName = [
    "st01",
    "st02",
    "st03",
    "st04",
    "st05",
    "st06",
    "st07",
    "st08",
    "st09",
    // "st10",
    "st11",
    "st12",
    // "st13",
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
  const [selectedCard, setSelectedCard] = useState(-1);
  const [selectedCardList, setSelectedCardList] = useState<
    StarterDeckDetailProps[]
  >([]);
  const [imgClicked, setImageClicked] = useState(false);
  const [imgClickedUrl, setImageClickedUrl] = useState("");

  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);
  useEffect(() => {
    const storedData = sessionStorage.getItem("registration_data");
    if (!storedData) {
      router.push("/register");
    } else {
      setUserData(JSON.parse(storedData));
    }
  }, [router]);

  useEffect(() => {
    const fetchAllDecks = async () => {
      try {
        const responses = await Promise.all(
          fileName.map(async (fileId) => {
            const res = await fetch(`starter-deck/${fileId}.json`);
            const data = await res.json();
            return {
              id: fileId.toUpperCase(),
              cards: data,
            };
          }),
        );
        setAllST(responses);
      } catch (error) {
        console.error("Gagal mengambil data deck", error);
      }
    };
    fetchAllDecks();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleFinalRegister = async () => {
    if (!userData || !selectedCardList) {
      showAlertCard("red", "Error", "Missing data");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          selectedDeck: selectedCardList,
        }),
      });
      if (response.ok) {
        showAlertCard(
          "green",
          "Success",
          "Registration successful! You can now log in.",
        );
        sessionStorage.removeItem("registration_data");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        const data = await response.json();
        showAlertCard("red", "Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      showAlertCard("red", "Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col items-center justify-center">
          <div className="bg-amber-50 rounded-full w-fit p-2 text-[10px] font-bold text-amber-400">
            Welcome, New Captain!
          </div>
          <div className="max-w-lg text-center">
            <h1 className="text-[30px] font-extrabold">
              Choose Your Starter Deck
            </h1>
            <p className="text-[12px] text-gray-400 mb-6">
              Every great pirate captain needs a crew. Select your first deck to
              begin your journey across the Grand Line
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5  w-full">
            {AllST!.map((e: AllSTProps, index) => (
              <StarterCard
                key={index}
                e={e}
                selectedCard={selectedCard}
                index={index}
                setImageClickedUrl={setImageClickedUrl}
                setImageClicked={setImageClicked}
                setSelectedCard={setSelectedCard}
                setSelectedCardList={setSelectedCardList}
              />
            ))}
          </div>
        </div>
      </div>
      {imgClicked && (
        <div
          onClick={() => {
            setImageClicked(false);
          }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
          <div
            className=""
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img src={imgClickedUrl} alt="" />
          </div>
        </div>
      )}

      <div className="fixed bottom-10 right-10 ">
        <button
          onClick={() => {
            handleFinalRegister();
          }}
          disabled={selectedCard === -1}
          className={`rounded-md py-3 px-4 text-[13px] font-bold flex items-center gap-3  ${selectedCard === -1 ? "bg-gray-500 cursor-not-allowed" : "hover:bg-amber-500 bg-amber-400 cursor-pointer"}`}
        >
          {loading ? "Processing..." : "Confirm Selection"}{" "}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {showAlert && (
        <div className="fixed z-30 bottom-2 right-2 animate-left-slide-in">
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

export default OnboardingPage;
