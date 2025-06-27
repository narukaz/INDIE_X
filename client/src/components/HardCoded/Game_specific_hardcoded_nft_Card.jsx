import React, { useState, useEffect } from "react";
import {
  Wallet,
  Hourglass,
  Users,
  Info,
  FileText,
  Gem,
  Shield,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Crown,
} from "lucide-react";
import { formatEther } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import gameinstanceabi from "../ABI/game_instance.json";

// --- Helper Objects & Functions (No Changes) ---
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
      const now = new Date().getTime();
      const difference = endTime * 1000 - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Expired");
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
      <Clock size={14} />
      <span>{timeLeft}</span>
    </div>
  );
};

// --- The Main Card Component ---
function Game_specific_hardcoded_nft_Card({
  contractAddress,
  tokenId,
  cid,
  price,
  skinType,
  currentOwner,
  instanceOwner,
  isRentalActive,
  rentalRequestCount,
  gameCid,
  usdPrice, // Accept the new prop
}) {
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const [notification, setNotification] = useState(null);
  const [gameName, setGameName] = useState("Loading Game...");

  const { data: rentalData } = useReadContract({
    address: contractAddress,
    abi: gameinstanceabi,
    functionName: "rentals",
    args: [BigInt(tokenId)],
    enabled: isRentalActive,
  });

  const rentalEndTime = rentalData
    ? Number(rentalData.startTime) + Number(rentalData.duration)
    : 0;

  useEffect(() => {
    if (!gameCid) {
      setGameName("Unknown Game");
      return;
    }
    const fetchGameName = async () => {
      try {
        const response = await fetch(
          `https://cyan-realistic-swift-995.mypinata.cloud/ipfs/${gameCid}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const metadata = await response.json();
        setGameName(metadata.name || "Untitled Game");
      } catch (error) {
        setGameName("Unknown Game");
      }
    };
    fetchGameName();
  }, [gameCid]);

  useEffect(() => {
    let timer;
    if (isPending)
      setNotification({
        type: "info",
        message: "Please confirm in your wallet...",
        icon: <LoaderCircle className="animate-spin" />,
      });
    else if (isConfirming)
      setNotification({
        type: "info",
        message: "Purchasing... Please wait.",
        icon: <LoaderCircle className="animate-spin" />,
      });
    else if (isConfirmed)
      setNotification({
        type: "success",
        message: "Purchase Successful!",
        icon: <CheckCircle2 />,
      });
    else if (writeError)
      setNotification({
        type: "error",
        message: writeError.shortMessage || "Transaction failed.",
        icon: <XCircle />,
      });
    if (isConfirmed || writeError)
      timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [isPending, isConfirming, isConfirmed, writeError]);

  const handleBuyClick = (e) => {
    e.stopPropagation();
    writeContract({
      address: contractAddress,
      abi: gameinstanceabi,
      functionName: "buySkin",
      args: [BigInt(tokenId)],
      value: BigInt(price),
    });
  };

  const gatewayURL = "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
  const imageUrl = cid
    ? `${gatewayURL}${cid}`
    : "https://via.placeholder.com/300x400";
  const displayPrice = price ? formatEther(BigInt(price)) : "0";
  // NEW: Format the USD price for display
  const displayUsdPrice = usdPrice
    ? `$${usdPrice.dollars}.${usdPrice.cents.toString().padStart(2, "0")}`
    : "...";

  const typeInfo = skinTypeInfo[skinType] || {
    name: "Unknown",
    style: "border-gray-500 bg-gray-800/80 text-gray-300",
    icon: <Shield size={12} />,
  };
  const isForSale = price > 0;
  const isOwnedByPlayer =
    currentOwner &&
    instanceOwner &&
    currentOwner.toLowerCase() !== instanceOwner.toLowerCase();
  const isButtonDisabled =
    !isForSale ||
    isRentalActive ||
    isPending ||
    isConfirming ||
    instanceOwner != currentOwner;
  let buttonText = "Buy Now";
  let buttonTitle = "";
  if (isRentalActive) {
    buttonText = "Currently Rented";
    buttonTitle = "This NFT is currently rented and cannot be bought.";
  } else if (!isForSale) {
    buttonText = "Not for Sale";
    buttonTitle = "This NFT is not currently listed for sale.";
  } else if (isOwnedByPlayer) {
    buttonText = "Not for Sale";
    buttonTitle =
      "This item is owned by a player and not for sale from the developer.";
  }
  const notificationStyles = {
    info: "bg-slate-700/80 border-slate-500 text-slate-200",
    success: "bg-emerald-600/80 border-emerald-500 text-white",
    error: "bg-red-600/80 border-red-500 text-white",
  };

  return (
    <div className="relative w-[300px] border hover:border-white h-[400px] bg-slate-950 rounded-2xl overflow-hidden group">
      <img
        alt={gameName}
        src={imageUrl}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-transparent group-hover:bg-amber-900/20 transition-all duration-500"></div>
      <div className="absolute top-4 right-4 group/info z-40">
        <Info
          size={18}
          className="text-white/70 hover:text-white cursor-pointer"
        />
        <div className="absolute top-12 right-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none">
          <p className="font-bold text-white mb-2">NFT Status Guide</p>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2">
              <Crown size={14} className="mt-0.5 text-amber-400" />
              <span>Owned by the game developer.</span>
            </li>
            <li className="flex items-start gap-2">
              <Users size={14} className="mt-0.5 text-sky-400" />
              <span>Owned by a player.</span>
            </li>
            <li className="flex items-start gap-2">
              <Tag size={14} className="mt-0.5 text-slate-400" />
              <span>Not currently listed for sale (Price is 0).</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 text-amber-400" />
              <span>Actively being rented by a player.</span>
            </li>
          </ul>
        </div>
      </div>
      {notification && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%] z-30 transition-all duration-300 ease-in-out ${
            notification
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 pointer-events-none"
          }`}
        >
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
              notificationStyles[notification.type]
            }`}
          >
            {notification.icon} <span>{notification.message}</span>
          </div>
        </div>
      )}
      <div className="absolute inset-0 p-4 flex flex-col justify-end text-white bg-gradient-to-t from-black/95 via-black/80 to-transparent transform translate-y-36 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-10">
        <div className="flex justify-between items-baseline">
          <h2
            className="text-xl font-bold tracking-wide text-slate-50 truncate"
            title={gameName}
          >
            {gameName}
          </h2>
          <span className="font-mono text-xs text-slate-400 flex-shrink-0">
            #{tokenId.toString()}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
          <div className="flex items-center justify-between mt-3 h-6">
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 border rounded-full ${typeInfo.style}`}
            >
              {typeInfo.icon}
              <span>{typeInfo.name}</span>
            </div>
            {isRentalActive ? (
              <CountdownTimer endTime={rentalEndTime} />
            ) : isOwnedByPlayer ? (
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold bg-sky-900/70 border border-sky-700 px-3 py-1 rounded-full">
                <Users size={14} />
                <span>Player Owned</span>
              </div>
            ) : !isForSale ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full">
                <Tag size={14} />
                <span>Not Listed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold bg-amber-900/70 border border-amber-700 px-3 py-1 rounded-full">
                <Crown size={14} />
                <span>Developer Owned</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-end mt-3">
            <div>
              <p className="text-[10px] text-slate-400">Price</p>
              {/* UPDATED: Price section now shows both ETH and USD */}
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold">{displayPrice} ETH</p>
                <p className="text-xs text-slate-400">({displayUsdPrice})</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 text-right">Owner</p>
              <p className="font-mono text-xs">{formatAddress(currentOwner)}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText size={14} />
              <p className="font-mono text-[10px]">
                {formatAddress(contractAddress)}
              </p>
            </div>
          </div>
          <button
            onClick={handleBuyClick}
            disabled={isButtonDisabled}
            title={buttonTitle}
            className={`w-full mt-3 flex items-center justify-center gap-2 border-2 font-bold py-2.5 rounded-lg transition-all duration-300 ${
              isButtonDisabled
                ? "bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-transparent border-slate-300 text-slate-50 hover:bg-slate-50 hover:text-slate-900 hover:border-white"
            }`}
          >
            {isPending ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                <span>Confirm...</span>
              </>
            ) : isConfirming ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                <span>Purchasing...</span>
              </>
            ) : isConfirmed ? (
              <>
                <CheckCircle2 size={18} />
                <span>Purchased!</span>
              </>
            ) : (
              <>
                <Wallet size={18} /> <span>{buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Game_specific_hardcoded_nft_Card;
