import React from "react";

export default function NFTGameOriginRow() {
  const gameAddress = "0xABCD...1234"; // Replace with actual game/origin contract
  const currentOwner = "0xEFGH...5678"; // Replace with actual current owner

  return (
    <div className="w-full mx-auto bg-[#171c25] border border-gray-500 rounded-xl shadow-md px-5 py-5">
      <div className="flex items-center gap-4">
        <img
          src={undefined}
          alt="game Nft"
          className="w-[50px] h-[50px] bg-amber-500 object-cover rounded-xl "
        />
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between items-center text-sm text-gray-800">
            <span className="font-medium text-white">Associated with Game</span>
            <span className="text-white select-none ">→</span>
            <span className="font-medium text-white">Current Owner</span>
          </div>
          <div className="flex justify-between mt-1 text-sm text-gray-600">
            <span className="cursor-pointer text-gray-300">{gameAddress}</span>
            <span className="cursor-pointer text-gray-300">{currentOwner}</span>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
}
