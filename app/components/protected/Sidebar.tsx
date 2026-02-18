"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Sword,
  ShoppingBag,
  Settings,
  LogOut,
  Anchor,
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Box },
  { name: "Deck Builder", href: "/deck-builder/create-new", icon: Sword },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex w-64 h-screen bg-slate-950 text-slate-300 flex-col fixed left-0 top-0 border-r border-slate-800 z-50 shadow-2xl">
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800/50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-linear-to-br from-amber-400 to-orange-600 p-2.5 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
              <Anchor size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white leading-none tracking-tight group-hover:text-amber-500 transition-colors">
                GrandLine
              </h1>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1 block">
                TCG Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 border border-transparent ${
                  isActive
                    ? "bg-slate-900 text-amber-500 font-bold border-slate-800 shadow-inner"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-1"
                }`}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors ${isActive ? "text-amber-500" : "text-slate-500 group-hover:text-white"}`}
                />
                <span className="tracking-wide">{item.name}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Logout</span>
            </button>
          </div>

          <div className="mt-4 text-[10px] text-center text-slate-600 font-medium">
            v1.0.0 &bull; One Piece TCG
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 flex justify-between items-center px-1 py-1 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        {/* 1. Loop Main Menu Items */}
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.name === "Deck Builder" && pathname.includes("deck-builder"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full py-3 gap-1 transition-all duration-300 group ${
                isActive
                  ? "text-amber-500"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {isActive && (
                <div className="absolute top-1 w-8 h-8 bg-amber-500/10 rounded-full blur-sm -z-10"></div>
              )}

              <div
                className={`relative transition-transform duration-300 ${isActive ? "-translate-y-1" : "group-hover:-translate-y-0.5"}`}
              >
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={
                    isActive
                      ? "fill-amber-500/10 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                      : ""
                  }
                />
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"></div>
                )}
              </div>

              <span
                className={`text-[9px] font-medium leading-none transition-opacity duration-300 ${isActive ? "opacity-100 font-bold" : "opacity-70 group-hover:opacity-100"}`}
              >
                {item.name === "Deck Builder" ? "Deck" : item.name}
              </span>
            </Link>
          );
        })}

        {/* 2. Manual Logout Button (Item ke-5) */}
        <button
          onClick={handleLogout}
          className="relative flex flex-col items-center justify-center w-full py-3 gap-1 transition-all duration-300 group text-slate-500 hover:text-red-500"
        >
          <div className="relative group-active:scale-95 transition-transform duration-300">
            <LogOut
              size={22}
              strokeWidth={2}
              className="group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
            />
          </div>
          <span className="text-[9px] font-medium leading-none opacity-70 group-hover:opacity-100 group-hover:font-bold">
            Logout
          </span>
        </button>
      </div>
    </>
  );
}
