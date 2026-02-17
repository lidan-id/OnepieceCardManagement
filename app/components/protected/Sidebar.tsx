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
      <div className="hidden md:flex w-64 h-screen bg-slate-900 text-white flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg text-amber-500">
            <Anchor size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">GrandLine</h1>
            <span className="text-[10px] text-slate-400">DECK BUILDER</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-800 text-amber-500 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Desktop Only) */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50 pb-safe">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-2 gap-1 transition-colors ${
                isActive
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {/* Icon */}
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "fill-amber-500/10" : ""}
              />

              {/* Text Label */}
              <span className="text-[10px] font-medium leading-none">
                {item.name === "Deck Builder" ? "Deck" : item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
