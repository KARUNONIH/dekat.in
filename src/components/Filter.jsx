"use client";
import { useState, useRef, useEffect } from "react";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { useAtom } from "jotai";
import { filterAtom } from "@/atoms/filterAtom";

const filterItems = ["Near Me", "Category", "Price", "Rating", "Opening Hours"];

export default function Filter({ categoryOptions }) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useAtom(filterAtom);

  const dropdownRef = useRef(null);

  // Handle klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setSearchQuery("");
  };

  const handleSelectCategory = item => {
    if (!filters.categories.includes(item)) {
      setFilters({
        ...filters,
        categories: [...filters.categories, item]
      });
    }
  };

  const handleRemoveCategory = item => {
    setFilters({
      ...filters,
      categories: filters.categories.filter(i => i !== item)
    });
  };

  const toggleFilter = item => {
    if (item === "Category") {
      toggleCategoryDropdown();
    } else {
      const filterKey = item.toLowerCase().replace(/\s+/g, '_');
      setFilters({
        ...filters,
        [filterKey]: !filters[filterKey]
      });
    }
  };

  const filteredOptions = categoryOptions.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="shadow" ref={dropdownRef}>
      <div className="w-[90%] mx-auto flex flex-col gap-2 relative">
        {/* Filter bar */}
        <section className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            {filterItems.map(item => {
              const filterKey = item.toLowerCase().replace(/\s+/g, '_');
              const isActive =
                filters[filterKey] ||
                (item === "Category" &&
                  (showCategoryDropdown || filters.categories.length > 0));
              return (
                <div key={item} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleFilter(item)}
                    className={`rounded-full px-4 py-2 text-sm italic transition-all duration-300 ease-in-out font-semibold ${
                      isActive
                        ? "bg-hijau-tua text-white"
                        : "bg-hijau-tua/30 text-hijau-tua"
                    }`}
                  >
                    <p className="text-nowrap">{item}</p>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dropdown with search */}
        {showCategoryDropdown && (
          <div className="absolute top-[calc(100%+10px)] left-0 bg-white border rounded-md shadow-md z-[9999] w-full max-h-[300px] overflow-y-auto">
            <div className="p-2 border-b gap-2 flex">
              <input
                type="text"
                placeholder="Search category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded pr-8"
              />
              <button
                onClick={() => setShowCategoryDropdown(false)}
                className="text-gray-500 hover:text-hijau-tua"
                aria-label="Close dropdown"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option}
                  onClick={() => handleSelectCategory(option)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}

        {/* Selected categories */}
        {filters.categories.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {filters.categories.map(cat => (
              <div
                key={cat}
                className="flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm italic border-hijau-muda border-2"
              >
                <p>{cat}</p>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-xs text-gray-600 hover:text-red-500"
                >
                  <IoClose className="text-base" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}