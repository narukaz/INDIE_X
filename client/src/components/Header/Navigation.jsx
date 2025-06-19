import React from "react";
import Indie_heaven from "../../assets/Indie_heaven.svg";
import menuItems, { sub_menu_items } from "../../config/menuConfig";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
function Navigation() {
  const navigate = useNavigate();
  return (
    <div
      className="backdrop-blur-sm border border-b-gray-800 w-[100%] flex bg-gradient-to-b from-[#06021d] to-transparent px-6 py-4
    items-center justify-start  fixed top-0 left-0 gap-5 z-20  hover:border-b-1 hover:border-b-amber-50 transition-all"
    >
      <img
        onClick={() => {
          navigate("/home");
        }}
        src={Indie_heaven}
        className="w-[150px] px-4 py-2 cursor-pointer"
      />
      <div className="px-4 py-2 flex gap-6 items-center text-white  ">
        {menuItems.map((item, index) => (
          <h3
            onClick={() => navigate(item?.link)}
            key={index}
            className="flex gap-2  group items-center select-none cursor-pointer hover:text-blue-400 font-light relative"
          >
            {item?.title}
            <span>
              <ChevronDown className="group-hover:rotate-180 transition-all ease-out delay-75" />
            </span>
            {/* <Sub_Menu_popup
              className="group-hover:block backdrop-blur-2xl"
              sub_menu_items={sub_menu_items[index]}
            /> */}
          </h3>
        ))}
      </div>

      <div className="py-2 ml-auto flex gap-5 items-center">
        <ConnectButton
          accountStatus="avatar"
          label="Connect Wallet"
          showBalance={true}
        />
      </div>
    </div>
  );
}

export default Navigation;
