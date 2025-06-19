import React, { useState } from "react";
import NFT_explore_Card from "./NFT_explore_Card";

function NFT_explorer() {
  return (
    <>
      <div className="relative shadow-md px-9 py-8 overflow-hidden gap-4 w-full mt-24 bg-[#171c25] flex flex-col">
        <div className="relative ">
          <img
            src="https://cdnb.artstation.com/p/assets/images/images/009/761/017/large/jakub-rozalski-1920-you-reap-what-you-sowih.jpg?1520769169"
            className="w-full h-[150px] object-cover rounded-4xl"
          />
          {/* <div className="w-full h-[150px] bg-gradient-to-r from-black to-transparent absolute top-0 left-0"></div> */}
          <h1 className="absolute left-5 bottom-5 text-7xl text-blue-500 font-bold ">
            TRADE GAME AND SKIN NFT's!
          </h1>
          <h1 className="absolute left-6 bottom-5 text-7xl text-yellow-400 font-bold ">
            TRADE GAME AND SKIN NFT's!
          </h1>
        </div>

        <div className=" flex flex-col border rounded-2xl border-gray-500 overflow-hidden ">
          <div className="flex items-center gap-4 w-full">
            <input
              type="text"
              className="flex-grow px-4 py-2 text-xl text-gray-500 outline-none bg-black w-full "
              placeholder="enter NFT's/Game's Address"
            />
            <label className="inline-flex items-center cursor-pointer gap-2 flex-shrink-0 px-4">
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
              <span className="text-sm text-gray-300">show owned only</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3 px-4 py-4">
            {/* here */}

            <NFT_explore_Card />
            <NFT_explore_Card />
            <NFT_explore_Card />
            <NFT_explore_Card />
            <NFT_explore_Card />
            <NFT_explore_Card />
          </div>
        </div>
      </div>
    </>
  );
}

export default NFT_explorer;
