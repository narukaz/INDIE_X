import React from "react";

// A dependency-free helper function to format Wei (as a BigInt) into an ETH string
const formatEtherSimple = (wei) => {
  // Return "0" if the input is not a valid BigInt
  if (!wei || typeof wei !== "bigint") return "0";

  // The base for conversion (1 ETH = 10^18 Wei)
  const base = 10n ** 18n;
  const whole = wei / base;
  const fraction = wei % base;

  // If there's no fractional part, just return the whole number
  if (fraction === 0n) {
    return whole.toString();
  }

  // Otherwise, format the fractional part
  // 1. Convert the fraction to a string
  // 2. Pad it with leading zeros to ensure it has 18 digits
  // 3. Remove any trailing zeros for a cleaner look (e.g., 0.5 instead of 0.500)
  const fractionStr = fraction.toString().padStart(18, "0").replace(/0+$/, "");

  return `${whole}.${fractionStr}`;
};

function LootBoxSlide({ game, onOpenLootBox, isPurchasePending }) {
  const {
    imageUrl,
    name: gameName,
    description,
    lootBoxPrice,
    contractAddress,
  } = game;

  const handleButtonClick = () => {
    if (!isPurchasePending) {
      onOpenLootBox(contractAddress, lootBoxPrice);
    }
  };

  // Now uses the dependency-free helper function
  const buttonText = `Open for ${formatEtherSimple(lootBoxPrice)} ETH`;

  return (
    <div className="relative w-full h-[650px]">
      {/* Background Image */}
      <img
        src={imageUrl}
        alt="Lootbox promotion"
        className="inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay + Content (as per your design) */}
      <div className="absolute left-0 top-0 bg-gradient-to-r from-black via-black/80 to-transparent px-10 w-full md:w-1/2 h-full flex flex-col justify-center items-start gap-4 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {`Open ${gameName}'s Loot Box`}
        </h1>

        <p className="text-lg md:text-xl font-light text-gray-300 leading-relaxed select-none">
          {`Get a chance to win exclusive, rare, and legendary skins from the ${gameName} collection! Each box contains one random NFT.`}
        </p>
        <div className="mt-4 flex gap-4 w-full">
          <button
            onClick={handleButtonClick}
            disabled={isPurchasePending}
            className="cursor-pointer hover:scale-105 w-auto
              px-12 py-3 bg-white text-black font-semibold text-xl bg-opacity-80 rounded-lg hover:bg-opacity-100 transition disabled:bg-gray-500 disabled:cursor-wait"
          >
            {isPurchasePending ? "Processing..." : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LootBoxSlide;
