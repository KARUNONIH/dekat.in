// src/components/map/MapHeader.jsx
import React from 'react';
import { GrPrevious, GrNext } from "react-icons/gr";

const MapHeader = ({ 
  userAddress, 
  showLegend, 
  setShowLegend, 
  legendPage, 
  setLegendPage, 
  onCenterUser,
    maxPage,
    legendItems
}) => {
  const handleNext = () =>
    setLegendPage(prev => (prev === maxPage ? 0 : prev + 1));
  const handlePrev = () =>
    setLegendPage(prev => (prev === 0 ? maxPage : prev - 1));
  const handleClose = () => {
    setShowLegend(false);
    setLegendPage(0);
  };

  return (
    <div className="flex items-center justify-between w-[90%] mx-auto">
      <p className="text-xs">
        Lokasi anda, {userAddress ? userAddress : "Mengambil lokasi..."},{" "}
        <span className="underline cursor-pointer" onClick={onCenterUser}>
          Lihat di map
        </span>
      </p>

      <div className="my-3 flex justify-end gap-2">
        {!showLegend ? (
          <button
            onClick={() => setShowLegend(true)}
            className="text-nowrap px-3 py-1 rounded shadow hover:bg-hijau-muda transition-all text-sm bg-hijau-tua text-white font-medium"
          >
            Lihat Legenda
          </button>
        ) : (
          <>
            <button
              onClick={handlePrev}
              className="w-[20px] flex justify-center items-center rounded shadow hover:bg-hijau-muda transition-all text-sm bg-hijau-tua text-white font-medium"
            >
              <GrPrevious />
            </button>
            <button
              onClick={handleNext}
              className="w-[20px] flex justify-center items-center rounded shadow hover:bg-hijau-muda transition-all text-sm bg-hijau-tua text-white font-medium"
            >
              <GrNext />
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-1 rounded shadow hover:bg-hijau-muda transition-all text-sm bg-hijau-tua text-white font-medium"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MapHeader;