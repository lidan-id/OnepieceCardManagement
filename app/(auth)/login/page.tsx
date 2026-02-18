"use client";
import { Anchor, Lock, Mail } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import AuthTextField from "../../components/auth/AuthTextField";
import { useRouter } from "next/navigation";
import AlertCard from "../../components/ui/AlertCard";
import GlassLayer from "../../components/ui/GlassLayer";

const LoginPage = () => {
  const router = useRouter();
  const carouselImages = [
    "/auth-image-4.jpg",
    "/auth-image-5.jpg",
    "/auth-image-6.webp",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Transisi gambar yang lebih mulus
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % carouselImages.length,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showAlertCard("red", "Error", "All fields are required");
      return;
    }
    if (password.length < 6) {
      showAlertCard(
        "red",
        "Error",
        "Password must be at least 6 characters long",
      );
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        showAlertCard("red", "Error", data.message || "Login failed");
      } else {
        showAlertCard("green", "Success", "Login successful");
        router.push("/onboarding");
      }
    } catch (error) {
      showAlertCard("red", "Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      {/* --- LEFT SIDE: FORM --- */}
      <div className="px-6 sm:w-[50%] w-full h-full flex flex-col justify-center items-center bg-slate-950 relative z-10">
        {/* Background glow effect behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-700 relative z-20">
          {/* Logo Area */}
          <div className="flex flex-col items-center justify-center mb-8 space-y-3">
            <div className="bg-linear-to-br from-amber-400 to-orange-600 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
              <Anchor className="w-8 h-8 text-slate-900" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                GrandLine
              </h1>
              <p className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">
                Deck Builder TCG
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              Welcome Back, Captain
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to continue your adventure
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
              <AuthTextField
                title="Email"
                placeholder="captain@grandline.com"
                type="text"
                icon={Mail}
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <AuthTextField
                title="Password"
                placeholder="********"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Logging in..." : "Set Sail"}
            </button>

            <div className="flex items-center text-[10px] text-slate-500 gap-3 justify-center my-4">
              <div className="h-px flex-1 bg-slate-800" />
              <p className="uppercase tracking-wider">New to the crew?</p>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full bg-transparent border border-slate-700 hover:border-amber-500/50 hover:bg-slate-900 text-slate-300 hover:text-white py-3 rounded-xl text-sm font-semibold transition-all"
            >
              Create an Account
            </button>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: CAROUSEL --- */}
      <div className="relative hidden sm:block w-[50%] h-full bg-slate-900 overflow-hidden">
        {/* Overlay Gradient untuk transisi halus ke background gelap */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/20 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay z-20 pointer-events-none" />

        {carouselImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt="Auth Background"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1500ms ease-in-out transform ${
              index === currentImageIndex
                ? "opacity-100 scale-105 z-10"
                : "opacity-0 scale-100 z-0"
            }`}
          />
        ))}

        {/* Optional Caption */}
        <div className="absolute bottom-10 right-10 z-30 text-right max-w-sm">
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
            Conquer the Seas
          </h2>
          <p className="text-slate-200 text-sm drop-shadow-md font-medium">
            Build the strongest deck and become the King of Pirates.
          </p>
        </div>
      </div>

      {/* --- ALERTS & LOADING --- */}
      {showAlert && (
        <div className="fixed z-50 bottom-5 left-5 animate-in slide-in-from-left-5 duration-300">
          <AlertCard
            bgColor={alertAttribut.color}
            title={alertAttribut.title}
            subtitle={alertAttribut.subtitle}
          />
        </div>
      )}
      {loading && <GlassLayer />}
    </div>
  );
};

export default LoginPage;
