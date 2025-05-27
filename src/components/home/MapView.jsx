"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import "leaflet-routing-machine";
import { useAtom } from "jotai";
import { openMapAtom } from "@/atoms/mapAtom";
import React from "react";

// Import components
import MapHeader from "../map/MapHeader";
import MapContainer from "../map/MapContainer";
import LocationMarkers from "../map/LocationMarkers";
import UserLocationMarker from "../map/UserLocationMarker";
import BottomInfoPanel from "../map/BottomInfoPanel";
import MapControls from "../map/MapControls";

// Fix default icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Available colors for markers
const availableColors = ['blue', 'green', 'orange', 'red', 'violet', 'yellow', 'grey'];

// Function to generate consistent color mapping for categories
const generateColorMapping = (categories) => {
  const colorMapping = {};
  
  categories.forEach((category, index) => {
    // Use modulo to cycle through available colors if we have more categories than colors
    colorMapping[category.toLowerCase()] = availableColors[index % availableColors.length];
  });
  
  return colorMapping;
};

// Function to generate legend items from locations
const generateLegendItems = (locations) => {
  if (!locations || locations.length === 0) {
    return [{ icon: "black", label: "Lokasi Anda" }];
  }

  const categories = [...new Set(locations.map(loc => loc.category))];
  const colorMapping = generateColorMapping(categories);
  
  const legendItems = categories.map(category => ({
    icon: colorMapping[category.toLowerCase()],
    label: category.charAt(0).toUpperCase() + category.slice(1)
  }));
  
  // Always add user location
  legendItems.push({ icon: "black", label: "Lokasi Anda" });
  
  return legendItems;
};

// Function to get category color mapping
const getCategoryColorMapping = (locations) => {
  if (!locations || locations.length === 0) return {};
  
  const categories = [...new Set(locations.map(loc => loc.category))];
  return generateColorMapping(categories);
};

const MapView = forwardRef(({ locations, selectedLocation, isFullScreen = false }, ref) => {
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
  const [currentViewedLocation, setCurrentViewedLocation] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Tambahkan state yang hilang
  const [displayedInfo, setDisplayedInfo] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Add mounted state to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    // Add additional delay for map readiness
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Generate legend items and color mapping from locations data
  const legendItems = generateLegendItems(locations);
  const categoryColorMapping = getCategoryColorMapping(locations);
  const maxPage = Math.ceil(legendItems.length / 3) - 1;

  // Reverse geocode function
  const reverseGeocode = async (lat, lng) => {
    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
    const url = `${process.env.NEXT_PUBLIC_API_ORS}/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.features[0]?.properties?.label || "Tidak ditemukan";
    } catch (err) {
      console.error("Gagal mengambil lokasi teks:", err);
      return "Gagal memuat alamat";
    }
  };

  useEffect(() => {
    if (!isMounted || !mapReady) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        const address = await reverseGeocode(coords[0], coords[1]);
        setUserAddress(address);
      });
    }
  }, [isMounted, mapReady]);

  // Handle selected location from search
  useEffect(() => {
    if (selectedLocation && isMounted && mapReady) {
      calculateRoute(selectedLocation.coords, selectedLocation);
    }
  }, [selectedLocation, isMounted, mapReady]);

  const centerMapOnUser = useCallback(() => {
    if (userLocation && isMounted && mapReady) {
      setCenterOnUser(true);
      setTimeout(() => setCenterOnUser(false), 100);
    }
  }, [userLocation, isMounted, mapReady]);

  // Get category icon with consistent color mapping
  const getCategoryIcon = (category) => {
    const color = categoryColorMapping[category.toLowerCase()] || 'blue';
    
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  const calculateRoute = (destination, location) => {
    console.log("calculateRoute called with:", destination, location);
    setSelectedDestination(destination);
    setCurrentViewedLocation(location);
    
    // Set data untuk BottomInfoPanel
    if (location) {
      const formattedLocationData = {
        ...location,
        item: location, // Tambahkan properti 'item' yang diharapkan BottomInfoPanel
      };
      setActiveLocation(formattedLocationData);
      setDisplayedInfo(formattedLocationData);
    }
    
    setOpenMap(true);
  };

  useImperativeHandle(ref, () => ({
    calculateRoute(coords, locationData) {
      console.log("calculateRoute via ref called with:", coords, locationData);
      
      // Pastikan data lokasi dikirim dengan properti yang benar
      const formattedLocationData = {
        ...locationData,
        item: locationData, // Tambahkan properti 'item' yang diharapkan BottomInfoPanel
      };
      
      setActiveLocation(formattedLocationData);
      setDisplayedInfo(formattedLocationData);
      setSelectedDestination(coords);
      setCurrentViewedLocation(locationData);
      
      // Jika ada mapInstance dan routing functionality
      if (mapInstance) {
        // Add your routing logic here if needed
        console.log("Map instance available for routing");
      }
    }
  }));

  const handleMarkerClick = (location) => {
    console.log("Marker clicked:", location);
    
    // Format data dengan properti 'item' yang diharapkan BottomInfoPanel
    const formattedData = {
      ...location,
      item: location, // Tambahkan properti 'item'
    };
    
    setActiveLocation(formattedData);
    setDisplayedInfo(formattedData);
    setCurrentViewedLocation(location);
    
    // Jika ada mapInstance untuk zoom
    if (mapInstance && location.coords) {
      mapInstance.setView(location.coords, 15);
    }
  };

  const handleCloseInfoPanel = () => {
    setDisplayedInfo(null);
    setActiveLocation(null);
    setCurrentViewedLocation(null);
  };

  const handleCloseBottomPanel = () => {
    setCurrentViewedLocation(null);
    setDisplayedInfo(null);
    setActiveLocation(null);
  };

  // Don't render map until component is fully ready
  if (!isMounted || !mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isFullScreen ? 'h-full' : 'h-[300px]'}`}>
      <MapHeader
        userAddress={userAddress}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        legendPage={legendPage}
        setLegendPage={setLegendPage}
        onCenterUser={centerMapOnUser}
        maxPage={maxPage}
        legendItems={legendItems}
      />
      
      <MapContainer
        openMap={openMap}
        setOpenMap={setOpenMap}
        mapContainerRef={mapContainerRef}
        onMapReady={setMapInstance} // Pass callback untuk mendapatkan map instance
      >
        {mapReady && userLocation && (
          <UserLocationMarker userLocation={userLocation} />
        )}
        
        {mapReady && locations.length > 0 && (
          <LocationMarkers
            locations={locations}
            getCategoryIcon={getCategoryIcon}
            openMap={openMap}
            onMarkerClick={handleMarkerClick}
            onCalculateRoute={calculateRoute}
          />
        )}

        {mapReady && (
          <MapControls
            userLocation={userLocation}
            centerOnUser={centerOnUser}
            selectedDestination={selectedDestination}
            setRoute={setRoute}
            routePolylineRef={routePolylineRef}
            openMap={openMap}
            showLegend={showLegend}
            legendPage={legendPage}
            legendItems={legendItems}
          />
        )}
      </MapContainer>

      {/* Bottom Info Panel - tampilkan saat ada data yang dipilih */}
      {(displayedInfo || currentViewedLocation) && (
        <BottomInfoPanel 
          item={displayedInfo?.item || displayedInfo || currentViewedLocation}
          location={displayedInfo || currentViewedLocation}
          onClose={handleCloseInfoPanel}
        />
      )}
    </div>
  );
});

MapView.displayName = "MapView";

export default MapView;