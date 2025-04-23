"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { openMapAtom } from "@/atoms/mapAtom";
import { filterAtom } from "@/atoms/filterAtom";
import BottomNavbar from "@/components/BotomNavbar";
import Filter from "@/components/Filter";
import Place from "@/components/Place";
import TopNavbar from "@/components/TopNavbar";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export default function Home() {
  const [openMap, setOpenMap] = useAtom(openMapAtom);
  const [filters] = useAtom(filterAtom);
  const mapViewRef = useRef(null);
  const [userCoords, setUserCoords] = useState(null);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);

  const categoryOptions = ["Cafe", "Market", "Garden", "Farm", "Greenhouse"];

  const allLocations = [
    {
      name: "Kopi Jakarta",
      category: "Cafe",
      coords: [-6.201, 106.82],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Thamrin No.5, Bogor",
      openHour: "08:00",
      closeHour: "22:00",
      startPrice: 15000,
      endPrice: 50000,
      rating: 4.3,
    },
    {
      name: "Pasar Minggu",
      category: "Market",
      coords: [-6.21, 106.832],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Raya Pasar Minggu, Bogor",
      openHour: "06:00",
      closeHour: "18:00",
      startPrice: 2000,
      endPrice: 100000,
      rating: 4.2,
    },
    {
      name: "Kebun Raya Bogor",
      category: "Garden",
      coords: [-6.215, 106.805],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Ir. H Juanda No.13, Bogor",
      openHour: "07:00",
      closeHour: "17:00",
      startPrice: 15000,
      endPrice: 35000,
      rating: 4.7,
    },
    {
      name: "Kampung Organik",
      category: "Farm",
      coords: [-6.24, 106.85],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Desa Cibodas, Bogor",
      openHour: "09:00",
      closeHour: "16:00",
      startPrice: 5000,
      endPrice: 30000,
      rating: 4.4,
    },
    {
      name: "Greenhouse Bogor",
      category: "Greenhouse",
      coords: [-6.228, 106.822],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Pahlawan, Bogor",
      openHour: "08:00",
      closeHour: "17:00",
      startPrice: 8000,
      endPrice: 25000,
      rating: 4.6,
    },
  ];

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);
      },
      (err) => {
        console.error("Gagal mengambil lokasi pengguna:", err);
      }
    );
  }, []);

  // Calculate distance for each location
  useEffect(() => {
    if (!userCoords) return;

    const processLocations = async () => {
      const locationsWithDistance = await Promise.all(
        allLocations.map(async (loc) => {
          // Ambil rute menggunakan OpenRouteService
          const route = await fetchRoute(userCoords, loc.coords);
          const distance = route ? route.distance / 1000 : 0; // Konversi dari meter ke kilometer

          // Parse opening hour to date object for sorting
          const [hours, minutes] = loc.openHour.split(':').map(Number);
          const openingTime = new Date();
          openingTime.setHours(hours, minutes, 0);

          return {
            ...loc,
            distance: Number(distance.toFixed(2)), // dalam kilometer
            openingTime: openingTime
          };
        })
      );

      setLocations(locationsWithDistance);
    };

    processLocations();
  }, [userCoords]);

  // Apply filters to locations
  useEffect(() => {
    if (locations.length === 0) return;

    let result = [...locations];
    
    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(loc => filters.categories.includes(loc.category));
    }
    
    // Create an array to store active sort functions in priority order
    const sortFunctions = [];
    
    // Add sorting functions based on active filters
    if (filters.near_me) {
      sortFunctions.push((a, b) => a.distance - b.distance);
    }
    
    if (filters.price) {
      sortFunctions.push((a, b) => a.startPrice - b.startPrice);
    }
    
    if (filters.rating) {
      sortFunctions.push((a, b) => b.rating - a.rating);
    }
    
    if (filters.opening_hours) {
      sortFunctions.push((a, b) => a.openingTime - b.openingTime);
    }
    
    // Apply all active sort functions in priority order
    if (sortFunctions.length > 0) {
      result.sort((a, b) => {
        for (const sortFn of sortFunctions) {
          const comparison = sortFn(a, b);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }
    
    setFilteredLocations(result);
  }, [filters, locations]);

  // Fungsi untuk mendapatkan rute dari OpenRouteService API
  const fetchRoute = async (startCoords, endCoords) => {
    const ORS_API_KEY = "5b3ce3597851110001cf6248b681bce53f4b43e3be2b6a613898bb4e"; // Ganti dengan API key OpenRouteService Anda
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          "Authorization": ORS_API_KEY,
        },
      });
    
      const data = await response.json();
    
      // Memeriksa struktur respons dan mengakses data distance
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];  // Mendapatkan feature pertama
        const segment = feature.properties.segments[0];  // Mendapatkan segmen pertama dalam properti segments
    
        return segment;  // Mengembalikan segmen dengan distance yang sudah dikonversi
      }
    
      return null; // Jika tidak ada data yang valid
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  // Handle route calculation for MapView
  const handleGetRoute = (location) => {
    if (mapViewRef.current && mapViewRef.current.calculateRoute) {
      setOpenMap(true);
      // Call with correct parameters: destination coords first, then location object
      mapViewRef.current.calculateRoute(location.coords, location);
    } else {
      console.error("MapView reference or calculateRoute method not available");
    }
  };

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      <div className="sticky top-0 bg-white z-[99999999999]">
        <TopNavbar />
        <Filter categoryOptions={categoryOptions} />
      </div>

      <div
        className={`${
          openMap ? "absolute top-0 left-0 w-full h-full" : ""
        } bg-white transition-all duration-300`}
      >
        <MapView locations={filteredLocations} ref={mapViewRef} />
      </div>

      <BottomNavbar />

      <div className="mx-auto w-[90%]">
        <Place locations={filteredLocations} handleGetRoute={handleGetRoute} userCoords={userCoords} />
      </div>
    </div>
  );
}