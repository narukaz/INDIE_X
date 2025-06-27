import { useWriteContract } from "wagmi";
import { useAccount } from "wagmi";
import linkTokenABI from "../ABI/linktokenabi.json";
import { useState, useEffect } from "react";

function Notification({ message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose(), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded-md shadow-xl bg-gray-800 text-white text-sm transition-all duration-300 z-50 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
      }`}
    >
      {message}
    </div>
  );
}

function FundContractButton({ contractaddress, amountInLink }) {
  const { address: userAddress, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [notification, setNotification] = useState(null);

  const handleFund = async () => {
    if (!isConnected || !contractaddress) {
      setNotification("Please connect your wallet.");
      return;
    }

    try {
      const linkAmount = BigInt(Math.floor(amountInLink * 1e18));
      setNotification("Sending LINK...");
      const hash = await writeContractAsync({
        address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // LINK on Sepolia
        abi: linkTokenABI,
        functionName: "transfer",
        args: [contractaddress, linkAmount],
      });
      setNotification("Transaction sent!");
      console.log("Transaction sent:", hash);
    } catch (err) {
      console.error("Funding error:", err);
      setNotification("Funding failed. Check console for details.");
    }
  };

  return (
    <>
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleFund();
        }}
        disabled={isPending}
        className="group/input px-2 py-1 flex gap-5 items-center justify-center w-[120px] mt-3 cursor-pointer hover:scale-100 scale-105 select-none shadow-[0_0_5px_5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_5px_5px_rgba(180,180,180,0.2)] transition-all duration-300 overflow-hidden bg-black text-white text-sm hover:bg-gray-900 border border-white rounded-2xl"
      >
        {isPending ? "Funding..." : `Fund ${amountInLink} LINK`}
      </button>
    </>
  );
}

export default FundContractButton;
