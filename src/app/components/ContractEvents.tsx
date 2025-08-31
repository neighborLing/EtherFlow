'use client'

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import _ from 'lodash'

interface IContractEventsProps {
  contractAddress?: string
}

export interface IContractEventsRef {
  refresh: () => void
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

const ContractEvents = forwardRef<IContractEventsRef, IContractEventsProps>(({ 
  contractAddress = ''
}, ref) => {
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

  // 刷新事件
  const handleRefresh = () => {
    if (contractAddress.trim()) {
      fetchContractEvents(contractAddress)
    }
  }

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh
  }))

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
})

export default ContractEvents
