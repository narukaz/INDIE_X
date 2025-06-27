import React from "react";
import NFT_notification_table_row from "./NFT_notification_table_row";

// This component now accepts isNftRented to disable actions when needed
function NFT_Notification_action_table({
  rentalRequests,
  nftTokenId,
  nftContractAddress,
  nftOwner,
  isNftRented, // <-- NEW PROP
}) {
  return (
    <div className="flex flex-col border border-gray-600 mx-4 md:mx-20 pb-4 rounded-2xl bg-slate-900/50 overflow-hidden">
      <div className="grid grid-cols-5 gap-5 text-white border-b border-b-gray-500 py-4 w-full items-center sticky top-0 bg-[#171c25] px-4">
        <p className="border-r border-r-gray-600 pr-4 font-semibold">
          Requester
        </p>
        <p className="border-r border-r-gray-600 px-4 font-semibold">
          Offer Price
        </p>
        <p className="border-r border-r-gray-600 px-4 font-semibold">
          Duration
        </p>
        <p className="border-r border-r-gray-600 px-4 font-semibold">
          Expires In
        </p>
        <p className="px-4 font-semibold text-center">Action</p>
      </div>

      <div className="overflow-y-auto h-[600px]">
        {rentalRequests && rentalRequests.length > 0 ? (
          rentalRequests.map((request, index) => (
            <NFT_notification_table_row
              key={index}
              requestData={request}
              requestIndex={index}
              tokenId={nftTokenId}
              contractAddress={nftContractAddress}
              nftOwner={nftOwner}
              isNftRented={isNftRented} // <-- PASS PROP DOWN
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">
              No pending rental requests for this NFT.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NFT_Notification_action_table;
