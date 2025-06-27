import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, LucideGamepad2, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContracts } from "wagmi";

// Import the updated card and necessary ABIs/data
import NFTGamesCard from "../game_card/NFTGamesCard";
import masterabi from "../ABI/master.json";
import { mastercontract } from "../contractdata.json";
import gameInstanceAbi from "../ABI/game_instance.json";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
const MAX_GAMES_TO_FETCH = 4; // We only need the first 4 for the showcase
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function Game_Show_case() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  // State for the fetched and processed game data
  const [trendingGames, setTrendingGames] = useState([]);
  const [status, setStatus] = useState("Initializing...");

  // --- STEP 1: Fetch the first 4 game addresses ---
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
    return gameAddressResults
      .filter(
        (result) =>
          result.status === "success" && result.result !== ZERO_ADDRESS
      )
      .map((result) => result.result);
  }, [gameAddressResults]);

  // --- STEP 2: For each game address, fetch its CID ---
  const gameCidContracts = useMemo(() => {
    if (gameAddresses.length === 0) return [];
    return gameAddresses.map((addr) => ({
      address: addr,
      abi: gameInstanceAbi,
      functionName: "getGameCid",
    }));
  }, [gameAddresses]);

  const { data: gameCidResults, isLoading: isLoadingCids } = useReadContracts({
    contracts: gameCidContracts,
    query: { enabled: gameAddresses.length > 0 },
  });

  // --- STEP 3: Fetch metadata from IPFS and set the final state ---
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!gameCidResults || gameCidResults.length === 0) return;

      const gamesWithCids = gameAddresses.map((address, index) => ({
        contractAddress: address,
        cid: gameCidResults[index]?.result,
      }));

      const promises = gamesWithCids.map(async (game) => {
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
      setTrendingGames(enrichedGames);
    };

    fetchMetadata();
  }, [gameCidResults, gameAddresses]);

  // Manage loading status message
  useEffect(() => {
    if (isLoadingGames || isLoadingCids) {
      setStatus("Finding trending games...");
    } else if (trendingGames.length === 0) {
      setStatus("No trending games found right now.");
    } else {
      setStatus("");
    }
  }, [isLoadingGames, isLoadingCids, trendingGames]);

  return (
    <div className="relative w-full flex flex-col gap-9 px-6 py-8 ">
      <h1
        onClick={() => navigate("/home/explore_trending_game_nft")}
        className="pl-12 hover:pl-20 pr-5 bg-white w-max py-3 rounded-3xl text-2xl text-black font-bold flex items-center gap-3 hover:text-blue-400 cursor-pointer select-none group transition-all"
      >
        <LucideGamepad2 className="text-black transition-all ease-out group-hover:text-blue-500" />
        Trending Games
        <span>
          <ChevronRight size={20} className="group-hover:ml-7 transition-all" />
        </span>
      </h1>
      <div className="flex w-full gap-5  pb-4">
        {status ? (
          <div className="text-gray-400 flex items-center gap-2 mt-[100px]">
            <LoaderCircle className="animate-spin" />
            {status}
          </div>
        ) : (
          trendingGames.map((game, index) => (
            <NFTGamesCard key={game.contractAddress || index} game={game} />
          ))
        )}
      </div>
    </div>
  );
}

export default Game_Show_case;
