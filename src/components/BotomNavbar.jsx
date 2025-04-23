import React from "react";
import { Search, Plus, User } from "lucide-react";

export default function botomNavbar() {
  return (
    <div className="fixed bottom-0 w-[480px] bg-white border-t border-gray-200 shadow-sm z-[999999]">
      <div className="flex justify-around items-center py-2">
        {/* Search Tab - Active */}
        <button className="flex flex-col items-center text-hijau-tua">
          <Search size={24} />
          <span className="text-xs mt-1">Pencarian</span>
          <div className="h-1 w-full bg-hijau-tua mt-1"></div>
        </button>

        {/* Contribution Tab */}
        <button className="flex flex-col items-center text-gray-400">
          <Plus size={24} />
          <span className="text-xs mt-1">Kontribusi</span>
        </button>

        {/* Profile Tab */}
        <button className="flex flex-col items-center text-gray-400">
          <User size={24} />
          <span className="text-xs mt-1">Profil</span>
        </button>
      </div>
    </div>
  );
}