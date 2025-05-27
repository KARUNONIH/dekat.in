// src/components/map/UserLocationMarker.jsx
import React from 'react';
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='rgba(0,0,0,0.2)'/><circle cx='12' cy='12' r='5' fill='black'/></svg>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const UserLocationMarker = ({ userLocation }) => {
  if (!userLocation) return null;

  return (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>Lokasi Anda</Popup>
    </Marker>
  );
};

export default UserLocationMarker;