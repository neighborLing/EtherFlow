'use client'

import React, { useState, useEffect } from 'react'
import _ from 'lodash'

interface IContractEventsProps {
  contractAddress?: string
}

interface ICountIncrementedEvent {
  id: string
  newCount: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

interface IMessageUpdatedEvent {
  id: string
  newMessage: string
  updatedBy: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

interface IEventData {
  countIncremented: ICountIncrementedEvent[]
  messageUpdated: IMessageUpdatedEvent[]
}

const ContractEvents: React.FC<IContractEventsProps> = ({ 
  contractAddress = ''
}) => {
  const [contractAddr, setContractAddr] = useState(contractAddress)
  const [events, setEvents] = useState<IEventData>({
    countIncremented: [],
    messageUpdated: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastQueryTime, setLastQueryTime] = useState<Date | null>(null)

  const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/119874/tx/v0.0.2'

  // 查询合约事件
  const fetchContractEvents = async (address: string) => {
    if (!address.trim()) {
      setError('请输入合约地址')
      return
    }

    setLoading(true)
    setError('')

    try {
      const query = `
        {
          countIncrementeds(first: 5) {
            id
            newCount
            blockNumber
            blockTimestamp
          }
          messageUpdateds(first: 5) {
            id
            newMessage
            updatedBy
            blockNumber
          }
        }
      `

      const response = await fetch(GRAPH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL查询错误')
      }

      console.log('GraphQL返回数据:', data)

      setEvents({
        countIncremented: data.data?.countIncrementeds || [],
        messageUpdated: data.data?.messageUpdateds || []
      })

      setLastQueryTime(new Date())
    } catch (err) {
      console.error('查询合约事件失败:', err)
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  // 防抖处理合约地址输入
  const debouncedFetchEvents = _.debounce((address: string) => {
    fetchContractEvents(address)
  }, 500)

  // 处理合约地址变化
  const handleContractAddressChange = (address: string) => {
    setContractAddr(address)
    // 移除自动查询，改为手动触发
  }

  // 刷新事件
  const handleRefresh = () => {
    if (contractAddr.trim()) {
      fetchContractEvents(contractAddr)
    }
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 截断地址显示
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 截断交易哈希显示
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <div className="space-y-8">
      {/* 合约地址输入 */}
      <div className="uniswap-card glass-hover">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">合约事件查询</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              合约地址
            </label>
            <div className="flex gap-3">
                              <input
                  type="text"
                  value={contractAddr}
                  onChange={(e) => handleContractAddressChange(e.target.value)}
                  placeholder="合约地址 (可选，用于记录)"
                  className="uniswap-input flex-1"
                />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    查询中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    刷新
                  </>
                )}
              </button>
            </div>
          </div>

          {lastQueryTime && (
            <div className="text-sm text-gray-400">
              最后查询时间: {lastQueryTime.toLocaleString('zh-CN')}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 事件列表 */}
      {!loading && !error && (events.countIncremented.length > 0 || events.messageUpdated.length > 0) && (
        <div className="space-y-6">
          {events.countIncremented.length > 0 && (
            <div className="uniswap-card glass-hover">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">计数增加事件</h3>
                <span className="ml-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  {events.countIncremented.length} 条记录
                </span>
              </div>
              
              <div className="space-y-3">
                {events.countIncremented.map((event, index) => (
                  <div key={event.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">事件 #{index + 1}</span>
                      <span className="text-sm text-gray-400">
                        {formatTimestamp(event.blockTimestamp)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">新计数:</span>
                        <span className="ml-2 text-white font-semibold">{event.newCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">区块号:</span>
                        <span className="ml-2 text-white">{event.blockNumber}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400 text-sm">交易哈希:</span>
                      <span className="ml-2 text-blue-400 font-mono text-sm">
                        {event.transactionHash}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {events.messageUpdated.length > 0 && (
            <div className="uniswap-card glass-hover">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">消息更新事件</h3>
                <span className="ml-auto bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                  {events.messageUpdated.length} 条记录
                </span>
              </div>
              
              <div className="space-y-3">
                {events.messageUpdated.map((event, index) => (
                  <div key={event.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">事件 #{index + 1}</span>
                      <span className="text-sm text-gray-400">
                        {formatTimestamp(event.blockTimestamp)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">新消息:</span>
                        <span className="ml-2 text-white font-semibold">{event.newMessage}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">更新者:</span>
                          <span className="ml-2 text-blue-400 font-mono text-sm">
                            {truncateAddress(event.updatedBy)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">区块号:</span>
                          <span className="ml-2 text-white">{event.blockNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400 text-sm">交易哈希:</span>
                      <span className="ml-2 text-blue-400 font-mono text-sm">
                        {event.transactionHash}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && events.countIncremented.length === 0 && events.messageUpdated.length === 0 && (
        <div className="uniswap-card glass-hover text-center py-12">
          <div className="w-16 h-16 bg-gray-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">暂无事件记录</h3>
          <p className="text-gray-400">点击刷新按钮获取最新的事件记录</p>
        </div>
      )}
    </div>
  )
}

export default ContractEvents
