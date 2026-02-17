"use client";
import { Anchor, Lock, Mail, User } from "lucide-react";
import React, { use, ChangeEvent } from "react";
import AuthTextField from "../../components/auth/AuthTextField";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AlertCard from "../../components/ui/AlertCard";
import Logo from "../../components/ui/Logo";
import GlassLayer from "../../components/ui/GlassLayer";
const LoginPage = () => {
  const router = useRouter();
  const carouselImages = [
    "/auth-image-4.jpg",
    "/auth-image-5.jpg",
    "/auth-image-6.webp",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        return (prevIndex + 1) % carouselImages.length;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = async (e: React.SubmitEvent) => {
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
    <div className="h-screen flex">
      {/* left side */}
      <div className="px-2 sm:w-[50%] w-full h-full flex flex-col justify-center items-center bg-white ">
        <div className="max-w-75 w-full animate-slide-up">
          {/* logo and grandline text */}
          <div className="flex gap-2 items-center justify-center mb-4">
            <Logo />
            <div className="">
              <h1 className="text-slate-900 font-bold text-[16px]">
                GrandLine
              </h1>
              <p className="text-gray-600 text-[8px]">DECK BUILDER</p>
            </div>
          </div>

          <h1 className="text-slate-900 font-bold text-[18px] text-center">
            Welcome Back, Captain
          </h1>
          <p className="text-[11px] text-gray-600 mb-4 text-center">
            Sign in to continue your adventure
          </p>
          <form action="" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 transition-colors text-slate-900 py-2 rounded-md mt-2 text-[12px] font-bold mb-4"
            >
              {loading ? "Logging in..." : "Set Sail"}
            </button>
            <div className="flex items-center text-[8px] text-gray-500 gap-2 justify-center mb-4">
              <hr className="flex-1 border-gray-300" />
              <p>NEW TO THE CREW?</p>
              <hr className="flex-1 border-gray-300" />
            </div>
            <button
              type="button"
              onClick={() => {
                console.log("Navigating to register page");
                router.push("/register");
              }}
              className="border w-full text-[12px] rounded-md py-2 font-bold border-black hover:bg-gray-100 transition-colors"
            >
              Create an Account
            </button>
          </form>
        </div>
      </div>

      {/* right side */}
      <div className="relative sm:block hidden w-[50%] h-full">
        <div className="absolute h-full w-full bg-linear-to-l from-transparent to-white/90 z-20 from-50%"></div>
        {carouselImages.map((e, index) => (
          <img
            key={index}
            className={`absolute object-cover h-full w-full opacity-90 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            src={e}
          ></img>
        ))}
      </div>
      {showAlert && (
        <div className="fixed z-30 bottom-2 left-2 animate-left-slide-in">
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

export default LoginPage;
