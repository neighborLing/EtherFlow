'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'

interface IDepositedEvent {
  id: string
  from: string
  amount: string
  blockNumber: string
}

interface IGrabbedEvent {
  id: string
  grabber: string
  amount: string
  remain: string
}

interface IRedPacketData {
  depositeds: IDepositedEvent[]
  grabbeds: IGrabbedEvent[]
}

export default function RedPacketGrabbing() {
  const { isConnected, address: userAddress } = useAccount()
  const [redPacketData, setRedPacketData] = useState<IRedPacketData>({
    depositeds: [],
    grabbeds: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contractAddress, setContractAddress] = useState('0xd7b63e13C0Ea2c9C42cd76A0396b1E0fE042844F')
  const [grabbing, setGrabbing] = useState(false)

  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/119874/rp/v0.0.1'

  // Read contract state
  const contractAbi = [
    {
      name: 'totalAmount',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint256' }],
    },
    {
      name: 'count',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint256' }],
    },
    {
      name: 'isEqual',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'bool' }],
    },
    {
      name: 'isGrabbed',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
    {
      name: 'grabRedPacket',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [],
      outputs: [],
    },
  ] as const

  const { data: totalAmount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: 'totalAmount',
  })

  const { data: count } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: 'count',
  })

  const { data: isEqual } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: 'isEqual',
  })

  const { data: isGrabbed } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: 'isGrabbed',
    args: userAddress ? [userAddress] : undefined,
  })

  useEffect(() => {
    if (isConfirmed) {
      setGrabbing(false)
      fetchRedPacketData()
    }
  }, [isConfirmed])

  const fetchRedPacketData = async () => {
    setLoading(true)
    setError('')

    try {
      const query = `{
        depositeds(first: 5) {
          id
          from
          amount
          blockNumber
        }
        grabbeds(first: 5) {
          id
          grabber
          amount
          remain
        }
      }`

      const response = await fetch(GRAPH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL查询错误')
      }

      setRedPacketData({
        depositeds: data.data?.depositeds || [],
        grabbeds: data.data?.grabbeds || []
      })
    } catch (err) {
      console.error('查询红包数据失败:', err)
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGrabRedPacket = async () => {
    if (!contractAddress || !isConnected) {
      setError('请输入合约地址并连接钱包')
      return
    }

    try {
      setGrabbing(true)
      setError('')

      console.log('尝试调用合约:', contractAddress)
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'grabRedPacket',
      })
    } catch (err) {
      console.error('抢红包失败:', err)
      setError(err instanceof Error ? err.message : '抢红包失败')
      setGrabbing(false)
    }
  }

  const formatAmount = (amount: string) => {
    const value = parseFloat(amount) / 1e18
    return value.toFixed(6)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    fetchRedPacketData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent mb-4">
          🧧 红包抢夺
        </h1>
        <p className="text-gray-400 text-lg">抢夺区块链红包，先到先得！</p>
      </div>

      {/* Grab Red Packet Section */}
      <div className="uniswap-card glass-hover">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center mr-3">
            <span className="text-white text-xl">🧧</span>
          </div>
          <h2 className="text-xl font-bold text-white">抢红包</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              红包合约地址
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="输入红包合约地址 (0x...)"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            onClick={handleGrabRedPacket}
            disabled={!isConnected || !contractAddress || isPending || isConfirming || grabbing}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {!isConnected ? '请先连接钱包' : 
             isPending ? '确认交易中...' :
             isConfirming ? '等待确认...' :
             grabbing ? '抢夺中...' : '🎯 抢红包'}
          </button>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {contractError && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-300">合约调用错误: {contractError.message}</p>
            </div>
          )}

          {hash && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
              <p className="text-blue-300">
                交易已提交: {truncateAddress(hash)}
                {isConfirmed && <span className="ml-2 text-green-400">✅ 已确认</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract State Debug Info */}
      {contractAddress && (
        <div className="uniswap-card glass-hover">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">合约状态</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-gray-400 text-sm mb-1">剩余金额</div>
              <div className="text-white font-semibold text-lg">
                {totalAmount ? `${formatAmount(totalAmount.toString())} ETH` : 'Loading...'}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-gray-400 text-sm mb-1">剩余红包数</div>
              <div className="text-white font-semibold text-lg">
                {count !== undefined ? count.toString() : 'Loading...'}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-gray-400 text-sm mb-1">分配方式</div>
              <div className="text-white font-semibold text-lg">
                {isEqual !== undefined ? (isEqual ? '平均' : '随机') : 'Loading...'}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-gray-400 text-sm mb-1">您的状态</div>
              <div className={`font-semibold text-lg ${isGrabbed && Number(isGrabbed) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {userAddress ? (isGrabbed !== undefined ? (Number(isGrabbed) > 0 ? '已抢过' : '未抢过') : 'Loading...') : '未连接'}
              </div>
            </div>
          </div>

          {/* Grab conditions check */}
          <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
            <h3 className="text-white font-semibold mb-2">抢红包条件检查:</h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${count !== undefined && Number(count) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span>{count !== undefined && Number(count) > 0 ? '✅' : '❌'}</span>
                <span>红包数量 &gt; 0 ({count !== undefined ? count.toString() : '?'})</span>
              </div>
              <div className={`flex items-center gap-2 ${totalAmount !== undefined && Number(totalAmount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span>{totalAmount !== undefined && Number(totalAmount) > 0 ? '✅' : '❌'}</span>
                <span>剩余金额 &gt; 0 ({totalAmount !== undefined ? formatAmount(totalAmount.toString()) : '?'} ETH)</span>
              </div>
              <div className={`flex items-center gap-2 ${isGrabbed !== undefined && Number(isGrabbed) === 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span>{isGrabbed !== undefined && Number(isGrabbed) === 0 ? '✅' : '❌'}</span>
                <span>您还未抢过 ({isGrabbed !== undefined ? (Number(isGrabbed) === 0 ? '未抢过' : '已抢过') : '?'})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchRedPacketData}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? '刷新中...' : '🔄 刷新数据'}
        </button>
      </div>

      {/* Red Packet Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposited Events */}
        <div className="uniswap-card glass-hover">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">存款记录</h3>
            <span className="ml-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              {redPacketData.depositeds.length} 条记录
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {redPacketData.depositeds.length > 0 ? redPacketData.depositeds.map((event, index) => (
              <div key={event.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">存款 #{index + 1}</span>
                  <span className="text-sm text-gray-400">
                    区块 #{event.blockNumber}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">存款者:</span>
                    <span className="ml-2 text-blue-400 font-mono text-sm">
                      {truncateAddress(event.from)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">金额:</span>
                    <span className="ml-2 text-green-400 font-semibold">
                      {formatAmount(event.amount)} ETH
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                暂无存款记录
              </div>
            )}
          </div>
        </div>

        {/* Grabbed Events */}
        <div className="uniswap-card glass-hover">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">抢夺记录</h3>
            <span className="ml-auto bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
              {redPacketData.grabbeds.length} 条记录
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {redPacketData.grabbeds.length > 0 ? redPacketData.grabbeds.map((event, index) => (
              <div key={event.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">抢夺 #{index + 1}</span>
                  <span className="text-sm text-red-400 font-semibold">🎉 成功</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">抢夺者:</span>
                    <span className="ml-2 text-blue-400 font-mono text-sm">
                      {truncateAddress(event.grabber)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">获得金额:</span>
                    <span className="ml-2 text-yellow-400 font-bold">
                      {formatAmount(event.amount)} ETH
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">剩余金额:</span>
                    <span className="ml-2 text-gray-300">
                      {formatAmount(event.remain)} ETH
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                暂无抢夺记录
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="uniswap-card glass-hover text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">加载红包数据中...</p>
        </div>
      )}

      {error && !loading && (
        <div className="uniswap-card glass-hover text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-300 mb-2">数据加载失败</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchRedPacketData}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            重新加载
          </button>
        </div>
      )}
    </div>
  )
}