import React, { useState } from "react";
import NFT_notification_table_row from "./NFT_notification_table_row";
import Lend_request_popup from "./Lend_request_popup";
import NFT_LENDOUT_approval from "./NFT_LENDOUT_approval";
let NFT_DATA_RAW = {
  "order type": "",
  "Ask Price": 0,
  user: "",
};

function NFT_Notification_action_table() {
  const [nft_action_data, set_nft_action_data] = useState(NFT_DATA_RAW);
  const [show_lend_approval, set_show_lend_approval] = useState(false);
  const [show_rent_approval, set_show_rent_approval] = useState(false);

  return (
    <>
      {show_lend_approval && (
        <NFT_LENDOUT_approval
          nft_action_data={nft_action_data}
          set_show_lend_approval={set_show_lend_approval}
        />
      )}
      <div className="flex flex-col border border-gray-600 mx-20 pb-4 h-[700px] rounded-2xl">
        <div className="grid grid-cols-6 gap-5 text-white  border-b border-b-gray-500 py-4  w-full items-center">
          <p className="border-r border-r-gray-600 px-4">NFT</p>

          <p className="border-r border-r-gray-600 px-4">Order type</p>
          <p className="border-r border-r-gray-600 px-4">Duration</p>
          <p className="border-r border-r-gray-600 px-4">Ask price</p>
          <p className="border-r border-r-gray-600 px-4">User</p>
          <p>Action</p>
        </div>
        <NFT_notification_table_row
          set_nft_action_data={set_nft_action_data}
          set_show_lend_approval={set_show_lend_approval}
          set_show_rent_approval={set_show_rent_approval}
        />
        <NFT_notification_table_row
          set_nft_action_data={set_nft_action_data}
          set_show_lend_approval={set_show_lend_approval}
          set_show_rent_approval={set_show_rent_approval}
        />
        <NFT_notification_table_row
          set_nft_action_data={set_nft_action_data}
          set_show_lend_approval={set_show_lend_approval}
          set_show_rent_approval={set_show_rent_approval}
        />
        <NFT_notification_table_row
          set_nft_action_data={set_nft_action_data}
          set_show_lend_approval={set_show_lend_approval}
          set_show_rent_approval={set_show_rent_approval}
        />
      </div>
    </>
  );
}

export default NFT_Notification_action_table;
