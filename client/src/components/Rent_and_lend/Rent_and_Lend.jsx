import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"; // Hook to read URL parameters
import { useReadContracts } from "wagmi";
import { Clock, LoaderCircle } from "lucide-react";

// Import your child components and ABIs
import NFT_Make_offer from "./NFT_Make_offer";
import NFTGameOriginRow from "./NFT_game_origin_row";
import NFT_Notification_action_table from "./NFT_Notification_action_table";
import Make_Offer_popup from "./Make_Offer_popup";
import gameinstanceabi from "../ABI/game_instance.json";

const PINATA_GATEWAY_URL =
  "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";

// --- UPDATED: CountdownTimer component now refreshes the page on completion ---
const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime || endTime <= 0) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime() / 1000; // current time in seconds
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (60 * 60 * 24));
        const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);
        const seconds = Math.floor(difference % 60);

        setTimeLeft({
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        setIsExpired(true);
        // NEW: Refresh the page when the timer expires
        window.location.reload();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Clock size={16} />
        <h3 className="font-semibold text-sm">
          {isExpired ? "Rental Expired" : "Time Remaining"}
        </h3>
      </div>
      <div className="flex justify-around text-center text-white">
        <div>
          <p className="text-3xl font-thin">{timeLeft.days}</p>
          <p className="text-xs text-slate-400">Days</p>
        </div>
        <div>
          <p className="text-3xl font-thin">{timeLeft.hours}</p>
          <p className="text-xs text-slate-400">Hours</p>
        </div>
        <div>
          <p className="text-3xl font-thin">{timeLeft.minutes}</p>
          <p className="text-xs text-slate-400">Minutes</p>
        </div>
        <div>
          <p className="text-3xl font-thin">{timeLeft.seconds}</p>
          <p className="text-xs text-slate-400">Seconds</p>
        </div>
      </div>
    </div>
  );
};

// The main component for the NFT Details Page
function Rent_and_Lend() {
  // --- 1. GETTING PARAMS & MANAGING STATE ---
  const { contractAddress, tokenId } = useParams();
  const [isMakeOffer, setIsMakeOffer] = useState(false);
  const [nftDetails, setNftDetails] = useState(null);
  const [gameMetadata, setGameMetadata] = useState({
    name: "Loading...",
    image: "",
  });
  const [rentalRequests, setRentalRequests] = useState([]);

  // --- 2. EFFICIENT BATCH DATA FETCHING ---
  const nftContractCalls = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    const bigIntTokenId = BigInt(tokenId);

    return [
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "tokenCIDs",
        args: [bigIntTokenId],
      },
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "skinDetails",
        args: [bigIntTokenId],
      },
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "skinOwner",
        args: [bigIntTokenId],
      },
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "getGameCid",
      },
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "getRentalRequests",
        args: [bigIntTokenId],
      },
      {
        address: contractAddress,
        abi: gameinstanceabi,
        functionName: "getRentalTimeDetails",
        args: [bigIntTokenId],
      },
    ];
  }, [contractAddress, tokenId]);

  const {
    data: results,
    isLoading,
    isError,
  } = useReadContracts({
    contracts: nftContractCalls,
    query: { enabled: !!contractAddress && !!tokenId },
  });

  // --- 3. PROCESSING FETCHED DATA ---
  useEffect(() => {
    if (results && results.every((r) => r.status === "success")) {
      const [
        cidResult,
        skinDetailsResult,
        skinOwnerResult,
        gameCidResult,
        rentalRequestsResult,
        rentalTimeResult,
      ] = results.map((r) => r.result);

      const isRentalActive = rentalTimeResult?.[2] || false;
      // NEW: Adding 20 seconds to the calculated end time
      const rentalEndTime = rentalTimeResult
        ? Number(rentalTimeResult[0]) + Number(rentalTimeResult[1]) + 20
        : 0;

      const details = {
        contractAddress,
        tokenId,
        cid: cidResult,
        price: skinDetailsResult[0],
        skinType: skinDetailsResult[1],
        currentOwner: skinOwnerResult,
        gameCid: gameCidResult,
        isRentalActive,
        rentalEndTime,
      };

      setNftDetails(details);
      setRentalRequests(rentalRequestsResult || []);
    }
  }, [results, contractAddress, tokenId]);

  // --- 4. FETCHING GAME METADATA FROM IPFS ---
  useEffect(() => {
    if (nftDetails?.gameCid) {
      const fetchGameMetadata = async () => {
        try {
          const response = await fetch(
            `${PINATA_GATEWAY_URL}${nftDetails.gameCid}`
          );
          const data = await response.json();
          setGameMetadata({
            name: data.name || "Unknown Game",
            image: data.image || "",
          });
        } catch (error) {
          setGameMetadata({ name: "Unknown Game", image: "" });
        }
      };
      fetchGameMetadata();
    }
  }, [nftDetails?.gameCid]);

  // --- UI & RENDERING ---
  const gatewayURL = "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/";
  const mainImageUrl = nftDetails?.cid ? `${gatewayURL}${nftDetails.cid}` : "";
  const gameImageUrl = gameMetadata?.image
    ? `${gatewayURL}${gameMetadata.image}`
    : "";

  if (isLoading) {
    return (
      <div className="text-white text-center text-2xl mt-48 flex items-center justify-center gap-4">
        <LoaderCircle className="animate-spin" /> Loading NFT Details...
      </div>
    );
  }

  if (isError || !nftDetails) {
    return (
      <div className="text-red-500 text-center text-2xl mt-48">
        Failed to load NFT details. Please check the address and token ID.
      </div>
    );
  }

  return (
    <>
      {isMakeOffer && (
        <Make_Offer_popup
          NFT_data={nftDetails}
          setIsMakeOffer={setIsMakeOffer}
        />
      )}

      <div className="flex flex-col gap-3 mt-24 w-full ">
        <div className="flex flex-col md:flex-row gap-4 px-4 sm:px-10 md:px-20 py-8">
          {/* Main NFT Image */}
          <div className="flex-shrink-0 w-full md:w-[450px] lg:w-[500px] h-[400px] md:h-[500px]">
            <img
              src={mainImageUrl}
              alt={`NFT Skin #${tokenId}`}
              className="rounded-xl bg-slate-800 w-full h-full object-cover border border-slate-700"
            />
          </div>

          {/* Details & Actions Column */}
          <div className="flex flex-col gap-5 w-full ">
            {nftDetails.isRentalActive && (
              <CountdownTimer endTime={nftDetails.rentalEndTime} />
            )}

            <NFT_Make_offer
              setIsMakeOffer={setIsMakeOffer}
              currentOwner={nftDetails.currentOwner}
              gameName={gameMetadata.name}
            />
            <NFTGameOriginRow
              contractAddress={nftDetails.contractAddress}
              currentOwner={nftDetails.currentOwner}
              gameImageUrl={gameImageUrl}
            />
          </div>
        </div>

        <NFT_Notification_action_table
          rentalRequests={rentalRequests}
          nftTokenId={tokenId}
          nftContractAddress={contractAddress}
          nftOwner={nftDetails.currentOwner}
          isNftRented={nftDetails.isRentalActive}
        />
      </div>
    </>
  );
}

export default Rent_and_Lend;
