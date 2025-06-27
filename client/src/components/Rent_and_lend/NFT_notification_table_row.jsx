// NFT_notification_table_row.jsx
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import gameinstanceabi from "../ABI/game_instance.json";
import { CheckCircle2, LoaderCircle } from "lucide-react";

const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

function NFT_notification_table_row({
  requestData,
  requestIndex,
  tokenId,
  contractAddress,
  nftOwner, // <-- NEW PROP
  isNftRented,
}) {
  const { address: connectedAddress } = useAccount();
  const { requester, price, duration } = requestData;

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [statusText, setStatusText] = useState("Accept");

  // === OWNERSHIP CHECK ===
  // Check if the connected wallet is the owner of the NFT.
  const isOwner = connectedAddress?.toLowerCase() === nftOwner?.toLowerCase();

  useEffect(() => {
    if (isPending) setStatusText("Confirm...");
    else if (isConfirming) setStatusText("Accepting...");
    else if (isConfirmed) setStatusText("Accepted");
    else if (error) setStatusText("Error");
    else setStatusText("Accept");
  }, [isPending, isConfirming, isConfirmed, error]);

  const handleAcceptOffer = () => {
    writeContract({
      address: contractAddress,
      abi: gameinstanceabi,
      functionName: "approveRequest",
      args: [BigInt(tokenId), BigInt(requestIndex)],
    });
  };

  // The button is now also disabled if the connected user is not the owner.
  const isButtonDisabled =
    isNftRented || !isOwner || isPending || isConfirming || isConfirmed;
  const buttonTitle = !isOwner ? "Only the NFT owner can accept offers" : "";

  return (
    <div className="grid grid-cols-5 gap-5 text-white border-b border-b-gray-700 py-3 w-full items-center px-4 hover:bg-slate-800/50 transition-colors duration-200">
      <p
        className="border-r border-r-gray-600 pr-4 font-mono text-slate-300"
        title={requester}
      >
        {formatAddress(requester)}
      </p>
      <p className="border-r border-r-gray-600 px-4 font-semibold">
        {formatEther(price)} ETH
      </p>
      <p className="border-r border-r-gray-600 px-4 text-slate-300">
        {formatDuration(duration)}
      </p>
      <p className="border-r border-r-gray-600 px-4 text-slate-400">29 days</p>
      <div className="px-4 flex justify-center">
        {/* === UPDATED BUTTON LOGIC AND STYLING === */}
        <button
          onClick={handleAcceptOffer}
          disabled={isButtonDisabled}
          title={buttonTitle}
          className={`w-32 h-10 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-all duration-300 ${
            isButtonDisabled
              ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              : "bg-black text-white border border-slate-500 hover:bg-white hover:text-black"
          }`}
        >
          {isPending && <LoaderCircle size={16} className="animate-spin" />}
          {isConfirming && <LoaderCircle size={16} className="animate-spin" />}
          {isConfirmed && <CheckCircle2 size={16} className="text-green-500" />}
          <span>{statusText}</span>
        </button>
      </div>
    </div>
  );
}

export default NFT_notification_table_row;
