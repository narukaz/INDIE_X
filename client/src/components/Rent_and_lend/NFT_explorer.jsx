import React, { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";

import NFT_explore_Card from "./NFT_explore_Card";
import Make_Offer_popup from "./Make_Offer_popup";
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

function NFT_explorer() {
  const { isConnected } = useAccount();

  // State Management
  const [nftsWithDetails, setNftsWithDetails] = useState([]);
  const [finalNfts, setFinalNfts] = useState([]);
  const [status, setStatus] = useState("Connecting to your wallet...");
  const [isMakeOffer, setIsMakeOffer] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
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

  // === STEP 2: For each game, fetch its NFT details & instance owner ===
  const nftDetailsContracts = useMemo(() => {
    if (!gameAddresses || gameAddresses.length === 0) return [];
    return gameAddresses.flatMap((addr) => [
      { address: addr, abi: gameinstanceabi, functionName: "getAllNftDetails" },
      { address: addr, abi: gameinstanceabi, functionName: "instance_owner" },
    ]);
  }, [gameAddresses]);

  const { data: allDetailsResults, isLoading: isLoadingNfts } =
    useReadContracts({
      contracts: nftDetailsContracts,
      query: { enabled: gameAddresses.length > 0 },
    });

  // === STEP 3: Process NFT results & filter for third-party owned NFTs ===
  useEffect(() => {
    if (isLoadingGames) {
      setStatus("Searching for all games in the marketplace...");
    } else if (isLoadingNfts) {
      setStatus(`Found ${gameAddresses.length} games. Fetching all NFTs...`);
    }

    if (allDetailsResults) {
      const combined = [];
      for (let i = 0; i < allDetailsResults.length; i += 2) {
        if (
          allDetailsResults[i].status === "success" &&
          allDetailsResults[i + 1].status === "success"
        ) {
          const nfts = allDetailsResults[i].result;
          const instanceOwner = allDetailsResults[i + 1].result;
          const contractAddress = gameAddresses[i / 2];

          const thirdPartyNfts = nfts.filter(
            (nft) =>
              nft.currentOwner.toLowerCase() !== instanceOwner.toLowerCase() &&
              nft.currentOwner.toLowerCase() !== ZERO_ADDRESS.toLowerCase()
          );

          const nftsWithContract = thirdPartyNfts.map((nft) => ({
            ...nft,
            contract: contractAddress,
          }));
          combined.push(...nftsWithContract);
        }
      }
      setNftsWithDetails(combined);
    }
  }, [allDetailsResults, gameAddresses, isLoadingGames, isLoadingNfts]);

  // === STEP 4: Fetch Rental and USD Price data for each NFT ===
  const rentalAndPriceContracts = useMemo(() => {
    if (nftsWithDetails.length === 0) return [];
    return nftsWithDetails.flatMap((nft) => [
      {
        address: nft.contract,
        abi: gameinstanceabi,
        // UPDATED: Using the correct function name as you specified
        functionName: "getRentalTimeDetails",
        args: [nft.tokenId],
      },
      {
        address: nft.contract,
        abi: gameinstanceabi,
        functionName: "weiToUsd",
        args: [nft.price],
      },
    ]);
  }, [nftsWithDetails]);

  const { data: rentalAndPriceResults, isLoading: isLoadingExtras } =
    useReadContracts({
      contracts: rentalAndPriceContracts,
      query: { enabled: nftsWithDetails.length > 0 },
    });

  // === STEP 5: Combine all data into the final, enriched list ===
  useEffect(() => {
    if (isLoadingExtras) {
      setStatus(`Checking details for ${nftsWithDetails.length} NFTs...`);
      return;
    }

    if (rentalAndPriceResults) {
      const enrichedNfts = nftsWithDetails.map((nft, index) => {
        const baseIndex = index * 2;
        const rentalResult = rentalAndPriceResults[baseIndex];
        const usdResult = rentalAndPriceResults[baseIndex + 1];

        let rentalInfo = { isRentalActive: false, rentalEndTime: 0 };
        // Correctly check the rental status from the 'getRentalTimeDetails' function result
        if (
          rentalResult.status === "success" &&
          rentalResult.result &&
          rentalResult.result.isActive
        ) {
          rentalInfo = {
            isRentalActive: true,
            rentalEndTime:
              Number(rentalResult.result.startTime) +
              Number(rentalResult.result.duration),
          };
        }

        let usdPrice = null;
        if (usdResult.status === "success" && usdResult.result) {
          usdPrice = {
            dollars: Number(usdResult.result[0]),
            cents: Number(usdResult.result[1]),
          };
        }

        // We ignore the 'isRentalActive' from the original `nft` object and use our new, reliable one
        return { ...nft, ...rentalInfo, usdPrice };
      });
      setFinalNfts(shuffleArray(enrichedNfts));
      setStatus("");
    }
  }, [rentalAndPriceResults, nftsWithDetails, isLoadingExtras]);

  const handleRentClick = (nftData) => {
    setSelectedNft(nftData);
    setIsMakeOffer(true);
  };

  const filteredNfts = useMemo(() => {
    if (!searchTerm) return finalNfts;
    return finalNfts.filter(
      (nft) =>
        nft.gameCid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId.toString().includes(searchTerm)
    );
  }, [finalNfts, searchTerm]);

  return (
    <>
      {isMakeOffer && selectedNft && (
        <Make_Offer_popup
          NFT_data={selectedNft}
          setIsMakeOffer={setIsMakeOffer}
        />
      )}
      <div className="relative shadow-md px-4 md:px-9 py-8 overflow-hidden gap-4 w-full mt-24 bg-black flex flex-col">
        <div className="relative">
          <img
            src="https://cdnb.artstation.com/p/assets/images/images/009/761/017/large/jakub-rozalski-1920-you-reap-what-you-sowih.jpg?1520769169"
            className="w-full h-[150px] object-cover rounded-xl"
            alt="Marketplace banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <h1
            className="absolute left-6 bottom-5 text-4xl md:text-7xl text-white font-bold"
            style={{ textShadow: "0px 3px 6px rgba(0,0,0,0.5)" }}
          >
            Trade & Rent NFTs
          </h1>
        </div>
        <div className="flex flex-col border rounded-2xl border-gray-700 overflow-hidden bg-black mt-4">
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
                <NFT_explore_Card
                  key={`${nft.contract}-${nft.tokenId}`}
                  nftData={nft}
                  onRentClick={() => handleRentClick(nft)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center w-full">
                No NFTs found matching your criteria.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NFT_explorer;
