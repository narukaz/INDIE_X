import React from "react";

function NFTDetails({ nft }) {
  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* NFT Preview */}
      <img
        src={nft.image}
        alt={nft.name}
        className="w-full rounded-xl mb-6 object-cover"
      />

      {/* Title & Creator */}
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold">{nft.name}</h1>
        <p className="text-sm text-gray-500">
          by <span className="font-medium">{nft.creator}</span>
        </p>
      </div>

      {/* Price & Availability */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-2xl font-bold">{nft.price} ETH</p>
          <p className="text-sm text-gray-500">Floor price</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold shadow-md">
          Buy Now
        </button>
      </div>

      {/* Owner, Token ID & Traits */}
      <div className="divide-y divide-gray-200">
        <div className="py-3 flex justify-between">
          <span className="text-gray-600">Owner</span>
          <span className="font-medium">{nft.owner}</span>
        </div>
        <div className="py-3 flex justify-between">
          <span className="text-gray-600">Token ID</span>
          <span className="font-medium">{nft.tokenId}</span>
        </div>
        <div className="py-3">
          <h2 className="text-gray-700 mb-2 font-semibold">Traits</h2>
          <div className="flex flex-wrap gap-2">
            {nft.traits.map((trait) => (
              <span
                key={trait.type}
                className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-800"
              >
                {trait.type}: {trait.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h2 className="font-semibold text-gray-700 mb-2">Description</h2>
        <p className="text-gray-600 leading-relaxed">{nft.description}</p>
      </div>
    </div>
  );
}

export default NFTDetails;
