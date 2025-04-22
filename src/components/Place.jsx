import React from "react";
import { Clock, Star, ChevronRight } from "lucide-react";

export default function Place({ locations }) {
  return (
    <div className="mb-20 mt-4">
      <h1 className="text-xl font-bold">Semua Lokasi</h1>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {locations.map((location, index) => (
          <div
            key={index}
            className="bg-hijau-tua rounded-lg text-white p-4 shadow-md w-full max-w-md flex justify-between items-center"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">{location.name}</h2>
                  <p className="text-sm text-white/90">{location.address}</p>

                  <div className="flex items-center mt-1 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {location.openHour} - {location.closeHour} •{" "}
                      {Math.round(location.startPrice / 1000)}K -{" "}
                      {Math.round(location.endPrice / 1000)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex  items-center gap-4">
              <section>
                <div className="text-white/90 font-medium mb-2">
                  {location.distance || "700"} m
                </div>
                <div className="flex items-center">
                  <Star
                    size={16}
                    fill="yellow"
                    color="yellow"
                    className="mr-1"
                  />
                  <span className="font-bold">{location.rating}</span>
                </div>
              </section>
              <button>
                <ChevronRight className="text-2xl" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
