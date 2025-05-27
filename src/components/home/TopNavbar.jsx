// src/components/home/TopNavbar.jsx
"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdOutlineLogin, MdLogout } from "react-icons/md";
import { useAuth, useLocations } from "@/hooks/useAuth";

export default function TopNavbar({ onLocationSelect }) {
  const { isAuthenticated, logout, mounted } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [token, setToken] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (mounted) {
      const accessToken = localStorage.getItem("accessToken");
      setToken(accessToken);
    }
  }, [mounted]);

  const { locations } = useLocations(token);

  useEffect(() => {
    if (searchQuery.trim() && locations.length > 0) {
      const filtered = locations.filter(
        location =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setFilteredLocations([]);
    }
  }, [searchQuery, locations]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocationClick = location => {
    setSearchQuery(location.name);
    setShowSearchResults(false);
    onLocationSelect?.(location);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // Don't render login/logout button until mounted to avoid hydration mismatch
  const renderAuthButton = () => {
    if (!mounted) {
      return (
        <div className="aspect-square w-[40px] rounded-md shadow bg-gray-200 animate-pulse"></div>
      );
    }

    return isAuthenticated ? (
      <button
        onClick={handleLogout}
        className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-red-600 hover:bg-red-700"
      >
        <MdLogout className="text-2xl text-white" />
      </button>
    ) : (
      <Link href="/login">
        <button className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua">
          <MdOutlineLogin className="text-2xl text-white" />
        </button>
      </Link>
    );
  };

  return (
    <div className="border-b-[1px] border-gray-100">
      <div className="flex items-center gap-4 py-4 w-[90%] mx-auto">
        <section>
          <img
            src="/assets/logo/logo.png"
            alt=""
            className="aspect-square w-[40px] rounded-full border-2"
          />
        </section>

        <section className="relative flex-1" ref={searchRef}>
          <div className="bg-gray-100 flex rounded-full items-center gap-2 px-4 py-2 focus-within:bg-white transition-all duration-300 ease-in-out focus-within:border-2 focus-within:border-gray-100">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent h-[24px] focus:outline-none flex-1"
              placeholder="Search locations..."
            />
            <FaMagnifyingGlass className="cursor-pointer" />
          </div>

          {showSearchResults && filteredLocations.length > 0 && (
            <div className="absolute top-full -left-[80px] right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 w-[480px]">
              {filteredLocations.slice(0, 3).map((location, index) => (
                <div
                  key={index}
                  onClick={() => handleLocationClick(location)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-gray-500">
                    {location.address}
                  </div>
                  <div className="text-xs text-green-600 capitalize">
                    {location.category}
                  </div>
                </div>
              ))}
              {filteredLocations.length > 3 && (
                <div className="p-2 text-center text-xs text-gray-400 bg-gray-50">
                  +{filteredLocations.length - 3} more results
                </div>
              )}
            </div>
          )}
        </section>

        <section>{renderAuthButton()}</section>
      </div>
    </div>
  );
}
