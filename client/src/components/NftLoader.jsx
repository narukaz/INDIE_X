// GameNftLoader.jsx
import React, { useEffect, useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import gameInstanceABI from "./ABI/game_instance.json";

/**
 * A non-rendering component to fetch all NFT CIDs, prices, and types for a single game.
 * @param {string} gameAddress - The address of the game instance contract.
 * @param {function} onNftsLoaded - Callback function to return the loaded NFT data.
 */
function GameNftLoader({ gameAddress, onNftsLoaded }) {
  // 1. Get the total number of NFTs ever minted in this game instance
  const { data: totalNftsData } = useReadContract({
    address: gameAddress,
    abi: gameInstanceABI,
    functionName: "gettotalmintednfts",
  });
  const totalNfts = totalNftsData ? Number(totalNftsData) : 0;

  // 2. Fetch the game's name/title from the contract
  const { data: gameName } = useReadContract({
    address: gameAddress,
    abi: gameInstanceABI,
    functionName: "game",
  });

  // 3. Prepare the configuration for a batch call to get all token details
  const nftDetailContracts = useMemo(() => {
    if (totalNfts === 0) return [];
    const tokenIds = Array.from({ length: totalNfts }, (_, i) => BigInt(i + 1));

    // For each tokenId, create two contract calls: one for the CID and one for the details
    const contracts = [];
    tokenIds.forEach((tokenId) => {
      contracts.push({
        address: gameAddress,
        abi: gameInstanceABI,
        functionName: "tokenCIDs",
        args: [tokenId],
      });
      contracts.push({
        address: gameAddress,
        abi: gameInstanceABI,
        functionName: "skinDetails",
        args: [tokenId],
      });
    });
    return contracts;
  }, [gameAddress, totalNfts]);

  // 4. Execute the batch call to fetch all details at once
  const { data: nftDetailsData } = useReadContracts({
    contracts: nftDetailContracts,
    enabled: nftDetailContracts.length > 0,
  });

  // 5. When all data is fetched, format it and call the parent's callback function
  useEffect(() => {
    if (nftDetailsData && gameName && totalNfts > 0) {
      const nftsForThisGame = [];
      // We have two results for each token, so we loop in steps of 2
      for (let i = 0; i < nftDetailsData.length; i += 2) {
        const cidResult = nftDetailsData[i];
        const detailsResult = nftDetailsData[i + 1];

        if (
          cidResult.status === "success" &&
          detailsResult.status === "success" &&
          cidResult.result
        ) {
          const tokenId = i / 2 + 1;
          const [skinType, price, isForSale] = detailsResult.result;

          nftsForThisGame.push({
            // Your desired data structure
            cid: cidResult.result,
            contract: gameAddress,
            tokenId: tokenId,
            price: price.toString(), // Convert BigInt to string for easier handling
            type: skinType, // This will be a number (0 for common, 1 for epic, etc.)
            gameName,
          });
        }
      }
      onNftsLoaded(gameAddress, nftsForThisGame);
    }
  }, [nftDetailsData, gameName, gameAddress, totalNfts, onNftsLoaded]);

  return null; // This component does not render any UI itself
}

export default GameNftLoader;
