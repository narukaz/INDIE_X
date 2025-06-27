import React, { useState, useEffect, useMemo } from "react";
import Game_specific_hardcoded_nft_Card from "./Game_specific_hardcoded_nft_Card";
import { useReadContracts } from "wagmi"; // Changed to useReadContracts for batching
import gameInstanceAbi from "../ABI/game_instance.json";
import { LoaderCircle } from "lucide-react";

function Game_specific_hardcoded_nft_explorer({ contractAddress, game_name }) {
  // State to hold the list of NFTs in different stages
  const [nfts, setNfts] = useState([]);
  const [finalNfts, setFinalNfts] = useState([]); // Will hold NFTs with USD price
  const [status, setStatus] = useState("Loading NFTs...");

  // === STEP 1: Fetch all NFT details from the game instance contract ===
  const {
    data: nftDetails,
    isLoading: isLoadingNfts,
    isSuccess: isNftSuccess,
    error: nftError,
  } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: gameInstanceAbi,
        functionName: "getAllNftDetails",
      },
    ],
    query: { enabled: !!contractAddress },
  });

  // This effect updates our intermediate state once the data is successfully fetched
  useEffect(() => {
    if (isNftSuccess && nftDetails?.[0]?.result) {
      setNfts(nftDetails[0].result);
    }
  }, [isNftSuccess, nftDetails]);

  // === NEW - STEP 2: For each NFT, prepare to fetch its USD price ===
  const usdPriceContracts = useMemo(() => {
    if (nfts.length === 0) return [];
    return nfts.map((nft) => ({
      address: contractAddress,
      abi: gameInstanceAbi,
      functionName: "weiToUsd",
      args: [nft.price], // Pass the NFT's price in wei
    }));
  }, [nfts, contractAddress]);

  const { data: usdPriceResults, isLoading: isLoadingUsd } = useReadContracts({
    contracts: usdPriceContracts,
    query: { enabled: nfts.length > 0 },
  });

  // === NEW - STEP 3: Combine NFT details with the fetched USD price ===
  useEffect(() => {
    if (isLoadingNfts) {
      setStatus("Loading NFTs...");
      return;
    }
    if (isLoadingUsd) {
      setStatus(`Fetching USD prices...`);
      return;
    }
    if (usdPriceResults) {
      const enrichedNfts = nfts.map((nft, index) => {
        const usdResult = usdPriceResults[index];
        let usdPrice = null;
        if (usdResult.status === "success" && usdResult.result) {
          usdPrice = {
            dollars: Number(usdResult.result[0]),
            cents: Number(usdResult.result[1]),
          };
        }
        return { ...nft, usdPrice };
      });
      setFinalNfts(enrichedNfts);
      setStatus(""); // Clear status when done
    }
  }, [usdPriceResults, nfts, isLoadingNfts, isLoadingUsd]);

  return (
    // YOUR DESIGN IS PRESERVED HERE
    <div className="relative shadow-md px-9 py-8 overflow-hidden gap-4 w-full bg-black flex">
      <div className="flex flex-col border rounded-2xl border-gray-500 overflow-hidden w-full">
        <div className="flex items-center gap-4 w-full px-4 py-4">
          <h1 className="text-gray-500 font-thin text-xl select-none">
            {finalNfts.length > 0
              ? `${finalNfts.length} skins of ${game_name}`
              : `Skins of ${game_name}`}
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 p-4 min-h-[200px] items-center">
          {/* DYNAMIC CONTENT RENDERING */}
          {status ? (
            <div className="flex items-center gap-2 text-gray-400">
              <LoaderCircle className="animate-spin" />
              <span>{status}</span>
            </div>
          ) : nftError ? (
            <p className="text-red-400">
              Error loading NFTs: {nftError.shortMessage || nftError.message}
            </p>
          ) : finalNfts.length === 0 ? (
            <p className="text-gray-400">No NFTs found for this game.</p>
          ) : (
            finalNfts.map((nft) => (
              <Game_specific_hardcoded_nft_Card
                key={nft.tokenId.toString()}
                contractAddress={contractAddress}
                tokenId={nft.tokenId}
                cid={nft.cid}
                price={nft.price}
                skinType={nft.skinType}
                currentOwner={nft.currentOwner}
                instanceOwner={nft.instanceOwner}
                isRentalActive={nft.isRentalActive}
                rentalRequestCount={nft.rentalRequestCount}
                gameCid={nft.gameCid}
                usdPrice={nft.usdPrice} // Pass the new prop
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Game_specific_hardcoded_nft_explorer;
