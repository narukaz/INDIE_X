import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import gameinstanceabi from "../ABI/game_instance.json";
import { LoaderCircle, UploadCloud } from "lucide-react";

export const MintNFTForm = ({ contractaddress, onBack }) => {
  const [nftType, setNftType] = useState("0");
  const [price, setPrice] = useState("");
  const [mintImageCid, setMintImageCid] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNotification({ message: "Uploading NFT image...", type: "info" });
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://indie-x.onrender.com/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed on server.");

      const { assetCid } = await response.json();
      if (!assetCid) throw new Error("Server did not return a CID.");

      setMintImageCid(assetCid);
      setNotification({
        message: "Image successfully uploaded!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        message: `Upload failed: ${err.message}`,
        type: "error",
      });
    }
  };

  const handleMint = (e) => {
    e.preventDefault();
    if (!price || !mintImageCid) {
      setNotification({
        message: "Please fill all fields and upload an image.",
        type: "error",
      });
      return;
    }

    writeContract({
      address: contractaddress,
      abi: gameinstanceabi,
      functionName: "mintSkin",
      args: [nftType, parseEther(price), mintImageCid],
    });
  };

  // The rest of your JSX for the form...
  return (
    <div className="w-full  text-white px-6 py-6 shadow-lg">
      <form onSubmit={handleMint} className="space-y-6">
        {/* NFT Type */}
        <div>
          <label htmlFor="nftType" className="block text-sm mb-1">
            NFT Type
          </label>
          <select
            id="nftType"
            value={nftType}
            onChange={(e) => setNftType(e.target.value)}
            className="w-full bg-[#111417] border border-white/20 rounded-md p-2 focus:ring-white focus:border-white"
          >
            <option value="0">Common</option>
            <option value="1">Epic</option>
            <option value="2">Legendary</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm mb-1">
            Price (in ETH)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 0.05"
            className="w-full bg-[#111417] border border-white/20 rounded-md p-2 focus:ring-white focus:border-white"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-1">NFT Asset</label>
          <label
            htmlFor={`file-upload-${contractaddress}`} // Use a unique ID to prevent conflicts
            className="flex justify-center w-full h-32 px-4 transition bg-[#111417] border-2 border-white/20 border-dashed rounded-md appearance-none cursor-pointer hover:border-white"
          >
            <span className="flex items-center space-x-2">
              <UploadCloud size={24} className="text-gray-400" />
              <span className="text-gray-400">
                {mintImageCid
                  ? `CID: ${mintImageCid.substring(0, 10)}...`
                  : "Drop files to attach, or browse"}
              </span>
            </span>
            <input
              id={`file-upload-${contractaddress}`} // Ensure this ID is unique
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit Button & Status */}
        <div className="flex items-center justify-end gap-4">
          {notification.message && (
            <p
              className={`text-sm ${
                notification.type === "error"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {notification.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !mintImageCid}
            className="bg-white text-black font-bold py-2 px-4 rounded-md hover:bg-white/90 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <LoaderCircle size={18} className="animate-spin" />}
            {isPending ? "Confirming..." : "Mint NFT"}
          </button>
        </div>

        {/* Transaction Status */}
        {isConfirming && (
          <p className="text-sm text-yellow-400 text-right">
            Waiting for transaction confirmation...
          </p>
        )}
        {isConfirmed && (
          <p className="text-sm text-green-400 text-right">
            Transaction confirmed successfully!
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400 text-right">
            Error: {error.shortMessage || error.message}
          </p>
        )}
      </form>
    </div>
  );
};
