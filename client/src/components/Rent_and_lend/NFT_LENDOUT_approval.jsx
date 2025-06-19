import { ArrowRightCircle, CornerDownLeft, XIcon } from "lucide-react";
import React from "react";

function NFT_LENDOUT_approval({ set_show_lend_approval, nft_action_data }) {
  return (
    <>
      <div className="fixed left-0 top-0 w-full h-[100%] backdrop-blur-sm z-30">
        <div className="w-[600px] h-auto bg-[#171c25] absolute left-1/2 top-1/2 -translate-1/2  z-2 border border-gray-500 rounded-2xl shadow-md px-9 py-8 overflow-hidden  ">
          <XIcon
            onClick={() => set_show_lend_approval(false)}
            className="absolute right-5 top-5 text-white cursor-pointer transition-all hover:rotate-180"
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-2xl text-white">
                {nft_action_data?.name}
              </h1>
              <div className=" flex justify-between">
                <p className="text-gray-500 cursor-pointer hover:text-blue-500 hover:underline">
                  {nft_action_data?.origin}
                </p>
                <ArrowRightCircle color="#6a7282" />
                <p className="text-gray-500 cursor-pointer hover:text-blue-500 hover:underline">
                  {nft_action_data?.owner}
                </p>
              </div>
            </div>

            {/* input 1 */}

            {/* for time */}
            {/* end */}
            <button
              onClick={() => {
                set_show_lend_approval(false);
              }}
              className="w-full bg-blue-500 px-5 py-4 cursor-pointer font-bold text-2xl text-white rounded-xl select-none
                hover:bg-blue-700
              "
            >
              Share NFT
            </button>
            <p className="text-sm text-center text-gray-400">
              You are lending out your NFT. It can be redeemed back anytime!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default NFT_LENDOUT_approval;
