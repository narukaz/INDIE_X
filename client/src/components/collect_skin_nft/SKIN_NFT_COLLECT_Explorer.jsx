import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";

import SKIN_NFT_COLLECT_CARD from "./SKIN_NFT_COLLECT_CARD";
import mastercontractabi from "../ABI/master.json";
import gameinstanceabi from "../ABI/game_instance.json";
import { mastercontract } from "../contractdata.json";

const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const MAX_GAMES_TO_FETCH = 50;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function All_NFT_Explorer() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  // UPDATED: Now we have two states to manage the data processing steps
  const [nftsWithDetails, setNftsWithDetails] = useState([]);
  const [finalNfts, setFinalNfts] = useState([]);
  const [status, setStatus] = useState("Connecting to your wallet...");
  const [searchTerm, setSearchTerm] = useState("");

  // === STEP 1: Fetch all game addresses ===
  const gameAddressContracts = useMemo(() => {
    return Array.from({ length: MAX_GAMES_TO_FETCH }, (_, i) => ({
      address: mastercontract,
      abi: mastercontractabi,
      functionName: "allGames",
      args: [i],
    }));
  }, []);

  const { data: gameAddressResults, isLoading: isLoadingGames } =
    useReadContracts({
      contracts: gameAddressContracts,
      query: { enabled: isConnected },
    });

  const gameAddresses = useMemo(() => {
    if (!gameAddressResults) return [];
    return gameAddressResults
      .filter(
        (result) =>
          result.status === "success" && result.result !== ZERO_ADDRESS
      )
      .map((result) => result.result);
  }, [gameAddressResults]);

  // === STEP 2: For each game, fetch its NFT details ===
  const nftDetailsContracts = useMemo(() => {
    if (!gameAddresses || gameAddresses.length === 0) return [];
    return gameAddresses.map((addr) => ({
      address: addr,
      abi: gameinstanceabi,
      functionName: "getAllNftDetails",
    }));
  }, [gameAddresses]);

  const { data: allDetailsResults, isLoading: isLoadingNfts } =
    useReadContracts({
      contracts: nftDetailsContracts,
      query: { enabled: gameAddresses.length > 0 },
    });

  // This effect now sets the intermediate NFT data
  useEffect(() => {
    if (isLoadingGames) {
      setStatus("Searching for all games...");
    } else if (gameAddresses.length > 0 && isLoadingNfts) {
      setStatus(`Found ${gameAddresses.length} games. Fetching all NFTs...`);
    }

    if (allDetailsResults) {
      const combinedNfts = allDetailsResults
        .map((result, index) => {
          if (result.status === "success" && result.result) {
            const contractAddress = gameAddresses[index];
            return result.result.map((nft) => ({
              ...nft,
              contract: contractAddress,
            }));
          }
          return [];
        })
        .flat();
      setNftsWithDetails(combinedNfts); // Set the intermediate data
      setStatus("");
    }
  }, [allDetailsResults, isLoadingGames, isLoadingNfts, gameAddresses]);

  // === NEW - STEP 3: For each NFT, prepare to fetch its USD price ===
  const usdPriceContracts = useMemo(() => {
    if (nftsWithDetails.length === 0) return [];
    // For each NFT, create a call to the weiToUsd function on its contract
    return nftsWithDetails.map((nft) => ({
      address: nft.contract, // The address of the game instance contract
      abi: gameinstanceabi,
      functionName: "weiToUsd",
      args: [nft.price], // Pass the NFT's price in wei
    }));
  }, [nftsWithDetails]);

  const { data: usdPriceResults, isLoading: isLoadingUsd } = useReadContracts({
    contracts: usdPriceContracts,
    query: { enabled: nftsWithDetails.length > 0 },
  });

  // === NEW - STEP 4: Combine NFT details with the fetched USD price ===
  useEffect(() => {
    if (isLoadingUsd) {
      setStatus(`Fetching USD prices for ${nftsWithDetails.length} NFTs...`);
      return;
    }
    if (usdPriceResults) {
      const enrichedNfts = nftsWithDetails.map((nft, index) => {
        const usdResult = usdPriceResults[index];
        let usdPrice = null;
        if (usdResult.status === "success" && usdResult.result) {
          // The result is an array [dollars, cents]
          usdPrice = {
            dollars: Number(usdResult.result[0]),
            cents: Number(usdResult.result[1]),
          };
        }
        return { ...nft, usdPrice };
      });
      setFinalNfts(shuffleArray(enrichedNfts));
      setStatus("");
    }
  }, [usdPriceResults, nftsWithDetails, isLoadingUsd]);

  // Memoized search results now use the final, fully enriched data
  const filteredNfts = useMemo(() => {
    if (!searchTerm) return finalNfts;
    return finalNfts.filter(
      (nft) =>
        nft.gameCid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId.toString().includes(searchTerm)
    );
  }, [finalNfts, searchTerm]);

  return (
    <div className="relative shadow-md px-4 md:px-9 py-8 overflow-hidden gap-4 w-full mt-10 bg-black flex flex-col">
      <div className="flex flex-col border rounded-2xl border-gray-700 overflow-hidden mt-4">
        <div className="flex items-center gap-4 w-full p-2 border-b border-gray-700 bg-slate-900/50">
          <input
            type="text"
            className="flex-grow px-4 py-2 text-lg text-gray-400 outline-none bg-transparent w-full"
            placeholder="Search by Game Name or Token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-6 p-6 min-h-[400px]">
          {status ? (
            <p className="text-gray-400 text-center w-full">{status}</p>
          ) : filteredNfts.length > 0 ? (
            filteredNfts.map((nft) => (
              <SKIN_NFT_COLLECT_CARD
                key={`${nft.contract}-${nft.tokenId}`}
                contractAddress={nft.contract}
                tokenId={nft.tokenId}
                cid={nft.cid}
                gameCid={nft.gameCid}
                instanceOwner={nft.instanceOwner}
                price={nft.price}
                skinType={nft.skinType}
                currentOwner={nft.currentOwner}
                isRentalActive={nft.isRentalActive}
                rentalRequestCount={nft.rentalRequestCount}
                usdPrice={nft.usdPrice} // Pass the new usdPrice prop
                onClick={() =>
                  navigate(`/collect-skin-nft/${nft.contract}/${nft.tokenId}`)
                }
              />
            ))
          ) : (
            <p className="text-gray-400 text-center w-full">
              No NFTs found across any games.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default All_NFT_Explorer;
