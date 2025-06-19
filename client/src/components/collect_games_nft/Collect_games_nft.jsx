import React from "react";
import Game_NFT_Collect_Explorer from "./Game_NFT_Collect_Explorer";

function Collect_games_nft() {
  return (
    <>
      <div className="flex flex-col  mt-22">
        <div className="relative">
          <img
            src="https://cdna.artstation.com/p/assets/images/images/078/947/336/large/ocellus-services-screen3.jpg?1723532283"
            className="w-full h-[150px] object-cover"
          />
          <div className="w-full h-[150px] bg-gradient-to-r from-black to-transparent absolute top-0 left-0"></div>
          <h1 className="absolute left-5 bottom-5 text-7xl text-blue-500 font-bold ">
            GRAB THE BEST GAME DEALS!
          </h1>
          <h1 className="absolute left-6 bottom-5 text-7xl text-yellow-400 font-bold ">
            GRAB THE BEST GAME DEALS!
          </h1>
        </div>
        <Game_NFT_Collect_Explorer />
      </div>
    </>
  );
}

export default Collect_games_nft;
