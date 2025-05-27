"use client";

import React from "react";
import { Search, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  // Function to determine if a tab is active
  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Function to get tab styles
  const getTabStyles = (path) => {
    return isActive(path) 
      ? "flex flex-col items-center text-hijau-tua" 
      : "flex flex-col items-center text-gray-400";
  };

  return (
    <div className="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-gray-200 shadow-sm z-[2]">
      <div className="flex justify-around items-center py-2">
        {/* Search Tab */}
        <Link href={'/'} className={getTabStyles('/')}>
          <Search size={24} />
          <span className="text-xs mt-1">Pencarian</span>
          {isActive('/') && <div className="h-1 w-full bg-hijau-tua mt-1"></div>}
        </Link>

        {/* Contribution Tab */}
        <Link href={'/contribute'} className={getTabStyles('/contribute')}>
          <Plus size={24} />
          <span className="text-xs mt-1">Kontribusi</span>
          {isActive('/contribute') && <div className="h-1 w-full bg-hijau-tua mt-1"></div>}
        </Link>

        {/* Profile Tab */}
        <Link href={'/profile'} className={getTabStyles('/profile')}>
          <User size={24} />
          <span className="text-xs mt-1">Profil</span>
          {isActive('/profile') && <div className="h-1 w-full bg-hijau-tua mt-1"></div>}
        </Link>
      </div>
    </div>
  );
}