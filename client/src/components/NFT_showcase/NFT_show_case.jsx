import React, { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  ChevronRight,
  Flame,
  LucideGamepad2,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContracts } from "wagmi";

import NFT_CARD from "../NFT_Card/NFT_CARD"; // Assuming NFT_CARD is correctly implemented
import masterabi from "../ABI/master.json";
import { mastercontract } from "../contractdata.json";
import gameInstanceAbi from "../ABI/game_instance.json";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
const MAX_GAMES_TO_FETCH = 50;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// A utility to shuffle an array, used for randomization
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

function NFT_show_case() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  // --- REFACTORED STATE MANAGEMENT ---
  // We now use multiple states to manage the data pipeline.
  const [allAvailableNfts, setAllAvailableNfts] = useState([]); // Holds all NFTs from all games
  const [nftsToShow, setNftsToShow] = useState([]); // Holds the 3 randomly selected NFTs
  const [showcaseNfts, setShowcaseNfts] = useState([]); // Holds the final, fully enriched NFTs
  const [status, setStatus] = useState("Initializing...");
  console.log("all avialbe nft's", allAvailableNfts);
  console.log("nftsToShow", nftsToShow);
  console.log("showcaseNfts", showcaseNfts);
  // === STEP 1: Fetch all game addresses ===
  const gameAddressContracts = useMemo(() => {
    return Array.from({ length: MAX_GAMES_TO_FETCH }, (_, i) => ({
      address: mastercontract,
      abi: masterabi,
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
    const addrs = [];
    for (const res of gameAddressResults) {
      if (res.status !== "success" || res.result === ZERO_ADDRESS) break;
      addrs.push(res.result);
    }
    return addrs;
  }, [gameAddressResults]);

  // === STEP 2: For each game, fetch its NFT details ===
  const nftDetailsContracts = useMemo(() => {
    if (gameAddresses.length === 0) return [];
    return gameAddresses.map((addr) => ({
      address: addr,
      abi: gameInstanceAbi,
      functionName: "getAllNftDetails",
    }));
  }, [gameAddresses]);

  const { data: allNftResults, isLoading: isLoadingNfts } = useReadContracts({
    contracts: nftDetailsContracts,
    query: { enabled: gameAddresses.length > 0 },
  });

  // === STEP 3: Process and store all available NFTs ===
  // This effect runs when NFT details arrive. It processes them
  // and stores them in our first intermediate state `allAvailableNfts`.
  useEffect(() => {
    if (isLoadingGames) setStatus("Searching for all games...");
    else if (isLoadingNfts) setStatus("Found games, fetching all NFTs...");

    if (allNftResults) {
      const combinedNfts = allNftResults
        .map((result, index) => {
          if (result.status === "success" && result.result) {
            const contractAddress = gameAddresses[index];
            return result.result.map((nft) => ({ ...nft, contractAddress }));
          }
          return [];
        })
        .flat();

      setAllAvailableNfts(combinedNfts);
    }
  }, [allNftResults, gameAddresses, isLoadingGames, isLoadingNfts]);

  // === STEP 4: Randomly select 3 NFTs for the showcase ===
  // This effect runs only when `allAvailableNfts` is populated.
  // It selects 3 random NFTs and stores them in `nftsToShow`.
  useEffect(() => {
    if (allAvailableNfts.length > 0) {
      const shuffled = shuffleArray([...allAvailableNfts]);
      setNftsToShow(shuffled.slice(0, 3));
    }
  }, [allAvailableNfts]);

  // === STEP 5: Fetch extra details (rental, price) for the 3 selected NFTs ===
  const extraDetailsContracts = useMemo(() => {
    if (nftsToShow.length === 0) return [];
    return nftsToShow.flatMap((nft) => [
      {
        address: nft.contractAddress,
        abi: gameInstanceAbi,
        functionName: "rentals",
        args: [nft.tokenId],
      },
      {
        address: nft.contractAddress,
        abi: gameInstanceAbi,
        functionName: "weiToUsd",
        args: [nft.price],
      },
    ]);
  }, [nftsToShow]);

  const { data: extraDetailsResults, isLoading: isLoadingExtras } =
    useReadContracts({
      contracts: extraDetailsContracts,
      query: { enabled: nftsToShow.length > 0 },
    });

  // === STEP 6: Fetch metadata and combine ALL data for the final result ===
  // This is the final step. It runs only when the extra details arrive.
  useEffect(() => {
    const findAndFetchShowcase = async () => {
      if (nftsToShow.length === 0 || !extraDetailsResults) return;

      setStatus("Loading final details for showcased NFTs...");

      const promises = nftsToShow.map(async (nft, index) => {
        try {
          // Logic to process extra details is unchanged
          const baseIndex = index * 2;
          const rentalResult = extraDetailsResults[baseIndex];
          const usdResult = extraDetailsResults[baseIndex + 1];

          let rentalInfo = { isRented: false };
          if (
            rentalResult?.status === "success" &&
            rentalResult.result?.isActive
          ) {
            rentalInfo.isRented = true;
          }

          let usdPrice = null;
          if (usdResult?.status === "success" && usdResult.result) {
            usdPrice = {
              dollars: Number(usdResult.result[0]),
              cents: Number(usdResult.result[1]),
            };
          }

          // Fetch metadata from IPFS
          const nftMetaRes = await fetch(`${PINATA_GATEWAY_URL}${nft.cid}`);
          const nftMetadata = await nftMetaRes.json();
          const gameMetaRes = await fetch(
            `${PINATA_GATEWAY_URL}${nft.gameCid}`
          );
          const gameMetadata = await gameMetaRes.json();

          // Combine everything into the final object
          return {
            ...nft,
            name: nftMetadata.name,
            description: nftMetadata.description, // <-- ADD THIS LINE
            attributes: nftMetadata.attributes, // <-- ADD THIS LINE
            imageUrl: `${PINATA_GATEWAY_URL}${nftMetadata.image}`,
            gameName: gameMetadata.name,
            owner: nft.currentOwner,
            ...rentalInfo,
            usdPrice,
          };
        } catch (error) {
          console.error("Failed to fetch metadata for NFT:", nft, error);
          return null; // Return null on error
        }
      });

      const finalNfts = (await Promise.all(promises)).filter(Boolean); // Filter out any nulls
      setShowcaseNfts(finalNfts);
      setStatus(""); // All done, clear status
    };

    if (extraDetailsResults) {
      findAndFetchShowcase();
    }
  }, [extraDetailsResults, nftsToShow]); // Dependency array is now much simpler

  return (
    <div className="h-auto flex flex-col gap-9 px-6 py-8 relative">
      <h1
        onClick={() => navigate("/collect-skin-nft")}
        className="pl-12 hover:pl-20 pr-5 bg-white w-max py-3 rounded-3xl text-2xl text-black font-bold flex items-center gap-3 hover:text-blue-400 cursor-pointer select-none group transition-all"
      >
        <Boxes
          size={30}
          className="text-black transition-all ease-out group-hover:text-blue-500"
        />
        Explore NFTs
        <span>
          <ChevronRight size={20} className="group-hover:ml-7 transition-all" />
        </span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {status ? (
          <p className="text-gray-400 col-span-3 text-center flex items-center gap-2">
            <LoaderCircle className="animate-spin" /> {status}
          </p>
        ) : nftsToShow.length > 0 ? (
          nftsToShow.map((nft) => (
            <NFT_CARD key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} />
          ))
        ) : (
          <p className="text-gray-400 col-span-3 text-center">
            No NFTs available to showcase right now.
          </p>
        )}
      </div>
    </div>
  );
}

export default NFT_show_case;
