"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { MdAccessTime } from "react-icons/md";
import "leaflet-routing-machine";
import polyline from "@mapbox/polyline";
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import { useAtom } from "jotai";
import { openMapAtom } from "@/atoms/mapAtom";
import React from "react";
import { Star, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { IoCloseSharp } from "react-icons/io5";
import { TiArrowBack } from "react-icons/ti";
import { FiMaximize2 } from "react-icons/fi";
import { FiMinimize2 } from "react-icons/fi";

async function reverseGeocode(lat, lng) {
  const apiKey = "5b3ce3597851110001cf6248b681bce53f4b43e3be2b6a613898bb4e"; // Ganti dengan API key ORS kamu
  const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.features[0]?.properties?.label || "Tidak ditemukan";
  } catch (err) {
    console.error("Gagal mengambil lokasi teks:", err);
    return "Gagal memuat alamat";
  }
}

// Fix default icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Komponen untuk kontrol map
function MapController({ userLocation, centerOnUser }) {
  const map = useMap();

  useEffect(() => {
    if (centerOnUser && userLocation) {
      map.setView(userLocation, 15);
    }
  }, [map, userLocation, centerOnUser]);

  return null;
}

function RoutingMachine({
  userLocation,
  destination,
  setRoute,
  routePolylineRef,
}) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !destination) return;

    const fetchRoute = async () => {
      const apiKey = "5b3ce3597851110001cf6248b681bce53f4b43e3be2b6a613898bb4e"; // Ganti dengan API key ORS kamu
      const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
      const body = {
        coordinates: [
          [userLocation[1], userLocation[0]],
          [destination[1], destination[0]],
        ],
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!data.routes || data.routes.length === 0) return;

        const decodedCoords = polyline.decode(data.routes[0].geometry);

        if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);

        const newPolyline = L.polyline(decodedCoords, {
          color: "#6366F1",
          weight: 4,
        }).addTo(map);

        routePolylineRef.current = newPolyline;
        map.fitBounds(newPolyline.getBounds());
        setRoute(data);
      } catch (error) {
        console.error("Routing error:", error);
      }
    };

    fetchRoute();

    return () => {
      if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);
    };
  }, [userLocation, destination]);

  return null;
}

const legendItems = [
  { icon: "blue", label: "Cafe" },
  { icon: "green", label: "Market" },
  { icon: "black", label: "Lokasi Anda" },
  { icon: "orange", label: "Restoran" },
  { icon: "red", label: "Toko" },
  { icon: "violet", label: "Kantor" },
];

function LegendDropdown({ showLegend, currentPage }) {
  const perPage = 5;
  const pageItems = legendItems.slice(
    currentPage * perPage,
    (currentPage + 1) * perPage
  );
  return (
    <div
      className={`absolute top-4 right-4 bg-white shadow-lg rounded p-3 transition-all ease-in-out z-[9999] w-[150px] ${
        showLegend ? "block" : "hidden"
      }`}
    >
      <div className="text-sm space-y-2">
        {pageItems.map((item, index) => (
          <div key={index} className="flex items-center border-b-[1px] pb-1">
            {item.icon === "black" ? (
              <span className="w-[12px] h-[12px] rounded-full bg-black inline-block mr-2" />
            ) : (
              <img
                src={`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${item.icon}.png`}
                className="w-[14px] inline-block mr-2"
              />
            )}
            <span className="">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapResizeController({ openMap }) {
  const map = useMap();

  useEffect(() => {
    // Use a more robust approach to resize
    const timer = setTimeout(() => {
      map.invalidateSize();
      console.log("Map size invalidated, openMap is:", openMap);
    }, 500); // Increased timeout for better reliability

    return () => clearTimeout(timer);
  }, [openMap, map]);

  return null;
}

const MapView = forwardRef(({ locations }, ref) => {
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const routePolylineRef = useRef(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [legendPage, setLegendPage] = useState(0);
  const [userAddress, setUserAddress] = useState(null);
  const [centerOnUser, setCenterOnUser] = useState(false);
  const [openMap, setOpenMap] = useAtom(openMapAtom);
  const mapContainerRef = useRef(null);

  // New state to store the currently viewed location information
  const [currentViewedLocation, setCurrentViewedLocation] = useState(null);

  // Log when openMap changes to help debug
  useEffect(() => {
    console.log("openMap state changed to:", openMap);
  }, [openMap]);

  const maxPage = Math.ceil(legendItems.length / 3) - 1;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        const address = await reverseGeocode(coords[0], coords[1]);
        setUserAddress(address);
      });
    }
  }, []);

  // Fungsi untuk memposisikan peta ke lokasi pengguna
  const centerMapOnUser = useCallback(() => {
    if (userLocation) {
      setCenterOnUser(true);
      // Reset state setelah peta digerakkan
      setTimeout(() => setCenterOnUser(false), 100);
    }
  }, [userLocation]);

  const getCategoryIcon = category =>
    new L.Icon({
      iconUrl:
        category === "Cafe"
          ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
          : category === "Market"
          ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
          : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

  const userIcon = new L.Icon({
    iconUrl: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='rgba(0,0,0,0.2)'/><circle cx='12' cy='12' r='5' fill='black'/></svg>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  // This is the function that will be exposed via ref
  const calculateRoute = (destination, location) => {
    console.log("calculateRoute called with:", destination, location);
    setSelectedDestination(destination);
    setCurrentViewedLocation(location);
    setOpenMap(true);
  };

  // Expose the calculateRoute function via ref
  useImperativeHandle(ref, () => ({
    calculateRoute
  }), []);

  const handleNext = () =>
    setLegendPage(prev => (prev === maxPage ? 0 : prev + 1));
  const handlePrev = () =>
    setLegendPage(prev => (prev === 0 ? maxPage : prev - 1));
  const handleClose = () => {
    setShowLegend(false);
    setLegendPage(0);
  };

  // Handler untuk klik pada marker
  const handleMarkerClick = location => {
    setCurrentViewedLocation(location);
  };

  return (
    <>
      <div className={`flex items-center justify-between w-[90%] mx-auto `}>
        <p className="text-xs">
          Lokasi anda, {userAddress ? userAddress : "Mengambil lokasi..."},{" "}
          <span className="underline cursor-pointer" onClick={centerMapOnUser}>
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

      {/* Wrap MapContainer in a div with dynamic style */}
      <div
        ref={mapContainerRef}
        style={{
          height: openMap ? "calc(100% - 120px)" : "300px",
          width: "100%",
          transition: "height 0.3s ease-in-out",
          position: "relative",
        }}
      >
        <button
          className="absolute z-[99999] bottom-1 right-1 bg-black/50 text-white font-medium text-lg  rounded h-[40px] aspect-square flex items-center justify-center"
          onClick={() => setOpenMap(!openMap)}
        >
          {openMap ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
        <MapContainer
          center={[-6.2, 106.8]}
          zoom={13}
          scrollWheelZoom
          className="w-full h-full"
          whenCreated={mapInstance => {
            // Additional initialization if needed
            console.log("Map created");
          }}
        >
          <MapResizeController openMap={openMap} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Lokasi Anda</Popup>
            </Marker>
          )}

          {locations.map((loc, i) => (
            <Marker
              key={i}
              position={loc.coords}
              icon={getCategoryIcon(loc.category)}
              eventHandlers={{
                click: () => handleMarkerClick(loc), // Set currentViewedLocation when marker is clicked
              }}
            >
              {!openMap && (
                <Popup>
                  <div className={`w-[250px] rounded`}>
                    <section>
                      <img src={loc.image} alt="" className="w-full h-[70px]" />
                    </section>
                    <section className="flex justify-between items-center">
                      <div className="p-2 flex-col gap-2 flex">
                        <h1 className="text-xl font-semibold">{loc.name}</h1>
                        <p className="font-medium">{loc.address}</p>
                        <div className="flex gap-1">
                          <section>
                            <MdAccessTime />
                          </section>
                          <section className="flex text-xs gap-2">
                            <p>
                              {loc.openHour} - {loc.closeHour}
                            </p>
                            <p>
                              {Math.round(loc.startPrice / 1000)}K -{" "}
                              {Math.round(loc.endPrice / 1000)}K
                            </p>
                          </section>
                        </div>
                      </div>
                      <button
                        className="cursor-pointer"
                        onClick={() => calculateRoute(loc.coords, loc)} // Also pass the location object
                        title="Rute"
                      >
                        <IoIosArrowForward className="text-3xl" />
                      </button>
                    </section>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}

          {userLocation && selectedDestination && (
            <RoutingMachine
              userLocation={userLocation}
              destination={selectedDestination}
              setRoute={setRoute}
              routePolylineRef={routePolylineRef}
            />
          )}

          {/* Controller untuk fitur center map */}
          <MapController
            userLocation={userLocation}
            centerOnUser={centerOnUser}
          />

          <LegendDropdown showLegend={showLegend} currentPage={legendPage} />
        </MapContainer>
      </div>

      {/* Bottom info panel that displays currentViewedLocation data */}
      {currentViewedLocation && openMap && (
        <div className={``}>
          <div className="w-full absolute bottom-[58px] z-[9999999] bg-white rounded-t-lg  overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between ">
                <div>
                  <h2 className="text-lg font-bold">
                    {currentViewedLocation.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                    <section className="flex items-center gap-1">
                      <span className="font-semibold mr-1">
                        {currentViewedLocation.rating}
                      </span>
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </section>
                    <section>
                      <span className="text-sm text-gray-600">
                        {currentViewedLocation.category} - {currentViewedLocation.distance} km
                      </span>
                    </section>
                  </div>
                </div>
                <div
                  className=""
                  onClick={() => setCurrentViewedLocation(null)}
                >
                  <div className="flex items-center gap-2">
                    <button className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua">
                      <TiArrowBack className="text-2xl text-white" />
                    </button>
                    <button className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua">
                      <IoCloseSharp className="text-2xl text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hours and Price Range */}
              <div className="flex items-center mt-2 text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {currentViewedLocation.openHour} -{" "}
                  {currentViewedLocation.closeHour} Rp
                  {Math.round(currentViewedLocation.startPrice / 1000)}K -
                  {Math.round(currentViewedLocation.endPrice / 1000)}K
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  className="bg-hijau-tua text-white px-4 py-[2px] rounded-full text-sm"
                  onClick={() =>
                    calculateRoute(
                      currentViewedLocation.coords,
                      currentViewedLocation
                    )
                  }
                >
                  Lihat Rute
                </button>
                <button className="bg-hijau-tua text-white px-4 py-[2px] rounded-full text-sm">
                 Lihat Review
                </button>
              </div>
              <div className="flex overflow-x-auto scrollbar-hide mt-4 gap-4">
                <img
                  src={currentViewedLocation.image}
                  alt={`${currentViewedLocation.name}`}
                  className="aspect-video h-[100px] flex-shrink-0 rounded"
                />
                <img
                  src={currentViewedLocation.image}
                  alt={`${currentViewedLocation.name}`}
                  className="aspect-video h-[100px] flex-shrink-0 rounded"
                />
                <img
                  src={currentViewedLocation.image}
                  alt={`${currentViewedLocation.name}`}
                  className="aspect-video h-[100px] flex-shrink-0 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

MapView.displayName = "MapView";

export default MapView;