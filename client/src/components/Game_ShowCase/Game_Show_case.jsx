import React from "react";

import {
  Boxes,
  ChevronRight,
  Flame,
  Image,
  LucideGamepad2,
} from "lucide-react";
import NFTGamesCard from "../game_card/NFTGamesCard";
import { useNavigate } from "react-router-dom";

function Game_Show_case() {
  let navigate = useNavigate();
  return (
    <div className="relative w-full  flex flex-col gap-9 px-6 py-8 mt-[200px] ">
      {/* title */}
      <h1
        onClick={() => {
          navigate("/home/explore_trending_game_nft");
        }}
        className="pl-12 hover:pl-20 pr-5 bg-white  w-max py-3 rounded-3xl  text-2xl  text-black font-bold flex items-center gap-3 hover:text-blue-400 cursor-pointer select-none group transition-all"
      >
        <LucideGamepad2 className="text-black transition-all ease-out group-hover:text-blue-500" />{" "}
        Trending Game's
        <span>
          <ChevronRight size={20} className="group-hover:ml-7 transition-all" />
        </span>
      </h1>
      <div className="flex w-full gap-5 ">
        <NFTGamesCard NFT_Game_type={["mmorpg,arcade,action"]} />
        <NFTGamesCard NFT_Game_type={["mmorpg,arcade,action"]} />
        <NFTGamesCard NFT_Game_type={["mmorpg,arcade,action"]} />
        <NFTGamesCard NFT_Game_type={["mmorpg,arcade,action"]} />
      </div>
    </div>
  );
}

export default Game_Show_case;
