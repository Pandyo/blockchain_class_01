"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contract } from "@/contract";

export default function TipJarApp() {
  const [amount, setAmount] = useState("0.001");
  const [message, setMessage] = useState("");

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    data: balance,
    refetch: refetchBalance,
  } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getBalance",
  });

  const {
    data: tipCount,
    refetch: refetchTipCount,
  } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getTipCount",
  });

  const { data: owner } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "owner",
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  async function sendTip() {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "tip",
      args: [message],
      value: parseEther(amount),
    });
  }

  async function withdrawTips() {
    writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "withdrawTips",
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-900 p-6 shadow-xl space-y-6">
        <h1 className="text-3xl font-bold">TipJarPlus</h1>

        <div className="text-sm text-zinc-300 space-y-1">
          <p>Contract: {contract.address}</p>
          <p>Owner: {String(owner ?? "-")}</p>
          <p>
            Balance:{" "}
            {balance ? formatEther(balance as bigint) : "0"} ETH
          </p>
          <p>Tip Count: {String(tipCount ?? "0")}</p>
        </div>

        {!isConnected ? (
          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold"
            onClick={() => connect({ connector: connectors[0] })}
          >
            지갑 연결
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">Connected: {address}</p>

            <button
              className="rounded-xl bg-zinc-700 px-4 py-2"
              onClick={() => disconnect()}
            >
              연결 해제
            </button>
          </div>
        )}

        <div className="space-y-3">
          <input
            className="w-full rounded-xl bg-zinc-800 p-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="보낼 ETH 양"
          />

          <input
            className="w-full rounded-xl bg-zinc-800 p-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="팁 메시지"
          />

          <button
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold disabled:opacity-50"
            onClick={sendTip}
            disabled={!isConnected || isPending || isConfirming}
          >
            팁 보내기
          </button>

          <button
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold disabled:opacity-50"
            onClick={withdrawTips}
            disabled={!isConnected || isPending || isConfirming}
          >
            팁 인출하기 - Owner 전용
          </button>
        </div>

        {hash && (
          <p className="break-all text-sm text-zinc-300">
            Tx Hash: {hash}
          </p>
        )}

        {isSuccess && (
          <button
            className="rounded-xl bg-zinc-700 px-4 py-2"
            onClick={() => {
              refetchBalance();
              refetchTipCount();
            }}
          >
            잔액/횟수 새로고침
          </button>
        )}

        {error && (
          <p className="text-red-400 text-sm">
            Error: {error.message}
          </p>
        )}
      </div>
    </main>
  );
}