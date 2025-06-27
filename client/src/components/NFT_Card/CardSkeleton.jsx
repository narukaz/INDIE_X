import React from "react";

const CardSkeleton = () => (
  <div
    className="rounded-2xl bg-[#0E1420]
               max-w-[400px] h-auto aspect-[9.5/12.5] p-1 flex flex-col
               border border-solid border-gray-700 animate-pulse"
  >
    <div className="w-full h-full bg-gray-800/50 rounded-t-xl"></div>
    <div className="w-full p-2 mt-auto">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  </div>
);

export default CardSkeleton;
