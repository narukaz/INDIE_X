import React, { useState, useEffect } from "react";
import {
  ArrowRightCircle,
  CornerDownLeft,
  XIcon,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import gameinstanceabi from "../ABI/game_instance.json";

// Helper function to format long wallet addresses (No change needed)
const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

function Make_Offer_popup({ NFT_data, setIsMakeOffer }) {
  // --- *** THE FIX IS HERE *** ---
  // We now correctly destructure 'contractAddress' directly, as that is the key
  // being passed in the NFT_data prop.
  console.log(NFT_data);
  const {
    contract,
    contractAddress, // Correctly reads the 'contractAddress' property.
    tokenId,
    gameCid,
    currentOwner,
  } = NFT_data || {};

  // === STATE FOR FORM INPUTS ===
  const [price, setPrice] = useState("");
  const [durationInMinutes, setDurationInMinutes] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // === WAGMI HOOKS FOR TRANSACTION ===
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Effect to manage user feedback based on transaction status
  useEffect(() => {
    if (isPending) {
      setTxStatus("Waiting for confirmation in your wallet...");
    } else if (isConfirming) {
      setTxStatus("Sending your rental request, please wait...");
    } else if (isConfirmed) {
      setTxStatus("Success! Your rental request has been sent.");
      setTimeout(() => setIsMakeOffer(false), 3000);
    } else if (writeError) {
      // Provide more helpful error messages
      const message = writeError.shortMessage || writeError.message;
      if (message.includes("User denied transaction")) {
        setTxStatus("Transaction rejected in wallet.");
      } else {
        setTxStatus(`Error: ${message}`);
      }
    }
  }, [isPending, isConfirming, isConfirmed, writeError, setIsMakeOffer]);

  const handleMakeOfferClick = () => {
    // Clear previous status messages before starting
    setTxStatus("");

    // Basic validation
    if (
      !price ||
      !durationInMinutes ||
      parseFloat(price) <= 0 ||
      parseInt(durationInMinutes) <= 0
    ) {
      setTxStatus("Error: Please enter a valid price and duration.");
      setTimeout(() => setTxStatus(""), 4000);
      return;
    }

    // Convert inputs to the format the contract expects
    const durationInSeconds = BigInt(parseInt(durationInMinutes, 10) * 60);
    const priceInWei = parseEther(price);

    // Call the smart contract function. Now 'contractAddress' will be a valid address.
    writeContract({
      address: contractAddress || contract,
      abi: gameinstanceabi,
      functionName: "requestRent",
      args: [BigInt(tokenId), durationInSeconds],
      value: priceInWei,
    });
  };

  const isButtonDisabled = isPending || isConfirming;

  return (
    <div className="fixed left-0 top-0 w-full h-[100%] backdrop-blur-sm z-30 flex items-center justify-center">
      <div className="w-[600px] h-auto bg-[#171c25] relative border border-gray-500 rounded-2xl shadow-md px-9 py-8 overflow-hidden">
        <XIcon
          onClick={() => !isButtonDisabled && setIsMakeOffer(false)}
          className={`absolute right-5 top-5 text-white transition-all hover:rotate-180 ${
            isButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1
              className="font-bold text-2xl text-white truncate"
              title={gameCid}
            >
              Offer for: Skin #
              {NFT_data.tokenId ? NFT_data.tokenId.toString() : "N/A"}
            </h1>
          </div>
          <div className="text-gray-700 mx-auto truncate">
            ______________________________________________________________
          </div>

          <div className="flex flex-col gap-2">
            {/* --- PRICE INPUT --- */}
            <h1 className="font-bold text-white text-xl flex gap-3 py-2">
              Price
              <CornerDownLeft
                className="-rotate-90 self-end"
                color="#4a5565"
                strokeWidth={0.75}
              />
            </h1>
            <div className="flex border border-gray-400 px-5 py-4 rounded-2xl overflow-hidden">
              <input
                type="number"
                className="w-full text-2xl text-white px-5 outline-none font-thin bg-transparent"
                placeholder="0.05"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isButtonDisabled}
              />
              <h1 className="text-2xl text-white select-none">Eth</h1>
            </div>

            {/* --- DURATION INPUT --- */}
            <h1 className="font-bold text-white text-xl flex gap-3 py-2">
              Duration
              <CornerDownLeft
                className="-rotate-90 self-end"
                color="#4a5565"
                strokeWidth={0.75}
              />
            </h1>
            <div className="flex border border-gray-400 px-5 py-4 rounded-2xl overflow-hidden">
              <input
                type="number"
                className="w-full text-2xl text-white px-5 outline-none font-thin bg-transparent"
                placeholder="e.g., 30"
                value={durationInMinutes}
                onChange={(e) => setDurationInMinutes(e.target.value)}
                disabled={isButtonDisabled}
              />
              <h1 className="text-2xl text-white select-none">Minutes</h1>
            </div>

            <div className="text-gray-700 mx-auto truncate">
              ______________________________________________________________
            </div>

            {/* --- DYNAMIC PAYMENT INFO --- */}
            <div className="flex justify-between w-full">
              <h1 className="text-white font-bold text-xl select-none">
                You pay
              </h1>
              <p className="text-gray-300 select-none">
                <span className="font-bold text-white select-none">
                  {price || "0"}{" "}
                </span>
                Eth
              </p>
            </div>

            <div className="text-gray-700 mx-auto truncate">
              ______________________________________________________________
            </div>

            {/* --- DYNAMIC ACTION BUTTON --- */}
            <button
              onClick={handleMakeOfferClick}
              disabled={isButtonDisabled}
              className={`w-full px-5 py-4 cursor-pointer font-bold text-2xl text-white rounded-xl select-none transition-all duration-300 flex items-center justify-center gap-3 ${
                isButtonDisabled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
            >
              {isPending || isConfirming ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Processing...
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle2 />
                  Success!
                </>
              ) : (
                "Make offer"
              )}
            </button>

            {/* --- TRANSACTION FEEDBACK AREA --- */}
            {txStatus && (
              <p
                className={`text-sm text-center mt-2 h-5 transition-all duration-300 ${
                  writeError ? "text-red-400" : "text-slate-400"
                }`}
              >
                {txStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Make_Offer_popup;
