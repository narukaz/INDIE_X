import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReadContracts } from "wagmi";
import { Copy, Crown, Gamepad2, Network, Banknote } from "lucide-react";
import { formatEther } from "ethers"; // Ethers is a powerful library for these conversions

// Helper Components (make sure these files exist)
import CardSkeleton from "./CardSkeleton";
import CardError from "./CardError";

// Smart Contract ABI
import gameInstanceAbi from "../ABI/game_instance.json"; // Adjust path as needed

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";

// A simple component for the Ethereum icon
const EthIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="#000000"
  >
    <title>Ethereum</title>
    <path d="M12 0L2.794 12 12 16.222 21.206 12 12 0zm-.21 17.277v6.721l9.206-12.89L11.79 17.277zM12 16.222L2.794 12 12 16.222zM2.794 12l9.002 4.001.204-4.21L2.794 12zM12.21 23.998v-6.721l-9.206 5.589L12.21 24z" />
  </svg>
);

function NFT_CARD({ nft: rawNft }) {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [enrichedNft, setEnrichedNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- BLOCKCHAIN DATA FETCHING ---
  const { data: contractData } = useReadContracts({
    contracts: [
      {
        address: rawNft.contractAddress,
        abi: gameInstanceAbi,
        functionName: "weiToUsd",
        args: [rawNft.price],
      },
    ],
  });

  // --- DATA PROCESSING & IPFS FETCH ---
  useEffect(() => {
    const fetchAndEnrichData = async () => {
      try {
        const imageUrl = `${PINATA_GATEWAY_URL}${rawNft.cid}`;
        const gameUrl = `${PINATA_GATEWAY_URL}${rawNft.gameCid}`;
        const gameMetaRes = await fetch(gameUrl);

        if (!gameMetaRes.ok) {
          throw new Error(
            `Could not fetch Game metadata (status: ${gameMetaRes.status}).`
          );
        }

        const gameMetadata = await gameMetaRes.json();

        let usdPrice = null;
        if (contractData?.[0]?.status === "success" && contractData[0].result) {
          usdPrice = {
            dollars: Number(contractData[0].result[0]),
            cents: Number(contractData[0].result[1]),
          };
        }

        // --- NEW: Convert wei to Ether ---
        // The formatEther function correctly handles the BigInt division.
        const etherPrice = formatEther(rawNft.price);

        // Build the final object with both prices.
        setEnrichedNft({
          ...rawNft,
          name: `${gameMetadata.name} #${rawNft.tokenId.toString()}`,
          description: `A unique item from the ${gameMetadata.name} collection.`,
          imageUrl: imageUrl,
          gameName: gameMetadata.name,
          usdPrice: usdPrice,
          etherPrice: etherPrice, // <-- ADD THE FORMATTED ETHER PRICE
          isRented: rawNft.isRentalActive,
          owner: rawNft.currentOwner,
        });
      } catch (err) {
        console.error("Error enriching NFT card:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (contractData) {
      fetchAndEnrichData();
    }
  }, [contractData, rawNft]);

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <CardSkeleton />;
  }

  if (error) {
    return <CardError error={error} />;
  }

  if (!enrichedNft) {
    return <CardError error="NFT data could not be processed." />;
  }

  const {
    name,
    description,
    imageUrl,
    gameName,
    owner,
    usdPrice,
    etherPrice,
    isRented,
    contractAddress,
    tokenId,
  } = enrichedNft;

  const displayUsdPrice = usdPrice
    ? `$${usdPrice.dollars}.${usdPrice.cents.toString().padStart(2, "0")}`
    : "N/A";
  const ownershipType = isRented ? "Rented" : "Available";

  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const handleCardClick = () => navigate(`/collect-skin-nft`);

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl group bg-gradient-to-b from-[#0E1420] to-[#121926] max-w-[400px] h-auto aspect-[9.5/12.5] p-1 flex flex-col items-start border border-solid border-blue-300 overflow-hidden cursor-pointer hover:scale-105 transition-all"
    >
      <div className="relative w-full h-full p-[2px] rounded-t-xl bg-gradient-to-b from-[#76e6ff] via-[#00a9ce0d] to-transparent overflow-hidden">
        {/* Ownership Status */}
        <div className="absolute top-5 right-5 bg-blue-500 px-3 py-1 flex items-center gap-2 rounded-2xl z-10">
          <p className="text-white select-none font-semibold">
            {ownershipType}
          </p>
        </div>

        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover rounded-t-xl block"
        />

        {/* Hover Overlay */}
        <div className="absolute right-0 w-full h-full bg-gradient-to-b from-transparent to-gray-800 hover:to-gray-950 transition-all duration-300 flex flex-col justify-end gap-4 p-6 group-hover:bottom-0 -bottom-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-white font-bold text-2xl truncate" title={name}>
              {name}
            </h1>
            <h2 className="text-[#94a7c6] font-normal text-sm uppercase select-none truncate">
              {description}
            </h2>
          </div>

          {/* Details Box */}
          <div className="flex flex-col items-start w-full justify-start gap-2 pl-4 py-3 mt-2 bg-white/90 text-gray-800 rounded-xl font-normal select-none">
            <div className="flex items-center gap-2">
              <Crown color="#000000" strokeWidth={1.5} size={16} />
              <p className="font-normal text-sm">
                Owner: {owner?.slice(0, 6)}...{owner?.slice(-4)}
              </p>
              <Copy
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(owner);
                }}
                strokeWidth={1.5}
                size={16}
                className="cursor-pointer hover:scale-110 transition-all text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 color="#000000" strokeWidth={1.5} size={16} />
              <p className="font-normal text-sm">Game: {gameName}</p>
            </div>
            {/* --- UPDATED PRICE SECTION --- */}
            <div className="flex items-center gap-2">
              <EthIcon />
              <p className="font-normal text-sm">
                {/* Displaying ETH price, rounded to 6 decimal places for readability */}
                Price: {parseFloat(etherPrice).toFixed(6)} ETH
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Banknote color="#000000" strokeWidth={1.5} size={16} />
              <p className="font-normal text-sm">({displayUsdPrice})</p>
            </div>
            {/* <div className="flex items-center gap-2">
              <Network color="#000000" strokeWidth={1.5} size={16} />
              <p className="font-normal text-sm">Chain: Polygon</p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Footer Address */}
      <div
        className="mt-auto w-full flex items-center justify-center gap-2 text-gray-500 text-[10px] cursor-pointer p-1 hover:text-gray-200"
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(contractAddress);
        }}
      >
        <span>
          NFT Address: {contractAddress?.slice(0, 8)}...
          {contractAddress?.slice(-6)}
        </span>
        <Copy size={10} className="cursor-pointer" />
      </div>
    </div>
  );
}

export default NFT_CARD;
