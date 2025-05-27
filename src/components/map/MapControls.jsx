// src/components/map/MapControls.jsx
import React from 'react';
import MapController from './MapController';
import RoutingMachine from './RoutingMachine';
import MapResizeController from './MapResizeController';
import LegendDropdown from './LegendDropdown';

const MapControls = ({
  userLocation,
  centerOnUser,
  selectedDestination,
  setRoute,
  routePolylineRef,
  openMap,
  showLegend,
    legendPage,
  legendItems
}) => {
  return (
    <>
      <MapResizeController openMap={openMap} />
      
      <MapController
        userLocation={userLocation}
        centerOnUser={centerOnUser}
      />

      {userLocation && selectedDestination && (
        <RoutingMachine
          userLocation={userLocation}
          destination={selectedDestination}
          setRoute={setRoute}
          routePolylineRef={routePolylineRef}
        />
      )}

      <LegendDropdown 
  showLegend={showLegend} 
  currentPage={legendPage}
  legendItems={legendItems} // Kirim data dinamis dari MapView
/>
    </>
  );
};

export default MapControls;