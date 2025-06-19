import { ArrowRightCircle, CornerDownLeft, XIcon } from "lucide-react";
import React from "react";

function Make_Offer_popup({ NFT_data, setIsMakeOffer }) {
  return (
    <>
      <div className="fixed left-0 top-0 w-full h-[100%] backdrop-blur-sm z-30">
        <div className="w-[600px] h-auto bg-[#171c25] absolute left-1/2 top-1/2 -translate-1/2  z-2 border border-gray-500 rounded-2xl shadow-md px-9 py-8 overflow-hidden  ">
          <XIcon
            onClick={() => {
              setIsMakeOffer(false);
            }}
            className="absolute right-5 top-5 text-white cursor-pointer transition-all hover:rotate-180"
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-2xl text-white">
                {NFT_data?.name}
              </h1>
              <div className=" flex justify-between">
                <p className="text-gray-500 cursor-pointer hover:text-blue-500 hover:underline">
                  {NFT_data?.origin}
                </p>
                <ArrowRightCircle color="#6a7282" />
                <p className="text-gray-500 cursor-pointer hover:text-blue-500 hover:underline">
                  {NFT_data?.owner}
                </p>
              </div>
            </div>
            <div className="text-gray-700 mx-auto truncate">
              ______________________________________________________________
            </div>
            {/* input 1 */}
            <div className="flex flex-col gap-2 ">
              <h1 className="font-bold text-white text-xl flex gap-3 py-2">
                Price{" "}
                <CornerDownLeft
                  className="-rotate-90 self-end"
                  color="#4a5565"
                  strokeWidth={0.75}
                />
              </h1>
              <div className="flex border border-gray-400 px-5 py-4 rounded-2xl overflow-hidden">
                <input
                  type="number"
                  className="w-full text-2xl text-white px-5 outline-none font-thin "
                  placeholder="enter the offer"
                  step={0.1}
                />
                <h1 className="text-2xl text-white select-none ">Eth</h1>
              </div>

              {/* for time */}

              <div className="flex flex-col gap-2 ">
                <h1 className="font-bold text-white text-xl flex gap-3 py-2">
                  Duration{" "}
                  <CornerDownLeft
                    className="-rotate-90 self-end"
                    color="#4a5565"
                    strokeWidth={0.75}
                  />
                </h1>
                <div className="flex border border-gray-400 px-5 py-4 rounded-2xl overflow-hidden">
                  <select className="w-full text-2xl text-white px-5 outline-none font-thin cursor-pointer ">
                    <option value={1}>{"1 week"}</option>
                    <option value={2}>{"2 week"}</option>
                    <option value={3}>{"3 week"}</option>
                    <option value={4}>{"4 week"}</option>
                  </select>
                </div>
              </div>

              <div className="text-gray-700 mx-auto truncate">
                ______________________________________________________________
              </div>
              <div className="flex justify-between w-full  ">
                <h1 className="text-white font-bold text-xl select-none ">
                  You pay
                </h1>
                <p className="text-gray-300 select-none ">
                  <span className="font-bold text-white select-none ">
                    {".0202 "}{" "}
                  </span>{" "}
                  Eth
                </p>
              </div>
              <div className="text-gray-700 mx-auto truncate">
                ______________________________________________________________
              </div>

              {/* end */}
              <button
                onClick={() => {
                  setIsMakeOffer(false);
                }}
                className="w-full bg-blue-500 px-5 py-4 cursor-pointer font-bold text-2xl text-white rounded-xl select-none
                hover:bg-blue-700
              "
              >
                Make offer
              </button>
              {/* <h1 className="text-red-500">
                this is supposed to open in manual data feeding
              </h1> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Make_Offer_popup;
