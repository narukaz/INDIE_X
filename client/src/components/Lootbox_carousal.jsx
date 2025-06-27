import React, { useEffect, useState, useMemo, useCallback } from "react";
// Removed Slider and CSS imports for react-slick

import masterabi from "./ABI/master.json";
import { mastercontract } from "./contractdata.json";
import gameInstanceAbi from "./ABI/game_instance.json";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance, // Import useBalance hook
} from "wagmi";
import { LoaderCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
const MAX_GAMES_TO_FETCH = 50;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const formatEtherSimple = (wei) => {
  if (!wei || typeof wei !== "bigint") return "0";
  const base = 10n ** 18n;
  const whole = wei / base;
  const fraction = wei % base;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction.toString().padStart(18, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
};

function LootBoxCarousel() {
  const account = useAccount();

  // State Management
  const [gamesForLootbox, setGamesForLootbox] = useState([]);
  const [status, setStatus] = useState("Initializing...");
  // REMOVED: Notification state is no longer needed.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // WAGMI Hooks for writing transactions and checking balance
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const { data: balanceData } = useBalance({
    address: account.address,
  });

  // --- REORDERED DATA FETCHING LOGIC ---

  // === STEP 1: Fetch all game addresses ===
  const allGamesContracts = useMemo(() => {
    return Array.from({ length: MAX_GAMES_TO_FETCH }, (_, i) => ({
      address: mastercontract,
      abi: masterabi,
      functionName: "allGames",
      args: [i],
    }));
  }, []);

  const { data: allGamesResults, isLoading: isLoadingGames } = useReadContracts(
    {
      contracts: allGamesContracts,
      query: { enabled: !!account.address },
    }
  );

  const gameAddresses = useMemo(() => {
    if (!allGamesResults) return [];
    const addrs = [];
    for (const res of allGamesResults) {
      if (res.status !== "success" || res.result === ZERO_ADDRESS) break;
      addrs.push(res.result);
    }
    return addrs;
  }, [allGamesResults]);

  // === STEP 2: Fetch on-chain details ===
  const gameDetailsContracts = useMemo(() => {
    if (!gameAddresses || gameAddresses.length === 0) return [];
    return gameAddresses.flatMap((addr) => [
      { address: addr, abi: gameInstanceAbi, functionName: "getGameCid" },
      { address: addr, abi: gameInstanceAbi, functionName: "lootBoxPrice" },
      {
        address: addr,
        abi: gameInstanceAbi,
        functionName: "lootBoxSkins",
        args: [0],
      },
    ]);
  }, [gameAddresses]);

  // ADDED: refetch function to update loot box data on demand
  const {
    data: gameDetailsResults,
    isLoading: isLoadingDetails,
    refetch: refetchLootboxData,
  } = useReadContracts({
    contracts: gameDetailsContracts,
    query: { enabled: gameAddresses.length > 0 },
  });

  // === STEP 3: Process fetched data and fetch from IPFS ===
  useEffect(() => {
    const processAndFetch = async () => {
      if (!gameDetailsResults || gameAddresses.length === 0) {
        setGamesForLootbox([]);
        return;
      }
      const gamesWithChainDetails = gameAddresses
        .map((address, index) => {
          const baseIndex = index * 3;
          const cidResult = gameDetailsResults[baseIndex];
          const priceResult = gameDetailsResults[baseIndex + 1];
          const contentResult = gameDetailsResults[baseIndex + 2];
          return {
            contractAddress: address,
            cid: cidResult?.status === "success" ? cidResult.result : null,
            lootBoxPrice:
              priceResult?.status === "success" ? priceResult.result : 0n,
            hasLootBoxItems: contentResult?.status === "success",
          };
        })
        .filter((game) => game.lootBoxPrice > 0n && game.hasLootBoxItems);

      if (gamesWithChainDetails.length === 0) {
        setStatus("No active loot boxes found.");
        setGamesForLootbox([]);
        return;
      }

      setStatus(
        `Found ${gamesWithChainDetails.length} loot boxes. Fetching details...`
      );
      const promises = gamesWithChainDetails.map(async (game) => {
        if (!game.cid) return { ...game, isMetadataLoaded: false };
        try {
          const response = await fetch(`${PINATA_GATEWAY_URL}${game.cid}`);
          const metadata = await response.json();
          return {
            ...game,
            ...metadata,
            imageUrl: `${PINATA_GATEWAY_URL}${metadata.image}`,
            isMetadataLoaded: true,
          };
        } catch (error) {
          return { ...game, isMetadataLoaded: false };
        }
      });
      const enrichedGames = await Promise.all(promises);
      setGamesForLootbox(enrichedGames.filter((g) => g.isMetadataLoaded));
      setStatus("");
    };
    processAndFetch();
  }, [gameDetailsResults, gameAddresses]);

  // Transaction Handler
  const handleOpenLootBox = (gameAddress, priceInWei) => {
    // Balance check can be added back here if needed
    if (balanceData && balanceData.value < priceInWei) {
      alert("Insufficient funds to open loot box."); // Simple alert for now
      return;
    }
    writeContract({
      address: gameAddress,
      abi: gameInstanceAbi,
      functionName: "openLootBox",
      value: priceInWei,
    });
  };

  // Status and Refetch Effects
  useEffect(() => {
    if (isLoadingGames) setStatus("Finding all games...");
    else if (isLoadingDetails) setStatus("Checking for active loot boxes...");
  }, [isLoadingGames, isLoadingDetails]);

  // NEW: This effect handles refetching data after a successful transaction
  useEffect(() => {
    if (isConfirmed) {
      // Once the transaction is confirmed, refetch the loot box data.
      // This will automatically update the carousel with the latest state.
      alert("Loot box opened successfully! Checking for remaining boxes...");
      refetchLootboxData();
    }
  }, [isConfirmed, refetchLootboxData]);

  // Carousel Logic
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === gamesForLootbox.length - 1 ? 0 : prev + 1
    );
  }, [gamesForLootbox.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? gamesForLootbox.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    let slideInterval;
    if (!isHovering && gamesForLootbox.length > 1) {
      slideInterval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(slideInterval);
  }, [isHovering, gamesForLootbox.length, nextSlide]);

  if (status && gamesForLootbox.length === 0) {
    const emptyStateBg =
      "https://cdna.artstation.com/p/assets/images/images/088/480/128/large/-2.jpg?1748400014";
    return (
      <div className="w-full h-[650px] bg-black relative flex flex-col items-center justify-center text-white text-center p-4">
        <img
          src={emptyStateBg}
          alt="Coming Soon"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="z-10">
          {isLoadingGames || isLoadingDetails ? (
            <>
              <LoaderCircle className="animate-spin h-10 w-10 mx-auto mb-4" />
              <p>{status}</p>
            </>
          ) : (
            <h2 className="text-4xl font-bold">No New Loot Boxes</h2>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[650px] relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* REMOVED: Notification UI */}

      <div className="w-full h-full">
        {gamesForLootbox.map((game, index) => {
          const {
            imageUrl,
            name: gameName,
            lootBoxPrice,
            contractAddress,
          } = game;
          // The button is locked if a transaction is pending or confirming
          const isTransactionActive = isPending || isConfirming;
          const buttonText = `Open for ${formatEtherSimple(lootBoxPrice)} ETH`;

          return (
            <div
              key={contractAddress}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={imageUrl}
                alt="Lootbox promotion"
                className="inset-0 w-full h-full object-cover"
              />
              <div className="absolute left-0 top-0 bg-gradient-to-r from-black via-black/80 to-transparent px-10 w-full md:w-1/2 h-full flex flex-col justify-center items-start gap-4 z-10">
                <div className="flex justify-start items-center gap-6 mb-4">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4176/4176144.png"
                    alt="Treasure Chest"
                    className="w-20 h-20"
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/8559/8559958.png"
                    alt="Diamond NFT"
                    className="w-20 h-20"
                  />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {`Open ${gameName}'s Loot Box`}
                </h1>
                <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed select-none">
                  {`Get a chance to win exclusive skins from the ${gameName} collection! Each box contains one random NFT.`}
                </p>
                <div className="mt-4 flex gap-4 w-full">
                  <button
                    onClick={() =>
                      handleOpenLootBox(contractAddress, lootBoxPrice)
                    }
                    disabled={isTransactionActive}
                    className="cursor-pointer hover:scale-105 w-auto px-12 py-3 bg-white text-black font-semibold text-xl bg-opacity-80 rounded-lg hover:bg-opacity-100 transition disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {isTransactionActive ? (
                      <>
                        <LoaderCircle className="animate-spin" /> Processing...
                      </>
                    ) : (
                      buttonText
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {gamesForLootbox.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {gamesForLootbox.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default LootBoxCarousel;
