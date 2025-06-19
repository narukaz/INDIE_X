import React, { useState } from "react";
import { HandHeart, Hourglass, WalletIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
function Game_NFT_COLLECT_CARD() {
  const navigate = useNavigate();
  const exampleNFT = {
    image: "https://...",
    name: "My Cool NFT #4",
    creator: "GameName",
    price: "0.1",
    origin: "0xABC...123",
    owner: "0xABC...123",
    tokenId: "4",
    traits: [
      { type: "Background", value: "Blue" },
      { type: "Rarity", value: "Rare" },
    ],
    description: "A beautifully crafted piece from the XYZ collection.",
  };
  return (
    <>
      <div
        onClick={() => navigate("/collect-game-nft/game")}
        className="relative w-[300px] h-[350px] bg-black   rounded-2xl cursor-pointer border border-gray-700 overflow-hidden group"
      >
        <img alt="this is NFT" className="w-full h-full bg-gray-500" />
        <div className="flex  w-full absolute left-0  group-hover:bottom-0 -bottom-11 transition-all border-t border-t-gray-500 ">
          <button
            onClick={() => {
              navigate("");
            }}
            className=" px-3 py-2 bg-[#1f2937] font-medium hover:bg-blue-600 text-gray-300 hover:text-white w-full items-center justify-center cursor-pointer flex gap-2 border-r border-r-gray-600 transition-all duration-200 ease-in-out"
          >
            BUY
            <WalletIcon
              strokeWidth={1.2}
              size={19}
              className="text-white transition-colors duration-200 ease-in-out"
            />
          </button>
        </div>
      </div>
    </>
  );
}

export default Game_NFT_COLLECT_CARD;
