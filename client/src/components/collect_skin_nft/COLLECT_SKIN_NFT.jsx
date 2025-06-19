import React from "react";
import SKIN_NFT_COLLECT_Explorer from "./SKIN_NFT_COLLECT_Explorer";

function COLLECT_SKIN_NFT() {
  return (
    <>
      <div className="flex flex-col  mt-22">
        <div className="relative">
          <img
            src="https://cdnb.artstation.com/p/assets/images/images/009/761/017/large/jakub-rozalski-1920-you-reap-what-you-sowih.jpg?1520769169"
            className="w-full h-[150px] object-cover"
          />
          <div className="w-full h-[150px] bg-gradient-to-r from-black to-transparent absolute top-0 left-0"></div>
          <h1 className="absolute left-5 bottom-5 text-7xl text-blue-500 font-bold ">
            GRAB BEST SKIN NFT's!
          </h1>
          <h1 className="absolute left-6 bottom-5 text-7xl text-yellow-400 font-bold ">
            GRAB BEST SKIN NFT's!
          </h1>
        </div>
        <SKIN_NFT_COLLECT_Explorer />
      </div>
    </>
  );
}

export default COLLECT_SKIN_NFT;
