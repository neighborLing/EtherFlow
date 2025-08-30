'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';

export default function BlockchainInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined });
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [blockInfo, setBlockInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionInfo, setTransactionInfo] = useState<any>(null);
  const [txFromEnsName, setTxFromEnsName] = useState<string | null>(null);
  const [txToEnsName, setTxToEnsName] = useState<string | null>(null);
  const [addressToQuery, setAddressToQuery] = useState('');
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [queryEnsName, setQueryEnsName] = useState<string | null>(null);
  const [queryEnsAvatar, setQueryEnsAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    }
  }, [isConnected]);

  const fetchBlockchainInfo = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      const [currentBlock, currentGasPrice, network] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        provider.getNetwork()
      ]);

      setBlockNumber(currentBlock);
      setGasPrice(currentGasPrice.gasPrice);
      setNetworkInfo({
        name: network.name,
        chainId: network.chainId.toString(),
        ensAddress: (network as any).ensAddress || null
      });

      const block = await provider.getBlock(currentBlock);
      setBlockInfo(block);
    } catch (error) {
      console.error('获取区块链信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const queryTransaction = async () => {
    if (!provider || !transactionHash) return;
    
    setLoading(true);
    try {
      const [tx, txReceipt] = await Promise.all([
        provider.getTransaction(transactionHash),
        provider.getTransactionReceipt(transactionHash)
      ]);

      // 查询交易中地址的ENS信息
      let fromEnsName = null;
      let toEnsName = null;
      
      if (tx) {
        try {
          // 查询发送方ENS
          if (tx.from) {
            fromEnsName = await provider.lookupAddress(tx.from);
          }
          // 查询接收方ENS
          if (tx.to) {
            toEnsName = await provider.lookupAddress(tx.to);
          }
        } catch (ensError) {
          console.log('查询交易ENS信息失败:', ensError);
        }
      }

      setTxFromEnsName(fromEnsName);
      setTxToEnsName(toEnsName);
      setTransactionInfo({
        transaction: tx,
        receipt: txReceipt
      });
    } catch (error) {
      console.error('查询交易失败:', error);
      setTransactionInfo({ error: '交易未找到或无效' });
      setTxFromEnsName(null);
      setTxToEnsName(null);
    } finally {
      setLoading(false);
    }
  };

  const queryAddress = async () => {
    if (!provider || !addressToQuery) return;
    
    setLoading(true);
    try {
      // 查询ENS信息
      let ensName = null;
      let ensAvatar = null;
      
      try {
        // 使用ethers的ENS解析器
        const ensResolver = await provider.getResolver(addressToQuery);
        if (ensResolver) {
          // 在ethers v6中，需要先检查是否有反向记录
          const reverseName = await provider.lookupAddress(addressToQuery);
          if (reverseName) {
            ensName = reverseName;
            // 获取ENS头像 - 简化处理
            try {
              const avatar = await ensResolver.getAvatar();
              if (avatar && typeof avatar === 'string') {
                ensAvatar = avatar;
              } else if (avatar && typeof avatar === 'object' && (avatar as any).url) {
                ensAvatar = (avatar as any).url;
              }
            } catch (avatarError) {
              console.log('获取ENS头像失败:', avatarError);
            }
          }
        }
      } catch (ensError) {
        console.log('ENS查询失败，使用默认显示:', ensError);
      }

      const [balance, txCount, code] = await Promise.all([
        provider.getBalance(addressToQuery),
        provider.getTransactionCount(addressToQuery),
        provider.getCode(addressToQuery)
      ]);

      setQueryEnsName(ensName);
      setQueryEnsAvatar(ensAvatar);
      setAddressInfo({
        address: addressToQuery,
        balance: ethers.formatEther(balance),
        transactionCount: txCount,
        isContract: code !== '0x',
        contractCode: code !== '0x' ? code.slice(0, 100) + '...' : null
      });
    } catch (error) {
      console.error('查询地址失败:', error);
      setAddressInfo({ error: '地址查询失败' });
      setQueryEnsName(null);
      setQueryEnsAvatar(null);
    } finally {
      setLoading(false);
    }
  };

  const formatGasPrice = (gasPrice: bigint | null) => {
    if (!gasPrice) return 'N/A';
    return `${ethers.formatUnits(gasPrice, 'gwei')} Gwei`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  // ENS地址格式化函数
  const formatAddressWithENS = (address: string) => {
    if (address === addressToQuery) {
      // 对于查询的地址，我们需要单独获取ENS信息
      return address;
    }
    return address;
  };

  // 生成头像URL
  const generateAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=f3f4f6&size=32`;
  };

  if (!isConnected) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">区块链信息查询</h2>
        <p className="text-gray-500">请先连接钱包以获取完整的区块链信息</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">💡 提示：连接钱包后可以查询网络状态、交易信息和地址详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">区块链信息查询</h2>
      
      {/* 基础网络信息 */}
      <div className="space-y-4">
        <div className="border-b pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">网络状态</h3>
            <button
              onClick={fetchBlockchainInfo}
              disabled={loading}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? '查询中...' : '获取信息'}
            </button>
          </div>
          
          {networkInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-700">网络名称</p>
                <p className="text-blue-900">{networkInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">链 ID</p>
                <p className="text-blue-900">{networkInfo.chainId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">当前区块</p>
                <p className="text-blue-900">{blockNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Gas 价格</p>
                <p className="text-blue-900">{formatGasPrice(gasPrice)}</p>
              </div>
            </div>
          )}
          
          {blockInfo && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">最新区块信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">区块哈希:</span>
                  <p className="text-green-800 break-all">{blockInfo.hash}</p>
                </div>
                <div>
                  <span className="font-medium">时间戳:</span>
                  <p className="text-green-800">{formatTimestamp(blockInfo.timestamp)}</p>
                </div>
                <div>
                  <span className="font-medium">交易数量:</span>
                  <p className="text-green-800">{blockInfo.transactions.length}</p>
                </div>
                <div>
                  <span className="font-medium">Gas 限制:</span>
                  <p className="text-green-800">{blockInfo.gasLimit.toString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 交易查询 */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-3">交易查询</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交易哈希
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={queryTransaction}
              disabled={!transactionHash || loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              查询交易
            </button>
            
            {transactionInfo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {transactionInfo.error ? (
                  <p className="text-red-600">{transactionInfo.error}</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">交易详情</h4>
                    <div>
                      <span className="font-medium">从:</span> 
                      {txFromEnsName && (
                        <div className="text-blue-600 text-xs mb-1">{txFromEnsName}</div>
                      )}
                      <div className="text-green-800 break-all">{transactionInfo.transaction?.from}</div>
                    </div>
                    <div>
                      <span className="font-medium">到:</span> 
                      {txToEnsName && (
                        <div className="text-blue-600 text-xs mb-1">{txToEnsName}</div>
                      )}
                      <div className="text-green-800 break-all">{transactionInfo.transaction?.to}</div>
                    </div>
                    <div>
                      <span className="font-medium">金额:</span> {transactionInfo.transaction ? ethers.formatEther(transactionInfo.transaction.value) : 'N/A'} ETH
                    </div>
                    <div>
                      <span className="font-medium">状态:</span> {transactionInfo.receipt?.status === 1 ? '成功' : '失败'}
                    </div>
                    <div>
                      <span className="font-medium">Gas 使用:</span> {transactionInfo.receipt?.gasUsed.toString()}
                    </div>
                    <div>
                      <span className="font-medium">区块号:</span> {transactionInfo.receipt?.blockNumber}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 地址查询 */}
        <div>
          <h3 className="text-lg font-medium mb-3">地址查询</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                以太坊地址
              </label>
              <input
                type="text"
                value={addressToQuery}
                onChange={(e) => setAddressToQuery(e.target.value)}
                placeholder="0x... 或当前地址"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={queryAddress}
                disabled={!addressToQuery || loading}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                查询地址
              </button>
              <button
                onClick={() => setAddressToQuery(address || '')}
                disabled={!address}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                使用当前地址
              </button>
            </div>
            
            {addressInfo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {addressInfo.error ? (
                  <p className="text-red-600">{addressInfo.error}</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">地址信息</h4>
                    
                    {/* ENS信息显示 */}
                    {(queryEnsName || queryEnsAvatar) && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        {queryEnsAvatar && (
                          <img
                            src={queryEnsAvatar}
                            alt="ENS Avatar"
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = generateAvatarUrl(addressInfo.address);
                            }}
                          />
                        )}
                        <div className="flex-1">
                          {queryEnsName && (
                            <div className="font-medium text-blue-900">{queryEnsName}</div>
                          )}
                          <div className="text-xs text-blue-700 break-all">{addressInfo.address}</div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium">地址:</span> 
                      <p className="break-all">{addressInfo.address}</p>
                    </div>
                    <div>
                      <span className="font-medium">余额:</span> {addressInfo.balance} ETH
                    </div>
                    <div>
                      <span className="font-medium">交易次数:</span> {addressInfo.transactionCount}
                    </div>
                    <div>
                      <span className="font-medium">类型:</span> {addressInfo.isContract ? '合约地址' : '普通地址'}
                    </div>
                    {addressInfo.isContract && (
                      <div>
                        <span className="font-medium">合约代码 (前100字符):</span>
                        <p className="text-xs text-gray-600 break-all">{addressInfo.contractCode}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}