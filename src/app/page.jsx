"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { openMapAtom } from "@/atoms/mapAtom";
import { filterAtom } from "@/atoms/filterAtom";
import BottomNavbar from "@/components/home/BotomNavbar";
import Filter from "@/components/home/Filter";
import Place from "@/components/home/Place";
import TopNavbar from "@/components/home/TopNavbar";
import { useLocations } from "@/hooks/useAuth";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import for the plugin
import { FileText } from "lucide-react";

const MapView = dynamic(() => import("@/components/home/MapView"), {
  ssr: false,
});

export default function Home() {
  const [openMap, setOpenMap] = useAtom(openMapAtom);
  const [filters] = useAtom(filterAtom);
  const mapViewRef = useRef(null);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [processedLocations, setProcessedLocations] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isProcessingLocations, setIsProcessingLocations] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const hasProcessedLocationsRef = useRef(false); // Ref to track if we've processed locations

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    const accessToken = localStorage.getItem("accessToken");
    setToken(accessToken);
    setIsLoggedIn(!!accessToken);
  }, []);

  // Get data from API - only after mounted
  const { locations: apiLocations, isLoading } = useLocations(token);

  // Extract unique categories from API data
  useEffect(() => {
    if (!apiLocations || apiLocations.length === 0) return;

    const uniqueCategories = [
      ...new Set(apiLocations.map(loc => loc.category).filter(Boolean)),
    ];
    setCategoryOptions(uniqueCategories);
  }, [apiLocations]);

  // Get user location
  useEffect(() => {
    if (!mounted) return;

    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);
      },
      err => {
        console.error("Gagal mengambil lokasi pengguna:", err);
        // Set default coordinates for Jakarta if geolocation fails
        setUserCoords([-6.2088, 106.8456]);
      }
    );
  }, [mounted]);

  // Memoize fetch route function to prevent recreation on each render
  const fetchRoute = useCallback(async (startCoords, endCoords) => {
    if (
      !startCoords ||
      !endCoords ||
      !Array.isArray(startCoords) ||
      !Array.isArray(endCoords)
    ) {
      return null;
    }

    const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;
    const url = `${process.env.NEXT_PUBLIC_API_ORS}/v2/directions/driving-car?start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: ORS_API_KEY,
        },
      });

      const data = await response.json();

      // Check response structure and access distance data
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const segment = feature.properties.segments[0];
        return segment;
      }

      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Calculate distance for each location when API data or user coords change
  useEffect(() => {
    // Skip processing if not logged in
  

    // Exit early cases
    if (!mounted) return;
    if (!userCoords) return;
    if (!apiLocations || apiLocations.length === 0) return;

    // Check if we already processed these locations based on length
    if (
      processedLocations.length === apiLocations.length &&
      hasProcessedLocationsRef.current
    ) {
      return;
    }

    // Dalam proses locations, tambahkan fungsi untuk mengkonversi coords jika berbentuk string
    const processLocations = async () => {
      setIsProcessingLocations(true);

      try {
        const locationsWithDistance = await Promise.all(
          apiLocations.map(async loc => {
            // Convert coords from string to array if needed
            let coordinates = loc.coords;

            // Check if coords is a string but should be an array
            if (typeof coordinates === "string") {
              try {
                // Try to parse the string as JSON
                coordinates = JSON.parse(coordinates);
              } catch {
                // If it's not valid JSON but has format like "[lat, lng]" or "lat, lng"
                coordinates = coordinates
                  .replace(/[\[\]]/g, "") // Remove brackets if present
                  .split(",") // Split by comma
                  .map(coord => parseFloat(coord.trim())) // Convert to numbers
                  .filter(coord => !isNaN(coord)); // Filter out non-numbers
              }
            }

            // Add simple validation for coordinates
            if (
              !coordinates ||
              !Array.isArray(coordinates) ||
              coordinates.length < 2 ||
              !coordinates.every(
                coord => typeof coord === "number" && !isNaN(coord)
              )
            ) {
              return {
                ...loc,
                coords: loc.coords, // Keep original for reference
                distance: 999999, // Large value for invalid coords to sort last
                openingTime: new Date(),
                image:
                  loc.images && loc.images.length > 0
                    ? loc.images[0]
                    : "/assets/content/prolog-kopi.jpg",
                rating: loc.averageRating || 0,
              };
            }

            // Only fetch route if coordinates are valid - use converted coordinates
            let distance = 0;
            try {
              const route = await fetchRoute(userCoords, coordinates);
              distance = route ? route.distance / 1000 : 0; // Convert to km
            } catch {
              // Silent catch to avoid errors
            }

            // Rest of your code remains the same
            const openingTime = new Date();
            if (loc.openHour && typeof loc.openHour === "string") {
              try {
                const [hours, minutes] = loc.openHour.split(":").map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                  openingTime.setHours(hours, minutes, 0);
                }
              } catch {
                // Silent catch to avoid errors
              }
            }

            return {
              ...loc,
              coords: coordinates, // Use the converted coordinates
              distance: Number(distance.toFixed(2)),
              openingTime: openingTime,
              image:
                loc.images && loc.images.length > 0
                  ? loc.images[0]
                  : "/assets/content/prolog-kopi.jpg",
              rating: loc.averageRating || 0,
            };
          })
        );

        // Update ref to indicate we've processed locations
        hasProcessedLocationsRef.current = true;

        // Store the processed locations
        setProcessedLocations(locationsWithDistance);

        // Initial filtered set is same as processed
        setFilteredLocations(locationsWithDistance);
      } catch (error) {
        console.error("Error processing locations:", error);
      } finally {
        setIsProcessingLocations(false);
      }
    };

    processLocations();
  }, [mounted, userCoords, apiLocations, fetchRoute]);

  // Apply filters to locations - in a separate effect
  // Modifikasi bagian Apply filters to locations

  // Apply filters to locations - in a separate effect
  useEffect(() => {
    // Skip filtering if not logged in

    if (!mounted || processedLocations.length === 0) return;

    // Create a new filtered locations array to avoid modifying original
    let result = [...processedLocations];

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(
        loc => loc.category && filters.categories.includes(loc.category)
      );
    }

    // Create an array to store active sort functions
    const sortFunctions = [];

    // Add sorting functions based on active filters
    if (filters.near_me) {
      // First, filter by distance (max 10 km)
      result = result.filter(loc => {
        const distance =
          typeof loc.distance === "number" ? loc.distance : Infinity;
        return distance <= 10; // Only include locations within 10 km
      });

      // Sort by distance first
      sortFunctions.push((a, b) => {
        const distA = typeof a.distance === "number" ? a.distance : Infinity;
        const distB = typeof b.distance === "number" ? b.distance : Infinity;
        return distA - distB;
      });

      // After sorting and filtering by distance, we'll limit to 10 nearest locations
      // But we'll do this after all sorting is applied
    }

    if (filters.price) {
      sortFunctions.push((a, b) => {
        const priceA = typeof a.startPrice === "number" ? a.startPrice : 0;
        const priceB = typeof b.startPrice === "number" ? b.startPrice : 0;
        return priceA - priceB;
      });
    }

    if (filters.rating) {
      sortFunctions.push((a, b) => {
        const ratingA = typeof a.rating === "number" ? a.rating : 0;
        const ratingB = typeof b.rating === "number" ? b.rating : 0;
        return ratingB - ratingA;
      });
    }

    if (filters.opening_hours) {
      sortFunctions.push((a, b) => {
        // Ensure we have valid Date objects
        const timeA =
          a.openingTime instanceof Date ? a.openingTime.getTime() : Infinity;
        const timeB =
          b.openingTime instanceof Date ? b.openingTime.getTime() : Infinity;
        return timeA - timeB;
      });
    }

    // Apply all active sort functions
    if (sortFunctions.length > 0) {
      result.sort((a, b) => {
        for (const sortFn of sortFunctions) {
          const comparison = sortFn(a, b);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }

    // If "near_me" filter is active, limit to 10 nearest locations (that are already within 10 km)
    if (filters.near_me) {
      result = result.slice(0, 10);
    }

    // Set the filtered locations
    setFilteredLocations(result);
  }, [mounted, filters, processedLocations, isLoggedIn]);

  // Export to PDF functionality
  const exportToPDF = useCallback(() => {
    if (filteredLocations.length === 0) return;

    setIsExporting(true);

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Daftar Lokasi", 105, 15, { align: "center" });

      // Add filter information
      doc.setFontSize(10);
      const activeFilters = [];
      if (filters.near_me) activeFilters.push("Lokasi Terdekat (10)");
      if (filters.price) activeFilters.push("Harga Terendah");
      if (filters.rating) activeFilters.push("Rating Tertinggi");
      if (filters.opening_hours) activeFilters.push("Jam Buka");
      if (filters.categories && filters.categories.length > 0) {
        activeFilters.push(`Kategori: ${filters.categories.join(", ")}`);
      }

      doc.text(
        `Filter: ${activeFilters.join(", ") || "Tidak ada filter"}`,
        105,
        22,
        { align: "center" }
      );
      doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 105, 28, {
        align: "center",
      });

      // Create table
      const headers = [
        ["No", "Nama", "Kategori", "Alamat", "Jarak (km)", "Harga", "Rating"],
      ];

      // Format table data
      const data = filteredLocations.map((loc, index) => [
        index + 1,
        loc.name || "-",
        loc.category || "-",
        loc.address || "-",
        loc.distance ? `${loc.distance} km` : "-",
        loc.startPrice && loc.endPrice
          ? `Rp ${new Intl.NumberFormat("id-ID").format(
              loc.startPrice
            )} - Rp ${new Intl.NumberFormat("id-ID").format(loc.endPrice)}`
          : "-",
        loc.rating ? loc.rating.toFixed(1) : "-",
      ]);

      // Add table - using the autoTable plugin correctly
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 35,
        theme: "grid",
        headStyles: {
          fillColor: [34, 197, 94], // Green color
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 35 },
      });

      // Save file
      doc.save(`lokasi_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  }, [filteredLocations, filters]);

  // Handle location selection from TopNavbar search
  const handleLocationSelect = useCallback(location => {
    setSelectedLocation(location);
  }, []);

  // Handle route calculation for MapView
  const handleGetRoute = useCallback(
    location => {
      if (mapViewRef.current && mapViewRef.current.calculateRoute) {
        setOpenMap(true);
        // Call with correct parameters
        mapViewRef.current.calculateRoute(location.coords, location);
      }
    },
    [setOpenMap]
  );

  // Loading Component with Pulse Animation
  const LoadingComponent = () => (
    <div className="max-w-[480px] h-dvh mx-auto bg-white shadow relative">
      <div className="sticky top-0 bg-white">
        {/* TopNavbar Skeleton */}
        <div className="border-b-[1px] border-gray-100">
          <div className="flex items-center gap-4 py-4 w-[90%] mx-auto">
            <div className="aspect-square w-[40px] rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 bg-gray-200 h-[40px] rounded-full animate-pulse"></div>
            <div className="aspect-square w-[40px] rounded-md bg-gray-200 animate-pulse"></div>
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="py-4 w-[90%] mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-gray-200 rounded-full animate-pulse w-24 h-8"
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-[90%] h-[300px] bg-gray-200 animate-pulse"></div>

      {/* Content Skeleton */}
      <div className="mx-auto w-[90%] mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="mb-4 p-4 bg-white border rounded-lg animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

 

  // Show loading state while mounting or fetching data
  if (!mounted || isLoading || isProcessingLocations) {
    return <LoadingComponent />;
  }

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      <div className="sticky top-0 bg-white z-[999999999]">
        <TopNavbar onLocationSelect={handleLocationSelect} />
        <Filter categoryOptions={categoryOptions} />

        {/* Export to PDF button */}
      </div>

      <div
        className={`
        ${
          openMap
            ? "absolute top-0 left-0 w-full h-full z-50"
            : "h-[300px] mb-4 relative"
        }
        bg-white transition-all duration-300
      `}
      >
        <MapView
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          ref={mapViewRef}
          isFullScreen={openMap}
        />

        {/* Tombol Minimize/Maximize */}
        <button
          onClick={() => setOpenMap(!openMap)}
          className="absolute bottom-0 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-[999999] hover:bg-gray-100 transition-all border border-gray-200"
          aria-label={openMap ? "Minimize map" : "Maximize map"}
        >
          {openMap ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15H9M15 15v4.5M15 15h4.5M9 15v4.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m9 0h4.5m-4.5 0v4.5M3.75 20.25v-4.5m0 4.5h4.5m9 0h4.5m-4.5 0v-4.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Konten selanjutnya hanya ditampilkan jika peta tidak dalam mode fullscreen */}
      <div className="mt-20">
        {!openMap && (
          <>
            <div className="mx-auto w-[90%]">
              {filters.near_me && filteredLocations.length > 0 && (
                <div className="bg-blue-50 px-4 py-2 rounded-lg mb-4 text-sm">
                  <p className="text-blue-600">
                    Menampilkan maksimal 10 lokasi terdekat dalam radius 10 km
                    dari posisi Anda
                    {filteredLocations.length < 10 &&
                      filteredLocations.length > 0 &&
                      ` (${filteredLocations.length} lokasi ditemukan)`}
                  </p>
                </div>
              )}

              {filters.near_me && filteredLocations.length === 0 && (
                <div className="bg-orange-50 px-4 py-2 rounded-lg mb-4 text-sm">
                  <p className="text-orange-600">
                    Tidak ada lokasi yang ditemukan dalam radius 10 km dari
                    posisi Anda
                  </p>
                </div>
              )}

              {filteredLocations.length > 0 && !openMap && (
                <div className="px-4 pb-2 flex justify-end -mb-14">
                  <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center text-sm space-x-1 bg-hijau-tua text-white py-1 px-3 rounded hover:bg-green-700 transition"
                  >
                    <FileText size={14} />
                    <span>{isExporting ? "Mengeksport..." : "Export PDF"}</span>
                  </button>
                </div>
              )}
              <Place
                locations={filteredLocations}
                handleGetRoute={handleGetRoute}
                userCoords={userCoords}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom navbar hanya ditampilkan ketika tidak dalam mode fullscreen */}
      {!openMap && <BottomNavbar />}
    </div>
  );
}
