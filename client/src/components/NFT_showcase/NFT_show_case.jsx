import React from "react";

import { Boxes, ChevronRight, Flame, Image } from "lucide-react";
import NFT_CARD from "../NFT_Card/NFT_CARD";

function NFT_show_case() {
  return (
    <div className="h-[500px]  flex flex-col gap-9 px-6 py-8 relative ">
      {/* title */}
      <h1 className="pl-12 hover:pl-20 pr-5 bg-white  w-max py-3 rounded-3xl  text-2xl  text-black font-bold flex items-center gap-3 hover:text-blue-400 cursor-pointer select-none group transition-all">
        <Flame
          size={30}
          className=" text-black transition-all ease-out group-hover:text-blue-500"
        />{" "}
        Trending NFT's
        <span>
          <ChevronRight size={20} className="group-hover:ml-7 transition-all" />
        </span>
      </h1>
      <div className="grid grid-cols-3 space-y-4 ">
        <NFT_CARD
          NFT_Chain={"arbitrum"}
          NFT_Image={
            "https://cdna.artstation.com/p/assets/images/images/037/450/766/large/dao-trong-le-dancing-droplet.jpg?1620400650"
          }
          NFT_Name={"Legend of runettra"}
          NFT_Till={"43:25:00"}
          NFT_Description={
            "“Vaulted Ember Dragon” — a legendary NFT embodying fiery mystique and digital rarity."
          }
          NFT_Address={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Owner={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Ownership_type={"Rented"}
          NFT_Origin_game={"Runnetra"}
          NFT_Price={4345346}
          XP_Boost={2}
          Extra_Rewards={1}
        />
        <NFT_CARD
          NFT_Chain={"arbitrum"}
          NFT_Image={
            "https://cdna.artstation.com/p/assets/images/images/037/450/766/large/dao-trong-le-dancing-droplet.jpg?1620400650"
          }
          NFT_Name={"Legend of runettra"}
          NFT_Till={"43:25:00"}
          NFT_Description={
            "“Vaulted Ember Dragon” — a legendary NFT embodying fiery mystique and digital rarity."
          }
          NFT_Address={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Owner={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Ownership_type={"Rented"}
          NFT_Origin_game={"Runnetra"}
          NFT_Price={4345346}
          XP_Boost={2}
          Extra_Rewards={1}
        />
        <NFT_CARD
          NFT_Chain={"arbitrum"}
          NFT_Image={
            "https://cdna.artstation.com/p/assets/images/images/037/450/766/large/dao-trong-le-dancing-droplet.jpg?1620400650"
          }
          NFT_Name={"Legend of runettra"}
          NFT_Till={"43:25:00"}
          NFT_Description={
            "“Vaulted Ember Dragon” — a legendary NFT embodying fiery mystique and digital rarity."
          }
          NFT_Address={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Owner={"0xD4CA2F6B7E8C9A1D0B2E3F4C5D6E7A8B9C0D1E2"}
          NFT_Ownership_type={"Rented"}
          NFT_Origin_game={"Runnetra"}
          NFT_Price={4345346}
          XP_Boost={2}
          Extra_Rewards={1}
        />
      </div>
    </div>
  );
}

export default NFT_show_case;
