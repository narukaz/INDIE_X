import React from "react";
import { ArrowRightCircle, CornerDownLeft, XIcon } from "lucide-react";

function Lend_request_popup({
  set_show_lend_approval,
  nft_action_data,
  setIsLendOffer,
}) {
  return (
    <div className="fixed inset-0 z-30 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-xl bg-[#171c25] border border-gray-500 rounded-2xl shadow-md px-8 py-6 relative">
        {/* Close Button */}
        <XIcon
          onClick={() => setIsLendOffer(false)}
          className="absolute right-4 top-4 text-white cursor-pointer transition-transform hover:rotate-180"
        />

        <div className="flex flex-col gap-6">
          {/* NFT Title and Route */}
          <div className="flex flex-col gap-3">
            <h1 className="font-bold text-2xl text-white">
              {nft_action_data?.name || "Test"}
            </h1>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <p className="hover:text-blue-500 hover:underline cursor-pointer">
                {nft_action_data?.origin || "test"}
              </p>
              <ArrowRightCircle className="text-gray-500" />
              <p className="hover:text-blue-500 hover:underline cursor-pointer">
                {nft_action_data?.owner || "test"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-600" />

          {/* Input Field */}
          <div className="flex flex-col gap-3">
            <label className="text-white font-semibold text-lg flex items-center gap-2">
              Wallet address
              <CornerDownLeft
                className="-rotate-90 text-gray-500"
                size={18}
                strokeWidth={1}
              />
            </label>

            <div className="rounded-xl border border-gray-500 bg-[#1f2735] px-4 py-3">
              <input
                type="text"
                placeholder="Please input the user address"
                className="w-full bg-transparent text-white text-lg placeholder:text-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => set_show_lend_approval(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 py-3 rounded-xl text-white font-bold text-lg"
          >
            Approve sharing
          </button>

          {/* Info Text */}
          <p className="text-sm text-center text-gray-400">
            You are lending out your NFT. It can be redeemed back anytime!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Lend_request_popup;
