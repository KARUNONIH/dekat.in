// src/components/map/LocationMarkers.jsx
import React from 'react';
import { Marker, Popup } from "react-leaflet";
import { IoIosArrowForward } from "react-icons/io";
import { MdAccessTime } from "react-icons/md";

const LocationMarkers = ({ 
  locations, 
  getCategoryIcon, 
  openMap, 
  onMarkerClick, 
  onCalculateRoute 
}) => {
  return (
    <>
      {locations.map((loc, i) => (
        <Marker
          key={i}
          position={loc.coords}
          icon={getCategoryIcon(loc.category)}
          eventHandlers={{
            click: () => onMarkerClick(loc),
          }}
        >
          {!openMap && (
            <Popup>
              <div className="w-[250px] rounded">
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
                    onClick={() => onCalculateRoute(loc.coords, loc)}
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
    </>
  );
};

export default LocationMarkers;