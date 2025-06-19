// an image to nft,
// time left tag for Nft to be returned
// Nft address
// Nft ownership tag = [rented, owned]
// price rented for
// Nft name
//NFT description
//Game name

import {
  BanknoteArrowUp,
  Copy,
  Crown,
  Gamepad2,
  Network,
  Timer,
} from "lucide-react";

import BoltSvg from "../../assets/Bolt.svg";
import RewardSvg from "../../assets/Reward.svg";

function NFTCard_Rented({
  NFT_Chain,
  NFT_Image,
  NFT_Name,
  NFT_Till,
  NFT_Description,
  NFT_Address,
  NFT_Owner,
  NFT_Ownership_type,
  NFT_Origin_game,
  NFT_Price,
  XP_Boost,
  Extra_Rewards,
}) {
  return (
    <div
      className="rounded-2xl bg-gradient-to-b from-[#0E1420] to-[#121926]
                 max-w-[400px] aspect-[9.5/12.5] p-1 flex flex-col items-start
                 border border-solid border-blue-300 overflow-hidden "
    >
      {/* ── This is the FIRST nested div: it’s the positioning context */}
      <div
        className="relative w-full h-full p-[2px] rounded-t-xl
                   bg-gradient-to-b from-[#76e6ff] via-[#00a9ce0d] to-transparent
                   overflow-hidden"
      >
        {/* NFT Image */}
        <div className="absolute top-5 left-5 bg-blue-950/50 px-2 py-1 flex items-center gap-2 rounded-2xl">
          <Timer color="#47c8ff" strokeWidth={2} size={20} />
          <p className="text-[#47c8ff] ">time left: {NFT_Till}</p>
        </div>

        <div className="absolute top-5 right-5 bg-blue-500 px-3 py-1 flex items-center gap-2 rounded-2xl">
          {/* <Timer color="#47c8ff" strokeWidth={2} size={20} /> */}
          <p className="text-white select-none"> {NFT_Ownership_type}</p>
        </div>

        <img
          src={NFT_Image}
          alt={NFT_Name}
          className="w-full h-full object-cover rounded-t-xl block"
        />

        {/* ── Overlay: absolutely locked to the div above */}
        <div
          className="absolute right-0 w-full h-full
                     bg-gradient-to-b from-transparent to-gray-800 hover:to-gray-950
                     transition-all duration-300
                     flex flex-col justify-end
                     gap-2 p-6 hover:bottom-0 -bottom-48
                     "
        >
          <h1 className="text-white font-bold text-2xl">{NFT_Name}</h1>
          <h2 className="text-[#94a7c6] font-normal text-[16px] uppercase select-none">
            {NFT_Description}
          </h2>
          <div className="flex justify-start items-center gap-3 mt-7 ">
            <img src={BoltSvg} className="w-5 h-5" />
            <p className="text-white font-normal select-none">{XP_Boost} Xps</p>
            <span className="text-gray-500"> + </span>
            <img src={RewardSvg} className="w-5 h-5 select-none" />
            <p className="text-white font-normal">{Extra_Rewards} Rewards</p>
          </div>

          <div className="flex flex-col items-start w-full  justify-start gap-2 px-2 py-1 bg-white text-gray-700 rounded-2xl font-normal select-none">
            <div className="flex items-center gap-2">
              <Crown color="#000000" strokeWidth={1} size={16} />
              <p className="font-thin">
                {"owner: "}{" "}
                {NFT_Owner?.slice(0, 5) + "....." + NFT_Owner?.slice(-5)}
              </p>
              <Copy
                strokeWidth={1}
                size={16}
                className="cursor-pointer hover:scale-110 transition-all text-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <Gamepad2 color="#000000" strokeWidth={1} size={18} />
              <p className="font-thin">
                {"Game: "}
                {NFT_Origin_game}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BanknoteArrowUp color="#000000" strokeWidth={1} size={18} />
              <p className="font-thin">
                "{"Rented_for: "}
                {NFT_Price}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Network color="#000000" strokeWidth={1} size={18} />

              <p className="font-thin">
                {"Chain: "}
                {NFT_Chain}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── This lives in the grandparent, but has no relative on it */}
      <p
        className="mt-2 w-full flex items-center justify-center gap-2 text-gray-700 text-[10px] cursor-pointer p-1
      hover:text-gray-400 py-2
      "
      >
        <span>NFT_address: {NFT_Address}</span>
        <Copy size={10} className="cursor-pointer" />
      </p>
    </div>
  );
}

export default NFTCard_Rented;
