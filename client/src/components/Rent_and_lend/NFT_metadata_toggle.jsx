import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // Install lucide-react if not already

export default function NFTMetadataToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const details = [
    { label: "Contract Address", value: "0xde...ce96" },
    { label: "Token ID", value: "4" },
    { label: "Token Standard", value: "ERC-721" },
    { label: "Owner", value: "0x15...776e" },
    { label: "Royalty", value: "5%" },
    { label: "Chain", value: "Ethereum" },
  ];

  return (
    <div className="w-full  mx-auto bg-[#171c25] border border-gray-500 rounded-xl shadow-md  ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-5 py-4 text-left  cursor-pointer "
      >
        <h2 className="text-lg font-semibold text-white">NFT Details</h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-4 space-y-2">
          {details.map((item, index) => (
            <div
              key={index}
              className="flex justify-between text-sm text-white"
            >
              <span className="font-medium">{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
