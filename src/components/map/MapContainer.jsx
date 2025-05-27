import { useEffect, useRef, useState } from "react";
import { MapContainer as LeafletMapContainer, TileLayer } from "react-leaflet";

const MapContainer = ({ openMap, setOpenMap, mapContainerRef, children }) => {
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef(null);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMapCreated = (map) => {
    if (mapContainerRef) {
      mapContainerRef.current = map;
    }
  };

  // Don't render until we're on client
  if (!isClient) {
    return (
      <div className={`${
        openMap 
          ? "h-full w-full" 
          : "h-[300px] w-full"
      } transition-all duration-300 relative bg-gray-100 flex items-center justify-center`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${
        openMap 
          ? "h-full w-full" 
          : "h-[300px] w-full"
      } transition-all duration-300 relative`}
    >
      <LeafletMapContainer
        center={[-6.2, 106.816]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={handleMapCreated}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;