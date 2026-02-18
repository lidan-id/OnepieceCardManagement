"use client";
import { Anchor, Lock, Mail, User, ArrowRight } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import AuthTextField from "../../components/auth/AuthTextField";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertCard from "../../components/ui/AlertCard";
import GlassLayer from "../../components/ui/GlassLayer";

const RegisterPage = () => {
  const router = useRouter();
  const carouselImages = [
    "/auth-image.jpg",
    "/auth-image-2.jpg",
    "/auth-image-3.jpg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Transisi gambar halus
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % carouselImages.length,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      showAlertCard("red", "Error", "Passwords do not match");
      return;
    }

    // Simpan data sementara sebelum onboarding
    const tempData = {
      username,
      email,
      password,
    };
    sessionStorage.setItem("registration_data", JSON.stringify(tempData));
    router.push("/onboarding");
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      {/* --- LEFT SIDE: CAROUSEL --- */}
      <div className="relative hidden sm:block w-[50%] h-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-l from-slate-950 via-slate-950/20 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay z-20 pointer-events-none" />

        {carouselImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt="Register Background"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1500ms ease-in-out transform ${
              index === currentImageIndex
                ? "opacity-100 scale-105 z-10"
                : "opacity-0 scale-100 z-0"
            }`}
          />
        ))}

        {/* Floating Caption Top Left */}
        <div className="absolute top-10 left-10 z-30">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit shadow-xl">
            <div className="bg-amber-500 p-2 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20">
              <Anchor size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-sm block">
                GrandLine TCG
              </span>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                Join the Crew
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="px-6 sm:w-[50%] w-full h-full flex flex-col justify-center items-center bg-slate-950 relative z-10">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full animate-in fade-in slide-in-from-right-5 duration-700 relative z-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Begin Your Adventure
            </h1>
            <p className="text-slate-400 text-sm">
              Create your captain profile and start building.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
              <AuthTextField
                title="Username"
                placeholder="PirateKing2024"
                type="text"
                icon={User}
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
              />
              <AuthTextField
                title="Email"
                placeholder="captain@grandline.com"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuthTextField
                  title="Password"
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
                <AuthTextField
                  title="Confirm"
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group"
            >
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-500 hover:text-amber-400 font-bold hover:underline decoration-amber-500/30 underline-offset-4 transition-all"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* --- ALERTS --- */}
      {showAlert && (
        <div className="fixed z-50 bottom-5 right-5 animate-in slide-in-from-right-5 duration-300">
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

export default RegisterPage;
