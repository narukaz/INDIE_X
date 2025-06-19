import React from "react";
import { Mail, Gamepad2, ShieldCheck, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = ["Collect Games", "Collect NFT", "Rent/Lend NFT's"];

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 w-full text-white p-8 rounded-t-2xl shadow-lg mt-16 ">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck size={20} /> Safe & Verified
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            This is an automated NFT marketplace perfectly safe for trading game
            assets and buying games. All the indie game developers are verified
            and genuine.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Mail size={16} />
            support@indix.fake
          </div>
        </div>

        {/* Menu Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Store size={18} /> Marketplace
          </h3>
          <ul className="space-y-2 text-sm">
            {menuItems.map((item, idx) => (
              <li key={idx} className="hover:text-blue-400 cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sub Menu Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Gamepad2 size={18} /> Features
          </h3>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4 border-gray-700">
        © 2025 INDI_X Marketplace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
