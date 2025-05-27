// src/components/map/MapResizeController.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapResizeController = ({ openMap }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      console.log("Map size invalidated, openMap is:", openMap);
    }, 500);

    return () => clearTimeout(timer);
  }, [openMap, map]);

  return null;
};

export default MapResizeController;