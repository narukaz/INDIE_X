import React, { useEffect, useState, useMemo } from "react";
import { Gamepad2, Pen, Star, LoaderCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import gameInstanceAbi from "../ABI/game_instance.json";
import Game_specific_hardcoded_nft_explorer from "../HardCoded/Game_specific_hardcoded_nft_explorer";
import { parseEther } from "viem";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";

function Game_screen() {
  const { contractAddress } = useParams();
  const { isConnected } = useAccount();

  // State for fetched data and loading statuses
  const [metadata, setMetadata] = useState(null);
  const [usdPrice, setUsdPrice] = useState(null); // New state for USD price
  const [isLoading, setIsLoading] = useState(true);

  // Hooks for the "Buy Game" transaction
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // === STEP 1: Fetch the game's CID from the blockchain ===
  const { data: gameDetailsResult } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: gameInstanceAbi,
        functionName: "getGameCid",
      },
    ],
    query: { enabled: !!contractAddress },
  });

  const gameCid = useMemo(
    () => gameDetailsResult?.[0]?.result,
    [gameDetailsResult]
  );

  // === STEP 2: Use the CID to fetch metadata from IPFS ===
  useEffect(() => {
    if (!gameCid) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${PINATA_GATEWAY_URL}${gameCid}`);
        if (!response.ok) throw new Error("Metadata fetch failed");
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch game metadata:", error);
        setMetadata(null);
      } finally {
        setIsLoading(false); // We stop the main loading here
      }
    };

    fetchMetadata();
  }, [gameCid]);

  // === NEW - STEP 3: Fetch USD price once metadata (and ETH price) is available ===
  const { data: usdPriceResult } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: gameInstanceAbi,
        functionName: "weiToUsd",
        args: metadata?.price ? [parseEther(metadata.price.toString())] : [0],
      },
    ],
    // This query is only enabled after we have the price from metadata
    query: { enabled: !!metadata?.price },
  });

  // This effect processes the result of the USD price fetch
  useEffect(() => {
    if (usdPriceResult?.[0]?.status === "success") {
      const result = usdPriceResult[0].result;
      setUsdPrice({
        dollars: Number(result[0]),
        cents: Number(result[1]),
      });
    }
  }, [usdPriceResult]);

  // Handler for the buy button
  const handleBuyGame = () => {
    if (!metadata?.price || !isConnected) return;
    writeContract({
      address: contractAddress,
      abi: gameInstanceAbi,
      functionName: "buygame",
      value: parseEther(metadata.price.toString()),
    });
  };

  // Main loading state now only depends on the initial metadata fetch
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <LoaderCircle className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        Failed to load game details.
      </div>
    );
  }

  const { name, image, description, overview, price } = metadata;
  const imageUrl = image
    ? `${PINATA_GATEWAY_URL}${image}`
    : "https://cdnb.artstation.com/p/assets/images/images/088/701/347/large/sescoh-a-1.jpg?1748966653";

  // --- UPDATED BUTTON TEXT LOGIC ---
  const formattedUsdPrice = usdPrice
    ? `($${usdPrice.dollars}.${usdPrice.cents.toString().padStart(2, "0")})`
    : "";
  const buyButtonText = `Buy Game ${
    price ? `for ${price} ETH` : ""
  } ${formattedUsdPrice}`;

  return (
    <div className="flex flex-col w-full bg-black text-white">
      <div className="h-[450px] relative">
        <img className="object-cover h-full w-full" src={imageUrl} alt={name} />
        <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-black to-transparent"></div>
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-12 left-12 z-10 flex items-center gap-5">
          <h1 className="font-bold text-6xl">{name || "The Game"}</h1>
          <div className="self-end mb-2 flex items-center gap-2">
            <Star size={20} color="#12824e" strokeWidth={1} />
            <p className="text-[#12824e]">{"4.5 Rating"}</p>{" "}
            {/* Placeholder rating */}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-4 px-8 py-12">
        <button
          onClick={handleBuyGame}
          disabled={isPending || isConfirming || !price}
          className="bg-blue-500 w-1/2 hover:bg-blue-600 font-regular text-white py-4 px-5 flex gap-2 items-center justify-center rounded-xl cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Gamepad2 size={20} />
          )}
          {isPending
            ? "Confirming..."
            : isConfirming
            ? "Processing..."
            : buyButtonText}
        </button>
        <button className="bg-gray-200 w-1/2 hover:bg-gray-400 font-regular text-black py-4 px-5 flex gap-2 items-center justify-center rounded-xl cursor-pointer">
          <Pen size={20} /> Write a review
        </button>
      </div>

      {/* Pass the contract address to the child component */}
      <Game_specific_hardcoded_nft_explorer
        contractAddress={contractAddress}
        game_name={name}
      />

      <div className="flex flex-col gap-8 px-8 py-3">
        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-5xl">Introduction</h1>
          <h3 className="text-xl">
            {description || "No description available for this game."}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-5xl">Overview</h1>
          <h3 className="text-xl">
            {overview || "No overview available for this game."}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Game_screen;
