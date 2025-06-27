import React from "react";
import {
  ShoppingCart,
  CheckCircle2,
  LoaderCircle,
  Tag,
  Library,
} from "lucide-react";
import { formatEther } from "viem";
import { useNavigate } from "react-router-dom";
import gameInstanceAbi from "../ABI/game_instance.json";
import { useAccount, useReadContract } from "wagmi";

const availableGenres = ["Action", "RPG", "Strategy"];

export default function Game_NFT_COLLECT_CARD({
  game,
  onBuyGame,
  isPurchasePending,
}) {
  const navigate = useNavigate();
  const account = useAccount();

  const {
    contractAddress,
    name: gameName,
    imageUrl,
    soldCopies,
    totalCopies,
    price,
    isMetadataLoaded,
    type,
    usdPrice,
  } = game || {};

  // This hook correctly fetches if the connected user owns this specific game
  const { data: hasBoughtGame } = useReadContract({
    address: contractAddress,
    abi: gameInstanceAbi,
    functionName: "gameOwnership",
    args: [account.address],
    // Only run the query when we have the necessary data and the user is connected
    query: { enabled: !!contractAddress && !!account.address },
  });

  if (!isMetadataLoaded) {
    return (
      <div className="relative w-[300px] h-[400px] bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>
    );
  }

  const sold = Number(soldCopies);
  const total = Number(totalCopies);
  const isSoldOut = total > 0 ? sold >= total : false;
  const soldPercentage = total > 0 ? (sold / total) * 100 : 0;

  const formattedPrice =
    price !== undefined && price !== null ? `${price} ETH` : "N/A";

  const displayUsdPrice = usdPrice
    ? `($${usdPrice.dollars}.${usdPrice.cents.toString().padStart(2, "0")})`
    : "";

  const gameGenres = type?.map((t) => availableGenres[t]).filter(Boolean) || [];

  const handleBuyClick = (e) => {
    e.stopPropagation();
    // Add the !hasBoughtGame check to prevent re-buying
    if (!isSoldOut && !isPurchasePending && price > 0 && !hasBoughtGame) {
      onBuyGame(contractAddress, price);
    }
  };

  const handleCardClick = () => {
    navigate(`/collect-game-nft/game/${contractAddress}`);
  };

  // UPDATED: Button logic now correctly checks for ownership first
  const isButtonDisabled = isSoldOut || isPurchasePending || hasBoughtGame;
  let buttonContent;

  if (hasBoughtGame) {
    buttonContent = (
      <>
        <Library size={10} />
        <span>In Library</span>
      </>
    );
  } else if (isSoldOut) {
    buttonContent = (
      <>
        <CheckCircle2 size={10} />
        <span>Sold Out</span>
      </>
    );
  } else if (isPurchasePending) {
    buttonContent = (
      <>
        <LoaderCircle size={10} className="animate-spin" />
        <span>Processing...</span>
      </>
    );
  } else {
    buttonContent = (
      <>
        <ShoppingCart size={10} />
        <span>Buy Now</span>
      </>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="relative w-[300px] h-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden group"
    >
      <img
        alt={gameName || "Game"}
        src={imageUrl || "/placeholder.png"}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-all duration-500"></div>
      <div className="absolute inset-0 p-4 flex flex-col justify-end text-white bg-gradient-to-t from-black/95 via-black/80 to-transparent transform translate-y-36 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-10 cursor-pointer">
        <div>
          <h2
            className="text-2xl font-bold tracking-wide text-slate-50 truncate"
            title={gameName}
          >
            {gameName || "Untitled Game"}
          </h2>
          <p
            className="font-mono text-xs text-slate-400 break-all truncate"
            title={contractAddress}
          >
            {contractAddress}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 mt-4">
          {gameGenres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {gameGenres.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-gray-700/80 text-gray-300 rounded-full"
                >
                  <Tag size={10} /> {genre}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Sold</span>
            <span>
              {sold.toString()} / {total.toString()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-xs text-slate-400">Price</p>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold">{formattedPrice}</p>
                <p className="text-xs text-slate-400">{displayUsdPrice}</p>
              </div>
            </div>
            <button
              onClick={handleBuyClick}
              disabled={isButtonDisabled}
              className={`px-4 py-2 cursor-pointer rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 border-2 ${
                isButtonDisabled
                  ? "bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-white/90 border-white text-black hover:bg-white"
              }`}
            >
              {buttonContent}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
