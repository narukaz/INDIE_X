import React, { useEffect, useState } from "react";
import { Hourglass, UserCircle, Gem, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import gameinstanceabi from "../ABI/game_instance.json"; // Re-importing the ABI for the internal call

const skinTypeInfo = {
  0: {
    name: "Common",
    style: "border-slate-600 bg-slate-800/80 text-slate-300",
    icon: <Shield size={12} />,
  },
  1: {
    name: "Rare",
    style: "border-amber-600 bg-amber-900/70 text-amber-300",
    icon: <Gem size={12} />,
  },
  2: {
    name: "Legendary",
    style: "border-orange-500 bg-orange-900/70 text-orange-300",
    icon: <Gem size={12} className="text-orange-400" />,
  },
};

const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endTime || endTime <= 0) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime() / 1000;
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (60 * 60 * 24));
        const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);

        let timeLeftString = "";
        if (days > 0) timeLeftString += `${days}d `;
        if (hours > 0) timeLeftString += `${hours}h `;
        if (minutes > 0) timeLeftString += `${minutes}m`;

        setTimeLeft(timeLeftString.trim() || "Ending soon");
      } else {
        setTimeLeft("Expired");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 30);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-800 z-20">
      <Clock size={12} />
      <span>{timeLeft}</span>
    </div>
  );
};

function NFT_explore_Card({ nftData, onRentClick }) {
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();

  const {
    cid,
    contract,
    currentOwner,
    price,
    skinType,
    tokenId,
    usdPrice,
    gameName,
  } = nftData || {};

  const { data: rentalData } = useReadContract({
    address: contract,
    abi: gameinstanceabi,
    functionName: "getRentalTimeDetails",
    args: [tokenId],
    query: { enabled: !!contract && tokenId !== undefined },
  });

  const isOwnedByMe =
    connectedAddress &&
    currentOwner &&
    currentOwner.toLowerCase() === connectedAddress.toLowerCase();

  // UPDATED: The rental status is now determined by the correct array index
  const isRentalActive = rentalData?.[2] || false;
  const rentalEndTime = rentalData
    ? Number(rentalData[0]) + Number(rentalData[1])
    : 0;

  const gatewayURL = "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
  const imageUrl = cid
    ? `${gatewayURL}${cid}`
    : "https://via.placeholder.com/300x400";
  const displayPrice = price ? formatEther(BigInt(price)) : "0";
  const displayUsdPrice = usdPrice
    ? `$${usdPrice.dollars}.${usdPrice.cents.toString().padStart(2, "0")}`
    : "...";

  const typeInfo = skinTypeInfo[skinType] || {
    name: "Unknown",
    style: "border-gray-500",
    icon: <Shield size={12} />,
  };
  const displayTokenId = tokenId ? tokenId.toString() : "N/A";

  const handleCardClick = () => {
    navigate(`/trade-nft/details/${contract}/${displayTokenId}`);
  };

  const handleRentButtonClick = (e) => {
    e.stopPropagation();
    onRentClick(nftData);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-72 border hover:border-white h-96 bg-slate-900 rounded-2xl cursor-pointer border-slate-800 group transition-all duration-300 hover:shadow-2xl overflow-hidden"
    >
      {/* Display the countdown timer if the rental is active */}
      {isRentalActive && <CountdownTimer endTime={rentalEndTime} />}

      <div className="absolute -inset-2 bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 overflow-hidden"></div>
      <img
        alt={`Skin #${displayTokenId}`}
        src={imageUrl}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 overflow-hidden"
      />
      <div
        className="absolute inset-x-0 bottom-0 p-5 pt-16 text-white bg-black/40 backdrop-blur-lg border-t border-white/10
        transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out rounded-b-2xl overflow-hidden"
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 overflow-hidden">
          <p
            className="text-sm font-semibold text-amber-300 truncate"
            title={gameName || "Game"}
          >
            {gameName || "Loading game..."}
          </p>
          <h3 className="text-2xl font-bold leading-tight truncate">
            Skin #{displayTokenId}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 border overflow-hidden rounded-full ${typeInfo.style}`}
            >
              {typeInfo.icon}
              <span>{typeInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <UserCircle size={16} />
              <span className="text-xs font-mono">
                {formatAddress(currentOwner)}
              </span>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[10px] text-slate-400">Listing Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold">{displayPrice} ETH</p>
              <p className="text-xs text-slate-400">({displayUsdPrice})</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
            {/* UPDATED: The button is no longer disabled if rented, only if owned by me */}
            {!isOwnedByMe && (
              <button
                onClick={handleRentButtonClick}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 hover:bg-white hover:scale-105"
              >
                Request Rent
                <Hourglass size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NFT_explore_Card;
