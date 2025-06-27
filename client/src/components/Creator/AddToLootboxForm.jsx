import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import gameinstanceabi from "../ABI/game_instance.json";
import { ArrowLeft, LoaderCircle } from "lucide-react";

export const AddToLootboxForm = ({ contractaddress }) => {
  const [tokenIds, setTokenIds] = useState("");

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleAdd = (e) => {
    e.preventDefault();
    const idArray = tokenIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (idArray.length === 0) {
      alert("Please enter valid, comma-separated Token IDs.");
      return;
    }

    writeContract({
      address: contractaddress,
      abi: gameinstanceabi,
      functionName: "addSkinsToLootBox",
      args: [idArray],
    });
  };

  return (
    <div className="w-full  mx-auto flex flex-col animate-fade-in-down px-6 py-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Add NFTs to Lootbox</h2>
      </div>

      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label
            htmlFor="tokenIds"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Token IDs
          </label>
          <textarea
            id="tokenIds"
            value={tokenIds}
            onChange={(e) => setTokenIds(e.target.value)}
            placeholder="Enter Token IDs, separated by commas (e.g., 1, 5, 12)"
            className="w-full h-24 bg-[#000000] border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className=" border border-gray-400 cursor-pointer hover:border-white disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            {isPending && <LoaderCircle size={18} className="animate-spin" />}
            {isPending ? "Confirming..." : "Add to Lootbox"}
          </button>
        </div>

        {isConfirming && (
          <p className="text-sm text-yellow-400 text-right">
            Waiting for transaction confirmation...
          </p>
        )}
        {isConfirmed && (
          <p className="text-sm text-green-400 text-right">
            Successfully added to lootbox!
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
