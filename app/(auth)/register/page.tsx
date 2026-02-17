"use client";
import { Anchor, Lock, Mail, User } from "lucide-react";
import React, { use, ChangeEvent } from "react";
import AuthTextField from "../../components/auth/AuthTextField";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AlertCard from "../../components/ui/AlertCard";
import Logo from "../../components/ui/Logo";
const RegisterPage = () => {
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

  const carouselImages = [
    "/auth-image.jpg",
    "/auth-image-2.jpg",
    "/auth-image-3.jpg",
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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
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
    const tempData = {
      username,
      email,
      password,
    };
    sessionStorage.setItem("registration_data", JSON.stringify(tempData));
    router.push("/onboarding");
  };

  return (
    <div className="relative h-screen flex overflow-hidden">
      {/* left side */}
      <div className="relative sm:block hidden w-[50%] h-full">
        <div className="absolute h-full w-full bg-linear-to-r from-transparent to-white/90 z-20 from-50%"></div>
        {carouselImages.map((e, index) => (
          <img
            key={index}
            className={`absolute object-cover h-full w-full opacity-90 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            src={e}
          ></img>
        ))}
      </div>

      {/* right side */}
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
            Join the Crew
          </h1>
          <p className="text-[11px] text-gray-600 mb-4 text-center">
            Create your account and start building
          </p>
          <form action="" onSubmit={handleSubmit}>
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
            <AuthTextField
              title="Confirm Password"
              placeholder="********"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
            />
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 transition-colors text-slate-900 py-2 rounded-md mt-2 text-[12px] font-bold mb-4"
            >
              Begin Adventure
            </button>
            <div className="text-[11px] text-gray-600 text-center">
              Already have an account?{" "}
              <Link className="text-amber-400" href={"/login"}>
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
      {showAlert && (
        <div className="fixed z-30 bottom-2 right-2 animate-right-slide-in">
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
