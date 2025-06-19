import React, { useState } from "react";
import NFTDetails from "./NFT_Details";
import {
  ArrowRightCircle,
  ChevronDown,
  CornerDownLeft,
  XIcon,
} from "lucide-react";
import NFTMetadataToggle from "./NFT_metadata_toggle";
import NFT_Make_offer from "./NFT_Make_offer";
import NFTGameOriginRow from "./NFT_game_origin_row";
import Make_Offer_popup from "./Make_Offer_popup";
import Lend_request_popup from "./Lend_request_popup";
import NFT_Notification_action_table from "./NFT_Notification_action_table";

function Rent_and_Lend() {
  const [isMakeOffer, setIsMakeOffer] = useState(false);
  const [isLendOffer, setIsLendOffer] = useState(false);

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
      {isMakeOffer && (
        <Make_Offer_popup
          NFT_data={exampleNFT}
          setIsMakeOffer={setIsMakeOffer}
        />
      )}

      {isLendOffer && (
        <Lend_request_popup
          NFT_data={exampleNFT}
          setIsLendOffer={setIsLendOffer}
        />
      )}

      {/* above is popup */}
      <div className="flex flex-col gap-3 mt-23 w-full">
        <div className="flex gap-4 px-20 py-8">
          <img
            src={undefined}
            alt="NFT image"
            className="rounded-xl bg-red-400 px-5 w-[900px] h-[500px]"
          />
          <div className="flex flex-col gap-5 w-full">
            <NFT_Make_offer
              setIsMakeOffer={setIsMakeOffer}
              setIsLendOffer={setIsLendOffer}
            />
            <NFTMetadataToggle />
            <NFTGameOriginRow />
          </div>
        </div>
        <NFT_Notification_action_table />
      </div>
    </>
  );
}

export default Rent_and_Lend;
