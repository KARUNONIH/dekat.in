import React from 'react';

const LegendDropdown = ({ showLegend, currentPage, legendItems = [] }) => {
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
                alt={item.label}
              />
            )}
            <span className="">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendDropdown;