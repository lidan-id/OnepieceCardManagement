import React from "react";
import Logo from "../ui/Logo";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
      <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex gap-3 items-center justify-center select-none cursor-pointer group">
          <div className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300">
            <Logo />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-slate-100 font-serif font-extrabold text-lg tracking-wide group-hover:text-amber-400 transition-colors">
              GrandLine
            </h1>
            <span className="text-amber-500 font-bold text-[9px] tracking-[0.2em] uppercase opacity-80">
              Deck Builder
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
