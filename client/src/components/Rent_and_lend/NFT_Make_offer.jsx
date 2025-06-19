import { HandCoins, HandHeart, Hourglass } from "lucide-react";
import React from "react";

function NFT_Make_offer({ setIsMakeOffer, setIsLendOffer }) {
  return (
    <div className="w-full mx-auto bg-[#171c25] border border-gray-500 rounded-xl shadow-md px-5 py-4 flex flex-col gap-5 ">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-white select-none">
          NFT Details
        </h2>
        <div className="flex bg-gray-700 rounded-4xl px-5 items-center ">
          <p className="text-gray-500 select-none">
            {"Owner by: "}
            <span className="text-gray-100">0x9aC...443d</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={() => setIsMakeOffer(true)}
          className=" px-3 py-2 bg-[#1f2937] rounded-xl font-medium hover:bg-blue-600 text-gray-300 hover:text-white w-full items-center justify-center cursor-pointer flex gap-2 border border-gray-600 transition-all duration-200 ease-in-out"
        >
          Rent In
          <Hourglass
            strokeWidth={1.2}
            size={19}
            className="text-white hover:text-white transition-colors duration-200 ease-in-out"
          />
        </button>

        <button
          onClick={() => setIsLendOffer(true)}
          className=" px-3 py-2 rounded-xl  bg-gray-900 font-normal hover:bg-pink-600 text-gray-300 hover:text-white w-full items-center justify-center cursor-pointer flex gap-2 border border-gray-600  transition-all duration-200 ease-in-out "
        >
          Lend In
          <HandHeart color="#ffffff" strokeWidth={0.75} />
        </button>
      </div>
    </div>
  );
}

export default NFT_Make_offer;
