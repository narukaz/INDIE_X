import React, { useEffect, useState, useMemo } from "react";
import Game_NFT_COLLECT_CARD from "./Game_NFT_COLLECT_CARD.jsx";
import masterabi from "../ABI/master.json";
import { mastercontract } from "../contractdata.json";
import gameInstanceAbi from "../ABI/game_instance.json";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
const MAX_GAMES_TO_FETCH = 50;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function Game_NFT_Collect_Explorer() {
  const account = useAccount();

  // State Management
  const [gamesWithMetadata, setGamesWithMetadata] = useState([]);
  const [finalGames, setFinalGames] = useState([]);
  const [status, setStatus] = useState("Initializing...");
  const [txStatus, setTxStatus] = useState("");
  console.log(gamesWithMetadata);
  // WAGMI Hooks for writing transactions
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

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

  // === STEP 2: Fetch on-chain details for each game ===
  const gameDetailsContracts = useMemo(() => {
    if (!gameAddresses || gameAddresses.length === 0) return [];
    return gameAddresses.flatMap((addr) => [
      { address: addr, abi: gameInstanceAbi, functionName: "getGameCid" },
      { address: addr, abi: gameInstanceAbi, functionName: "getsoldcopies" },
      {
        address: addr,
        abi: gameInstanceAbi,
        functionName: "gettotalmintednfts",
      },
    ]);
  }, [gameAddresses]);

  const { data: gameDetailsResults, isLoading: isLoadingDetails } =
    useReadContracts({
      contracts: gameDetailsContracts,
      query: { enabled: gameAddresses.length > 0 },
    });

  // === STEP 3: Fetch IPFS metadata ===
  useEffect(() => {
    const processAndFetch = async () => {
      if (!gameDetailsResults || gameAddresses.length === 0) {
        setGamesWithMetadata([]);
        return;
      }

      const gamesWithChainDetails = gameAddresses.map((address, index) => {
        const baseIndex = index * 3;
        return {
          contractAddress: address,
          cid: gameDetailsResults[baseIndex]?.result,
          soldCopies: gameDetailsResults[baseIndex + 1]?.result,
          totalCopies: gameDetailsResults[baseIndex + 2]?.result,
        };
      });

      setStatus(
        `Found ${gamesWithChainDetails.length} games. Fetching metadata...`
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
      setGamesWithMetadata(enrichedGames); // Set intermediate state
    };
    processAndFetch();
  }, [gameDetailsResults, gameAddresses]);

  // === NEW - STEP 4: For each game with a price, fetch its USD value ===
  const usdPriceContracts = useMemo(() => {
    return gamesWithMetadata
      .filter((game) => game.price > 0) // Only fetch for games with a price
      .map((game) => ({
        address: game.contractAddress,
        abi: gameInstanceAbi,
        functionName: "weiToUsd",
        args: [parseEther(game.price.toString())], // Convert ETH price from metadata to Wei
      }));
  }, [gamesWithMetadata]);

  const { data: usdPriceResults, isLoading: isLoadingUsd } = useReadContracts({
    contracts: usdPriceContracts,
    query: { enabled: gamesWithMetadata.length > 0 },
  });

  // === NEW - STEP 5: Combine all data into the final state ===
  useEffect(() => {
    if (isLoadingUsd) {
      setStatus("Converting prices to USD...");
      return;
    }

    const gamesWithPrice = gamesWithMetadata.filter((game) => game.price > 0);

    const enrichedGames = gamesWithMetadata.map((game) => {
      const priceIndex = gamesWithPrice.findIndex(
        (p) => p.contractAddress === game.contractAddress
      );
      let usdPrice = null;
      if (
        priceIndex !== -1 &&
        usdPriceResults?.[priceIndex]?.status === "success"
      ) {
        const result = usdPriceResults[priceIndex].result;
        usdPrice = { dollars: Number(result[0]), cents: Number(result[1]) };
      }
      return { ...game, usdPrice };
    });

    setFinalGames(enrichedGames);
    setStatus("");
  }, [usdPriceResults, gamesWithMetadata, isLoadingUsd]);

  // === Handler for the 'buygame' transaction ===
  const handleBuyGame = (gameAddress, gamePrice) => {
    setTxStatus("");
    writeContract({
      address: gameAddress,
      abi: gameInstanceAbi,
      functionName: "buygame",
      value: parseEther(gamePrice.toString()),
    });
  };

  // Effect to manage user-facing status messages
  useEffect(() => {
    if (!account.isConnected)
      setStatus("Please connect your wallet to see the games.");
    else if (isLoadingGames) setStatus("Finding all games...");
    else if (isLoadingDetails) setStatus("Fetching game details...");
    else if (finalGames.length === 0 && !isLoadingGames && !isLoadingDetails)
      setStatus("No games found.");
  }, [account.isConnected, isLoadingGames, isLoadingDetails, finalGames]);

  // Effect to manage transaction status messages
  useEffect(() => {
    if (isPending) setTxStatus("Waiting for confirmation in your wallet...");
    if (isConfirming)
      setTxStatus(`Transaction pending... Hash: ${hash.slice(0, 10)}...`);
    if (isConfirmed) setTxStatus("Transaction successful!");
    if (writeError)
      setTxStatus(`Error: ${writeError.shortMessage || writeError.message}`);
  }, [isPending, isConfirming, isConfirmed, hash, writeError]);

  return (
    <div className="relative shadow-md px-9 py-8 overflow-hidden gap-4 w-full bg-black flex">
      <div className="flex flex-col border rounded-2xl border-gray-500 overflow-hidden w-full">
        <div className="flex items-center gap-4 w-full p-2 border-b border-b-gray-500">
          <input
            type="text"
            className="flex-grow px-4 py-2 text-xl text-gray-500 outline-none bg-black w-full"
            placeholder="Search for a game..."
          />
        </div>
        {txStatus && (
          <div className="p-4 text-center text-sm text-yellow-300 bg-yellow-900/30">
            {txStatus}
          </div>
        )}
        <div className="flex flex-wrap gap-6 p-6 min-h-[400px]  items-start">
          {status ? (
            <p className="text-gray-400 text-lg">{status}</p>
          ) : (
            finalGames.map((game) => (
              <Game_NFT_COLLECT_CARD
                key={game.contractAddress}
                game={game}
                onBuyGame={handleBuyGame}
                isPurchasePending={isPending || isConfirming}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Game_NFT_Collect_Explorer;
