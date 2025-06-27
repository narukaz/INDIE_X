import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import gameinstanceabi from "../ABI/game_instance.json";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

function WithdrawFunds({ contractaddress }) {
  const account = useAccount();
  const [rejected, setRejected] = useState(false);

  const {
    data: hash,
    writeContract,
    isPending,
    isSuccess,
    isError,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isError) {
      setRejected(true);
      const timer = setTimeout(() => setRejected(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  function withdraw() {
    writeContract({
      address: contractaddress,
      abi: gameinstanceabi,
      functionName: "withdraw",
      account: account.address,
      args: [],
    });
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();

        withdraw();
      }}
      className="group/input flex gap-5 items-center border py-1 rounded-2xl w-[120px] px-2 mt-3 cursor-pointer hover:scale-100 scale-105 select-none shadow-[0_0_5px_5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_5px_5px_rgba(180,180,180,0.2)] transition-all duration-300 overflow-hidden"
    >
      {isConfirming ? (
        <span className="text-white text-sm">Withdrawing...</span>
      ) : rejected ? (
        <span className="text-red-400 text-sm">Transaction Rejected</span>
      ) : (
        <>
          <span className="whitespace-nowrap text-white text-sm">
            Withdraw Funds
          </span>
        </>
      )}
    </div>
  );
}

export default WithdrawFunds;
