import React from "react";

export default function NFT_notification_table_row({
  set_show_lend_approval,
  set_show_rent_approval,
  set_nft_action_data,
}) {
  return (
    <div className="grid grid-cols-6 items-center text-white py-2 gap-5 border border-gray-700">
      <div className=" px-4 border-r border-r-gray-700 overflow-hidden">
        <img alt="nft image" className="mx-2" />
      </div>

      <p className="border-r border-r-gray-700 px-4">Lend Out</p>
      <p className="border-r border-r-gray-700 px-4">7</p>
      <p className="border-r border-r-gray-700 px-4">0.402 Eth</p>
      <p className="border-r border-r-gray-700 select-none cursor-pointer px-4">
        0x25256...124567
      </p>
      <button
        onClick={() => {
          set_show_lend_approval(true);
          set_nft_action_data({
            name: "somethingnft",
            "order type": "Lend out",
            "Ask Price": 1,
            owner: "0xkjaskdfhj234jhk23h4",
            origin: "some game",
          });
        }}
        className="text-white font-semibold border border-green-700 py-4 mx-2 rounded-2xl cursor-pointer"
      >
        Lend out
      </button>
    </div>
  );
}
