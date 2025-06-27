import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import gameinstanceabi from "../ABI/game_instance.json";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

function Approve_link({ contractaddress }) {
  const account = useAccount();
  const [linkvalue, setLinkValue] = useState(0);
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

  function registrar() {
    if (linkvalue === 0) return;

    writeContract({
      address: contractaddress,
      abi: gameinstanceabi,
      functionName: "approveRegistrar",
      account: account.address,
      args: [BigInt(linkvalue * 10e18)],
    });
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="group/input flex gap-5 items-center border py-1 rounded-2xl w-[120px] px-2 mt-3 cursor-pointer hover:scale-100 hover:w-[250px] scale-105 select-none shadow-[0_0_5px_5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_5px_5px_rgba(180,180,180,0.2)] transition-all duration-300 overflow-hidden"
    >
      {isConfirming ? (
        <span className="text-white text-sm">Approving...</span>
      ) : rejected ? (
        <span className="text-red-400 text-sm">Transaction Rejected</span>
      ) : (
        <>
          <span className="whitespace-nowrap text-white text-sm">
            Support renting
          </span>
          <input
            value={linkvalue}
            onChange={(e) => setLinkValue(e.target.value)}
            type="number"
            min={0.1}
            className="no-spinner text-[12px] px-2 bg-transparent text-white font-thin outline-none w-[70px] transition-all duration-300 ease-in-out border border-gray-500 rounded-md"
            placeholder="input amount"
          />
          <ArrowRight
            onClick={registrar}
            size={20}
            className="  hover:border hover:border-white bg-blue-600 rounded-2xl"
          />
        </>
      )}
    </div>
  );
}

export default Approve_link;
