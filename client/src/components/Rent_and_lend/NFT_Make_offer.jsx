// NFT_Make_offer.jsx
import React from "react";
import { HandCoins, HandHeart, Hourglass } from "lucide-react";

// Helper to format addresses
const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

function NFT_Make_offer({ setIsMakeOffer, currentOwner, gameName }) {
  return (
    <div className="w-full mx-auto bg-[#171c25] border border-gray-500 rounded-xl shadow-md px-5 py-4 flex flex-col gap-5 ">
      <div className="flex justify-between items-center">
        <h2
          className="text-lg font-semibold text-white select-none truncate"
          title={gameName}
        >
          {gameName || "NFT Details"}
        </h2>
        <div className="flex-shrink-0 bg-gray-700 rounded-full px-3 py-1 items-center">
          <p className="text-gray-300 text-xs select-none">
            {"Owner: "}
            <span className="text-gray-100 font-mono">
              {formatAddress(currentOwner)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={() => setIsMakeOffer(true)}
          className="px-3 py-2 bg-[#1f2937] rounded-xl font-medium hover:bg-blue-600 text-gray-300 hover:text-white w-full items-center justify-center cursor-pointer flex gap-2 border border-gray-600 transition-all duration-200 ease-in-out"
        >
          Rent In
          <Hourglass strokeWidth={1.5} size={19} className="text-white" />
        </button>
        {/* ... lend button ... */}
      </div>
    </div>
  );
}

export default NFT_Make_offer;
