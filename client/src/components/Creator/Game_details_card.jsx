import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  PackagePlus,
  ChevronRight,
  ChevronDown,
  Coins,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { useReadContract, useReadContracts } from "wagmi";
import gameinstanceabi from "../ABI/game_instance.json";
import { formatEther, parseEther } from "viem";

import { MintNFTForm } from "./MintNFTForm.jsx";
import { AddToLootboxForm } from "./AddToLootboxForm.jsx";
import Approve_link from "./Approve link.jsx";
import WithdrawFunds from "./Withdrawal.jsx";
import FundContractButton from "./fundwithlink.jsx";

// A small component for displaying stats to keep the main component cleaner
const StatDisplay = ({ icon, label, value }) => (
  <div className="flex flex-col bg-black/30 backdrop-blur-sm p-3 rounded-lg flex-1 min-w-[120px] border border-gray-700">
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      {icon}
      {label}
    </div>
    <p className="text-lg font-bold text-white mt-1">{value}</p>
  </div>
);

export const GameDetailsCard = ({ contractaddress }) => {
  const [gamedata, setgamedata] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [view, setview] = useState("none");
  const [earningsUsd, setEarningsUsd] = useState({ dollars: 0, cents: 0 });

  // Batch read for initial data
  const { data: initialData, refetch } = useReadContracts({
    contracts: [
      {
        address: contractaddress,
        abi: gameinstanceabi,
        functionName: "getGameCid",
      },
      {
        address: contractaddress,
        abi: gameinstanceabi,
        functionName: "getsoldcopies",
      },
      {
        address: contractaddress,
        abi: gameinstanceabi,
        functionName: "gettotalmintednfts",
      },
      {
        address: contractaddress,
        abi: gameinstanceabi,
        functionName: "getContractBalance",
      },
    ],
  });

  const [gameCid, soldCopies, totalMinted, contractBalance] = initialData || [];

  // A second read, dependent on the first, to get the USD value of earnings
  const { data: usdValueData } = useReadContract({
    address: contractaddress,
    abi: gameinstanceabi,
    functionName: "weiToUsd",
    args: [contractBalance?.result || 0n],
    query: { enabled: !!contractBalance?.result },
  });

  useEffect(() => {
    if (gameCid?.result) {
      fetchGameData(gameCid.result);
    }
    if (usdValueData) {
      setEarningsUsd({
        dollars: Number(usdValueData[0]),
        cents: Number(usdValueData[1]),
      });
    }
  }, [gameCid?.result, usdValueData]);

  const fetchGameData = async (cid) => {
    if (!cid) return;
    try {
      const url = `https://cyan-realistic-swift-995.mypinata.cloud/ipfs/${cid}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error`);
      const json = await res.json();
      setgamedata(json);
    } catch (err) {
      setgamedata({ name: "Failed to load data" });
    }
  };

  const handleview = (item) => {
    if (item === view) setview("none");
    else setview(item);
  };

  const earningsEth = contractBalance?.result
    ? formatEther(contractBalance.result)
    : "0.0";
  const formattedEarningsUsd = `$${earningsUsd.dollars}.${earningsUsd.cents
    .toString()
    .padStart(2, "0")}`;
  const imageUrl = gamedata?.image
    ? `https://cyan-realistic-swift-995.mypinata.cloud/ipfs/${gamedata.image}`
    : "";

  return (
    <div className="group w-full max-w-5xl bg-[#1a1a1a] border border-gray-800 rounded-2xl text-white shadow-xl transition-all duration-300 hover:border-white/50">
      {/* Header Row */}
      <div
        className="flex justify-between items-center p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h2 className="text-2xl font-bold text-white">
            {gamedata?.name || "Loading..."}
          </h2>
          <p className="font-mono text-xs text-gray-500">{contractaddress}</p>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 pt-0">
          {/* Blended Background and Content Container */}
          <div className="relative rounded-xl overflow-hidden p-6 border border-gray-800">
            {/* Background Image & Gradient */}
            <div className="absolute inset-0 z-0">
              <img
                src={imageUrl}
                alt="Game background"
                className="object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#1a1a1a] to-transparent"></div>
            </div>

            {/* Content on top of the blended background */}
            <div className="relative z-10">
              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatDisplay
                  icon={<Users size={16} />}
                  label="Copies Sold"
                  value={`${Number(soldCopies?.result || 0)} / ${
                    gamedata?.copies || 0
                  }`}
                />
                <StatDisplay
                  icon={<TrendingUp size={16} />}
                  label="Total NFTs"
                  value={`${Number(totalMinted?.result || 0)}`}
                />
                <StatDisplay
                  icon={<Coins size={16} />}
                  label="Earnings (ETH)"
                  value={earningsEth}
                />
                <StatDisplay
                  icon={<DollarSign size={16} />}
                  label="Earnings (USD)"
                  value={formattedEarningsUsd}
                />
              </div>

              {/* Actions Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">
                  Game Management
                </h3>
                <div className="flex flex-col gap-4">
                  {/* Financial Actions Row */}
                  <div className=" p-4 rounded-lg flex flex-col md:flex-row gap-3">
                    <FundContractButton
                      contractaddress={contractaddress}
                      amountInLink={10}
                    />
                    <Approve_link contractaddress={contractaddress} />
                    <WithdrawFunds contractaddress={contractaddress} />
                  </div>
                  {/* Minting and Lootbox Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleview("mint")}
                      className={`flex items-center justify-center gap-2 border w-full py-2 px-4 rounded-lg transition-colors duration-300 ${
                        view === "mint"
                          ? "bg-white text-black border-white"
                          : " border-gray-600 hover:bg-white hover:text-black"
                      }`}
                    >
                      <PlusCircle size={18} /> Mint New NFT
                    </button>
                    <button
                      onClick={() => handleview("lootbox")}
                      className={`flex items-center justify-center gap-2 border w-full py-2 px-4 rounded-lg transition-colors duration-300 ${
                        view === "lootbox"
                          ? "bg-white text-black border-white"
                          : " border-gray-600 hover:bg-white hover:text-black"
                      }`}
                    >
                      <PackagePlus size={18} /> Add to Lootbox
                    </button>
                  </div>
                </div>

                {/* Conditional Form Display */}
                <div className="mt-6">
                  {view === "mint" && (
                    <div className="p-4 rounded-lg ">
                      <MintNFTForm contractaddress={contractaddress} />
                    </div>
                  )}
                  {view === "lootbox" && (
                    <div className=" p-4 rounded-lg">
                      <AddToLootboxForm contractaddress={contractaddress} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
