import { Gamepad2, Pen, Star } from "lucide-react";
import React from "react";
import Game_specific_hardcoded_nft_explorer from "../HardCoded/Game_specific_hardcoded_nft_explorer";

function Game_screen({ Game_Title, Game_Rating }) {
  return (
    <div className="flex flex-col  w-full ">
      <div className="h-[450px] relative" aria-label="this is for image">
        <img
          className="object-cover h-full w-full"
          src={
            "https://cdnb.artstation.com/p/assets/images/images/088/701/347/large/sescoh-a-1.jpg?1748966653"
          }
        />
        <div className="flex w-full px-12 gap-5 absolute bottom-12 left-12 z-1 items-center">
          <h1 className="font-bold text-6xl text-white  ">
            {Game_Title || "The Game"}
          </h1>

          <div
            className="self-end mb-2 flex items-center gap-2
          "
          >
            <Star size={20} color="#12824e" strokeWidth={1} />
            <p className="text-[#12824e]">{(Game_Rating || 0) + " Rating"}</p>
          </div>
        </div>

        <div
          className="absolute top-0 w-1/2
         h-full bg-gradient-to-r from-black to-transparent"
        ></div>
        <div
          className="absolute bottom-0 w-full h-1/2
      bg-gradient-to-t from-black to-transparent"
        ></div>
      </div>

      <div
        className="flex w-full gap-4 px-8 bg-black py-12 "
        aria-details="this is button section"
      >
        <button className="bg-blue-500 w-1/2 hover:bg-blue-600 font-regular text-white py-4 px-5 flex gap-2 items-center rounded-xl cursor-pointer">
          <Gamepad2 size={20} />
          Buy Game
        </button>
        <button className="bg-gray-200 w-1/2 hover:bg-gray-400 font-regular text-black py-4 px-5 flex gap-2 items-center rounded-xl cursor-pointer">
          <Pen size={20} /> Write a review
        </button>
      </div>
      <Game_specific_hardcoded_nft_explorer />

      <div
        className="flex flex-col gap-8 px-8 py-3"
        aria-details="this is for title of the game"
      >
        {/* this is going to be mapped */}
        <div className="flex flex-col gap-3">
          <h1 className="text-white font-semibold text-5xl">Introduction</h1>
          <h3 className="text-xl text-white">
            In the heart of a crumbling kingdom, a lone warrior rises to restore
            balance. Armed with ancient relics and mysterious powers, they
            journey through cursed lands. Each level brings deadlier foes and
            forgotten secrets buried in shadows. With every victory, the
            darkness retreats—but the final evil awaits. Only the brave can
            survive this game of fate and fire.
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-white font-semibold text-5xl">Overview</h1>
          <h3 className="text-xl text-white">
            In the heart of a crumbling kingdom, a lone warrior rises to restore
            balance. Armed with ancient relics and mysterious powers, they
            journey through cursed lands. Each level brings deadlier foes and
            forgotten secrets buried in shadows. With every victory, the
            darkness retreats—but the final evil awaits. Only the brave can
            survive this game of fate and fire.
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Game_screen;
