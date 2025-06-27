import React from "react";
import { AlertTriangle } from "lucide-react";

const CardError = ({ error }) => (
  <div
    className="rounded-2xl bg-red-900/20 text-red-300
               max-w-[400px] h-auto aspect-[9.5/12.5] p-4 flex flex-col items-center justify-center text-center
               border border-solid border-red-500/50"
  >
    <AlertTriangle size={48} className="mb-4 text-red-400" />
    <h3 className="font-bold">Failed to Load NFT</h3>
    <p className="text-xs mt-2 text-red-400/70 break-words">
      {/* Show a user-friendly part of the error message */}
      {error.split(" URL:")[0]}
    </p>
  </div>
);

export default CardError;
