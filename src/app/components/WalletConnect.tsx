'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

export default function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useBalance({
    address: address,
  });

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');

  const { sendTransaction, isPending: isTransferPending, isSuccess, error } = useSendTransaction({
    mutation: {
      onSuccess: () => {
        // 转账成功后刷新余额
        setTimeout(() => {
          refetchBalance();
        }, 2000); // 等待2秒让交易确认
      }
    }
  });

  const handleTransfer = () => {
    if (!toAddress || !amount) return;
    
    const amountInWei = parseEther(amount);
    if (balance && amountInWei > balance.value) {
      alert('余额不足！');
      return;
    }
    
    try {
      sendTransaction({
        to: toAddress as `0x${string}`,
        value: amountInWei,
      });
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  const isInsufficientBalance = () => {
    if (!balance || !amount) return false;
    try {
      const amountInWei = parseEther(amount);
      return amountInWei > balance.value;
    } catch {
      return false;
    }
  };

  const switchToLocalhost = () => {
    switchChain({ chainId: 1337 });
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0';
    const balanceInEth = Number(balance.value) / 1e18;
    return balanceInEth.toFixed(4); // 保留4位小数
  };

  const getBalanceColor = (balance: any) => {
    if (!balance) return 'text-gray-500';
    const balanceInEth = Number(balance.value) / 1e18;
    if (balanceInEth > 1) return 'text-green-600';
    if (balanceInEth > 0.1) return 'text-blue-600';
    if (balanceInEth > 0) return 'text-yellow-600';
    return 'text-red-500';
  };

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
            <p className="text-sm text-gray-600">
              <span className="font-medium">网络:</span> {chain?.name || '未知'} (ID: {chain?.id || 'N/A'})
            </p>
            
            {/* 余额显示区域 */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">账户余额</span>
                <div className="flex items-center gap-2">
                  {balanceLoading && (
                    <div className="text-xs text-blue-600">加载中...</div>
                  )}
                  <button
                    onClick={() => refetchBalance()}
                    disabled={balanceLoading}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    刷新
                  </button>
                </div>
              </div>
              
              {balanceError ? (
                <div className="text-sm text-red-600 mt-1">
                  ❌ 无法获取余额
                </div>
              ) : balance ? (
                <div className="mt-2">
                  <div className={`text-xl font-bold ${getBalanceColor(balance)}`}>
                    {formatBalance(balance)} {balance.symbol}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    精确值: {Number(balance.value) / 1e18} {balance.symbol}
                  </div>
                  {Number(balance.value) / 1e18 === 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      ⚠️ 余额为零，无法进行转账
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-1">
                  余额信息不可用
                </div>
              )}
            </div>
          </div>

          {/* 网络切换区域 */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">网络控制</h3>
              {chain?.id !== 1337 && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  当前非测试链
                </div>
              )}
            </div>
            <button
              onClick={switchToLocalhost}
              disabled={chain?.id === 1337}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {chain?.id === 1337 ? '已连接本地测试链' : '切换到本地测试链 (127.0.0.1:7545)'}
            </button>
          </div>

          {/* 转账功能区域 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">转账功能</h3>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    接收地址
                  </label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      转账金额 (ETH)
                    </label>
                    {balance && (
                      <button
                        onClick={() => {
                          const maxAmount = Math.max(0, Number(balance.value) / 1e18 - 0.001); // 预留gas费
                          setAmount(maxAmount.toFixed(6));
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        最大金额
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.001"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {balance && amount && (
                    <div className="text-xs text-gray-500 mt-1">
                      剩余: {((Number(balance.value) / 1e18) - parseFloat(amount || '0')).toFixed(6)} ETH
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">❌ 转账失败: {error.message}</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 text-sm">✅ 转账成功!</p>
                  </div>
                )}

                {isInsufficientBalance() && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">⚠️ 余额不足，无法进行此转账</p>
                  </div>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={!toAddress || !amount || isTransferPending || isInsufficientBalance()}
                  className={`w-full px-4 py-2 text-white rounded transition-colors ${
                    isInsufficientBalance() 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {isTransferPending ? '转账中...' : 
                   isInsufficientBalance() ? '余额不足' : '发送转账'}
                </button>
              </div>
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