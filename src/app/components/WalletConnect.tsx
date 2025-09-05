'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import { parseEther, stringToHex } from 'viem';

export default function WalletConnect() {
  // useAccount hook - 获取当前钱包账户信息
  const { 
    address,        // 当前连接的钱包地址 (string | undefined)
    isConnected,    // 钱包是否已连接 (boolean)
    chain          // 当前连接的网络链信息 (Chain | undefined)
  } = useAccount();

  // useConnect hook - 提供钱包连接功能
  const { 
    connect,        // 连接钱包的函数，接受连接器参数
    connectors,     // 可用的钱包连接器列表 (Connector[])
    isPending       // 连接过程是否正在进行中 (boolean)
  } = useConnect();

  // useDisconnect hook - 提供钱包断开连接功能
  const { 
    disconnect      // 断开钱包连接的函数
  } = useDisconnect();

  // useSwitchChain hook - 提供网络切换功能
  const { 
    switchChain     // 切换网络链的函数，接受链ID参数
  } = useSwitchChain();

  // useBalance hook - 获取钱包余额信息
  const { 
    data: balance,           // 余额数据对象，包含 value、formatted 等属性
    isLoading: balanceLoading, // 余额加载状态 (boolean)
    error: balanceError,     // 余额查询错误信息
    refetch: refetchBalance  // 重新获取余额的函数
  } = useBalance({
    address: address,        // 要查询余额的地址
  });

  // 转账表单状态管理
  const [toAddress, setToAddress] = useState('');  // 接收方地址
  const [amount, setAmount] = useState('');        // 转账金额
  const [data, setData] = useState('');            // 转账携带的数据

  // useSendTransaction hook - 提供发送交易功能
  const { 
    sendTransaction,              // 发送交易的函数
    isPending: isTransferPending, // 交易发送过程中的加载状态
    isSuccess,                   // 交易是否发送成功
    error,                       // 交易发送过程中的错误信息
    reset                        // 重置状态的函数
  } = useSendTransaction({
    mutation: {
      onSuccess: () => {
        // 转账成功后刷新余额
        setTimeout(() => {
          refetchBalance();
          // 重置转账状态，允许再次转账
          reset();
        }, 2000); // 等待2秒让交易确认
      },
      onError: () => {
        // 转账失败后也重置状态
        setTimeout(() => {
          reset();
        }, 1000);
      }
    }
  });

  // 处理转账的函数
  const handleTransfer = () => {
    // 检查输入是否完整
    if (!toAddress || !amount) return;
    
    // 将ETH金额转换为Wei单位
    const amountInWei = parseEther(amount);
    
    // 检查余额是否足够
    if (balance && amountInWei > balance.value) {
      alert('余额不足！');
      return;
    }
    
    try {
      // 准备交易参数
      const transactionParams: any = {
        to: toAddress as `0x${string}`,  // 接收方地址，类型断言为0x开头的字符串
        value: amountInWei,              // 转账金额（Wei单位）
      };
      
      // 如果有数据，则转换为16进制并添加到交易中
      if (data.trim()) {
        transactionParams.data = stringToHex(data.trim());
      }
      
      // 发送交易
      sendTransaction(transactionParams);
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  // 检查余额是否不足的函数
  const isInsufficientBalance = () => {
    if (!balance || !amount) return false;
    try {
      const amountInWei = parseEther(amount);
      return amountInWei > balance.value;
    } catch {
      return false;
    }
  };

  // 切换到本地网络（链ID: 1337）
  const switchToLocalhost = () => {
    switchChain({ chainId: 1337 });
  };

  // 格式化余额显示的函数
  const formatBalance = (balance: any) => {
    if (!balance) return '0';
    const balanceInEth = Number(balance.value) / 1e18;  // 将Wei转换为ETH
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
                      转账金额 (ETH) B
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    携带数据 (可选)
                  </label>
                  <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="输入要携带的数据，将自动转换为16进制..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  {data.trim() && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div className="font-medium">16进制预览:</div>
                      <div className="break-all bg-gray-100 p-2 rounded mt-1">
                        {stringToHex(data.trim())}
                      </div>
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