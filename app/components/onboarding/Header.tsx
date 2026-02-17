import React from "react";
import Logo from "../ui/Logo";

const Header = () => {
  return (
    <div className="w-full border-b border-gray-200 mb-6">
      <div className="px-4 py-2 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex gap-2 items-center justify-center">
          <Logo />
          <div className="">
            <h1 className="text-slate-900 font-bold text-[14px]">GrandLine</h1>
            <p className="text-gray-600 text-[8px]">DECK BUILDER</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
