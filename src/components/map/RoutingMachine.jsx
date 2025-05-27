// src/components/map/RoutingMachine.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import polyline from '@mapbox/polyline';

const RoutingMachine = ({ userLocation, destination, setRoute, routePolylineRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !destination) return;

    const fetchRoute = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
      const url = `${process.env.NEXT_PUBLIC_API_ORS}/v2/directions/driving-car`;
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
  }, [userLocation, destination, map, setRoute, routePolylineRef]);

  return null;
};

export default RoutingMachine;