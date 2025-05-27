// src/components/map/MapController.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapController = ({ userLocation, centerOnUser }) => {
  const map = useMap();

  useEffect(() => {
    if (centerOnUser && userLocation) {
      map.setView(userLocation, 15);
    }
  }, [map, userLocation, centerOnUser]);

  return null;
};

export default MapController;