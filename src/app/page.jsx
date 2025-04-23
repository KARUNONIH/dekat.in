"use client";

import { openMapAtom } from "@/atoms/mapAtom";
import BottomNavbar from "@/components/BotomNavbar";
import Filter from "@/components/Filter";
import Place from "@/components/Place";
import TopNavbar from "@/components/TopNavbar";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export default function Home() {
  const categoryOptions = ["Cafe", "Market", "Garden", "Farm", "Greenhouse"];
  const [openMap, setOpenMap] = useAtom(openMapAtom);

  const locations = [
    {
      name: "Kopi Jakarta",
      category: "Cafe",
      coords: [-6.201, 106.82],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Thamrin No.5, Jakarta",
      openHour: "08:00",
      closeHour: "22:00",
      startPrice: 15000,
      endPrice: 50000,
      rating: 4.5,
    },
    {
      name: "Cafe Santuy",
      category: "Cafe",
      coords: [-6.21, 106.832],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Sudirman No.10, Jakarta",
      openHour: "09:00",
      closeHour: "23:00",
      startPrice: 20000,
      endPrice: 60000,
      rating: 4.5,
    },
    {
      name: "Ngopi Dulu",
      category: "Cafe",
      coords: [-6.215, 106.805],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Kemang Raya No.21, Jakarta",
      openHour: "07:00",
      closeHour: "21:00",
      startPrice: 10000,
      endPrice: 40000,
      rating: 4.5,
    },
    {
      name: "Pasar Minggu",
      category: "Market",
      coords: [-6.24, 106.85],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Raya Pasar Minggu, Jakarta",
      openHour: "06:00",
      closeHour: "18:00",
      startPrice: 2000,
      endPrice: 100000,
      rating: 4.5,
    },
    {
      name: "Pasar Induk",
      category: "Market",
      coords: [-6.228, 106.822],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Otto Iskandardinata, Jakarta",
      openHour: "05:00",
      closeHour: "19:00",
      startPrice: 1000,
      endPrice: 80000,
      rating: 4.5,
    },
    {
      name: "Pasar Pagi",
      category: "Market",
      coords: [-6.195, 106.812],
      image: "/assets/content/prolog-kopi.jpg",
      address: "Jl. Pasar Pagi No.1, Jakarta",
      openHour: "04:00",
      closeHour: "14:00",
      startPrice: 500,
      endPrice: 70000,
      rating: 4.5,
    },
  ];

  return (
    <div className="max-w-[480px] h-dvh mx-auto overflow-y-auto bg-white shadow relative scrollbar-hide">
      <div className="sticky top-0 bg-white z-[99999999999]">
      <TopNavbar />
        <Filter categoryOptions={categoryOptions} />
        </div>
      <div className={`${openMap ? "absolute top-0 left-0 w-full h-full" : ""} bg-white transition-all duration-300`}>
        <MapView locations={locations} />
      </div>
      <BottomNavbar />
      <div className="mx-auto w-[90%]">
        <Place locations={locations} />
      </div>
    </div>
  );
}
