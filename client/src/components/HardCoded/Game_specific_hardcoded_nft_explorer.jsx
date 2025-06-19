import React, { useState } from "react";
import Game_NFT_COLLECT_CARD from "../collect_games_nft/Game_NFT_COLLECT_CARD";
import Game_specific_hardcoded_nft_Card from "./Game_specific_hardcoded_nft_Card";

function Game_specific_hardcoded_nft_explorer() {
  return (
    <>
      <div className="relative shadow-md px-9 py-8 overflow-hidden gap-4 w-full bg-black flex">
        <div className=" flex flex-col border rounded-2xl border-gray-500 overflow-hidden ">
          <div className="flex items-center gap-4 w-full">
            <label className="inline-flex items-center cursor-pointer gap-2 flex-shrink-0 px-4 py-4 border-b border-b-gray-500">
              <input type="checkbox" className="peer hidden" />
              <div className="w-5 h-5 rounded border-2 border-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">sort by popular</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3 px-4 py-4">
            {/* here */}

            <Game_specific_hardcoded_nft_Card />
            <Game_specific_hardcoded_nft_Card />
            <Game_specific_hardcoded_nft_Card />
            <Game_specific_hardcoded_nft_Card />
            <Game_specific_hardcoded_nft_Card />
          </div>
        </div>
      </div>
    </>
  );
}

export default Game_specific_hardcoded_nft_explorer;
