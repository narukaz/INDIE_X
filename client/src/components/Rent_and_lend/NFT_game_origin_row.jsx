// NFTGameOriginRow.jsx
import React from "react";

// Helper to format addresses
const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export default function NFTGameOriginRow({
  contractAddress,
  currentOwner,
  gameImageUrl,
}) {
  return (
    <div className="w-full mx-auto bg-[#171c25] border border-gray-500 rounded-xl shadow-md px-5 py-5">
      <div className="flex items-center gap-4">
        <img
          src={gameImageUrl || "https://via.placeholder.com/50"}
          alt="Game"
          className="w-[50px] h-[50px] bg-slate-800 object-cover rounded-xl border border-slate-700"
        />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-medium">Associated Game</span>
            <span className="text-slate-500">→</span>
            <span className="font-medium">Current Owner</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300 font-mono">
            <span
              className="cursor-pointer hover:underline"
              title={contractAddress}
            >
              {formatAddress(contractAddress)}
            </span>
            <span
              className="cursor-pointer hover:underline"
              title={currentOwner}
            >
              {formatAddress(currentOwner)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
