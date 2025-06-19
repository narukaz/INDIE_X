import React from "react";
import { useNavigate } from "react-router-dom";

function NFTGamesCard({ NFT_Game, NFT_Game_type }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/collect-game-nft/game")}
      className="
   relative group transform transition-transform duration-300 ease-out
               hover:scale-105 hover:-translate-y-3
                bg-gradient-to-b from-[#647da0] to-[#253141]
              px-[2px] py-[2px]
              max-w-[250px] aspect-[7/9] rounded-2xl cursor-pointer
    "
    >
      <div className="bg-[#1F2937] w-[100%] h-[100%] rounded-2xl px-2 py-2 flex flex-col gap-4 items-center ">
        <img
          className="object-cover rounded-xl overflow-hidden  aspect-square group-hover:scale-105 transition-all"
          src={
            "https://cdnb.artstation.com/p/assets/images/images/041/479/085/large/daniel-lieske-boundless-covercrop.jpg?1631805984"
          }
        />
        <div className="flex flex-col justify-center items-center group-hover:scale-110 transition-all ">
          <h3 className="font-bold text-xl text-white select-none">
            {NFT_Game}
          </h3>
          <div className="flex gap-1 text-[#8485be]">
            {NFT_Game_type?.map((item, index) => (
              <p
                className="font-light text-[10px] hover:underline hover:text-[#cacaca]"
                id={index}
              >
                {item}
                {index < NFT_Game_type?.length - 1 ? "," : ""}
              </p>
            ))}
          </div>
          <h1 className="font-bold text-white text-2xl select-none">
            Game name
          </h1>
        </div>
      </div>
    </div>
  );
}
export default NFTGamesCard;
