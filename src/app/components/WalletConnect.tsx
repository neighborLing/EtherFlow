'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">钱包连接</h2>
      
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">✅ 钱包已连接</p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">账户:</span> {address}
            </p>
            {balance && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">余额:</span> {Number(balance.value) / 1e18} {balance.symbol}
              </p>
            )}
          </div>
          
          <button
            onClick={() => disconnect()}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            断开连接
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 mb-4">选择钱包进行连接:</p>
          
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '连接中...' : `连接 ${connector.name}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}