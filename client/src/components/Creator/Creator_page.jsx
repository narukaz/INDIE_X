import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import masterabi from "../ABI/master.json";
import { GameDetailsCard } from "./Game_details_card";
import contractdata from "../contractdata.json";
import { LoaderCircle, FileUp, CheckCircle } from "lucide-react";
import { parseEther, formatEther } from "viem";

// ABI for the Chainlink Price Feed from your contract
const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
// The ETH/USD Price Feed address from your contract (for Sepolia)
const ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

// --- Notification Component (Unchanged) ---
const Notification = ({ notification, onClear }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (notification && notification.message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClear, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClear]);
  if (!notification) return null;
  const baseStyle =
    "fixed top-5 right-5 p-4 rounded-lg shadow-2xl text-white transition-all duration-300 ease-in-out z-50";
  const typeStyles = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };
  return (
    <div
      className={`${baseStyle} ${
        typeStyles[notification.type] || "bg-gray-700"
      } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
    >
      <p className="font-semibold">{notification.message}</p>
    </div>
  );
};

// --- Updated Deploy Game Form Component ---
const DeployGameForm = ({ onDeploymentSuccess }) => {
  const [notification, setNotification] = useState(null);
  const [imageCid, setImageCid] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [usdValue, setUsdValue] = useState("0.00"); // State for live USD conversion
  const [copies, setCopies] = useState("");
  const [genres, setGenres] = useState([]);
  const [metaCid, setMetaCid] = useState("");
  const [isPackingMetadata, setIsPackingMetadata] = useState(false);

  const master_contract_address = contractdata.mastercontract;
  const availableGenres = ["Action", "RPG", "Strategy"];

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // NEW: Hook to read the latest ETH price from Chainlink
  const { data: latestPriceData } = useReadContract({
    address: ETH_USD_PRICE_FEED,
    abi: aggregatorV3InterfaceABI,
    functionName: "latestRoundData",
  });

  useEffect(() => {
    if (isPending)
      setNotification({ message: "Awaiting confirmation...", type: "info" });
    if (isConfirming)
      setNotification({
        message: `Deploying... Tx: ${hash.slice(0, 6)}...`,
        type: "info",
      });
    if (isConfirmed) {
      setNotification({
        message: "Contract deployed successfully!",
        type: "success",
      });
      setIsPackingMetadata(false);
      onDeploymentSuccess();
      setName("");
      setPrice("");
      setCopies("");
      setGenres([]);
      setImageCid("");
      setMetaCid("");
      setUsdValue("0.00");
    }
  }, [isPending, isConfirming, isConfirmed, hash, onDeploymentSuccess]);

  // NEW: Effect to calculate USD value when price input changes
  useEffect(() => {
    if (latestPriceData && price) {
      const ethPriceInUsd = Number(latestPriceData[1]) / 1e8; // Price has 8 decimals
      const enteredEth = parseFloat(price);
      if (!isNaN(enteredEth)) {
        const calculatedUsd = (enteredEth * ethPriceInUsd).toFixed(2);
        setUsdValue(calculatedUsd);
      } else {
        setUsdValue("0.00");
      }
    } else {
      setUsdValue("0.00");
    }
  }, [price, latestPriceData]);

  const handleFileChange = async (e) => {
    // This function logic remains the same
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingImage(true);
    setNotification({ message: "Uploading image...", type: "info" });
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("https://indie-x.onrender.com/image", {
      method: "POST",
      body: formData,
    });
    const { assetCid } = await response.json();
    setImageCid(assetCid);
    setNotification({ message: "Image ready!", type: "success" });
    setIsUploadingImage(false);
  };

  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    if (checked) setGenres((prev) => [...prev, value]);
    else setGenres((prev) => prev.filter((g) => g !== value));
  };

  const handlePackAndDeploy = async (e) => {
    // This function logic remains the same
    e.preventDefault();
    if (!imageCid || !name || !price || genres.length === 0 || !copies) {
      setNotification({ message: "Please fill all fields.", type: "error" });
      return;
    }
    setIsPackingMetadata(true);
    setNotification({ message: "Packing metadata...", type: "info" });
    const payload = {
      name,
      price: parseFloat(price),
      image: imageCid,
      type: genres,
      copies,
    };
    const response = await fetch("https://indie-x.onrender.com/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { metaCid: receivedMetaCid } = await response.json();
    if (!receivedMetaCid) {
      setNotification({ message: "Metadata fetch failed!", type: "error" });
      setIsPackingMetadata(false);
      return;
    }
    setMetaCid(receivedMetaCid);
    setNotification({ message: "Confirm deployment in wallet.", type: "info" });
    writeContract({
      abi: masterabi,
      address: master_contract_address,
      functionName: "deployGame",
      args: [receivedMetaCid, genres, Number(copies), parseEther(price)],
    });
  };

  return (
    <div className="bg-[#1c1f26] border border-gray-700 rounded-2xl p-6 space-y-4">
      <Notification
        notification={notification}
        onClear={() => setNotification(null)}
      />
      <h1 className="text-2xl font-semibold text-center text-white">
        Deploy a New Game
      </h1>
      <form onSubmit={handlePackAndDeploy} className="space-y-6">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploadingImage
              ? "border-blue-500"
              : imageCid
              ? "border-pink-500"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            {isUploadingImage ? (
              <LoaderCircle className="w-8 h-8 text-blue-400 animate-spin" />
            ) : imageCid ? (
              <CheckCircle className="w-8 h-8 text-pink-400" />
            ) : (
              <FileUp className="w-8 h-8 text-gray-400" />
            )}
            <p className="mt-2 text-sm text-gray-400">
              {isUploadingImage
                ? "Uploading..."
                : imageCid
                ? "Image Ready!"
                : "Upload Cover Image"}
            </p>
            {imageCid && (
              <p className="text-xs text-gray-500 font-mono mt-1">{`${imageCid.slice(
                0,
                10
              )}...`}</p>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploadingImage}
          />
        </label>

        <fieldset
          disabled={!imageCid || isPackingMetadata || isConfirming}
          className="space-y-4 disabled:opacity-50"
        >
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Game Title
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-gray-600 text-white py-2 px-4 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              placeholder="e.g., Cyber Knights"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                Price (ETH)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black border border-gray-600 text-white py-2 px-4 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                placeholder="0.05"
                step="0.001"
                required
              />
            </div>
            <div>
              <label
                htmlFor="Copies"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                Copies
              </label>
              <input
                type="number"
                id="Copies"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="w-full bg-black border border-gray-600 text-white py-2 px-4 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                placeholder="1000"
                required
              />
            </div>
          </div>
          {/* UPDATED: Live USD price display */}
          <div className="text-right text-sm text-gray-400">
            ≈ ${usdValue} USD
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Genres
            </label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {availableGenres.map((genre, index) => (
                <label
                  key={genre}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={index}
                    onChange={handleGenreChange}
                    checked={genres.includes(index.toString())}
                    className="w-4 h-4 text-pink-600 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-300">{genre}</span>
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!imageCid || isPackingMetadata || isConfirming}
          className="w-full py-3 px-5 font-semibold text-white rounded-lg bg-pink-600 hover:bg-pink-700 focus:ring-4 focus:ring-pink-500 transition disabled:bg-gray-600 flex items-center justify-center"
        >
          {isPending || isConfirming ? (
            <>
              <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            "Deploy Game"
          )}
        </button>
      </form>
    </div>
  );
};

function Creator() {
  const account = useAccount();
  const master_contract_address = contractdata.mastercontract;

  const { data: deployedGames, refetch: refetchDeployedGames } =
    useReadContract({
      address: master_contract_address,
      abi: masterabi,
      functionName: "getMyDeployedGames",
      account: account.address,
    });

  useEffect(() => {
    if (account?.address) refetchDeployedGames();
  }, [account.address, refetchDeployedGames]);

  const handleDeploymentSuccess = () => refetchDeployedGames();

  return (
    <div className="bg-black text-white min-h-screen w-full p-6 mt-[100px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1">
          <DeployGameForm onDeploymentSuccess={handleDeploymentSuccess} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-white border-b border-gray-700 pb-2">
            My Deployed Games
          </h2>
          {account.isConnected ? (
            deployedGames && deployedGames.length > 0 ? (
              deployedGames.map((data, key) => (
                <GameDetailsCard key={key} contractaddress={data} />
              ))
            ) : (
              <div className="text-center py-10 bg-[#1c1f26] rounded-2xl border border-gray-700">
                <p className="text-gray-400">
                  You haven't deployed any games yet.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Use the form on the left to get started.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-10 bg-[#1c1f26] rounded-2xl border border-gray-700">
              <p className="text-gray-400">
                Please connect your wallet to view your games.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Creator;
