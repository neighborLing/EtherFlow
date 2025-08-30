'use client'

import { useAccount, useEnsName, useEnsAvatar } from 'wagmi'
import { useState, useEffect } from 'react'

export default function UniswapWalletAvatar() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined })
  const [copied, setCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=f3f4f6&size=32`
  }

  const getStatusColor = () => {
    if (!address) return 'bg-gray-400'
    // 根据地址生成一个固定的颜色
    const hash = address.slice(2).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[Math.abs(hash) % colors.length]
  }

  if (!isMounted || !isConnected || !address) {
    return null
  }

  return (
    <div className="relative">
      {/* Wallet Avatar Button */}
      <div 
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={copyToClipboard}
        title={copied ? '已复制!' : '点击复制地址'}
      >
        {/* Avatar Container */}
        <div className="relative">
          <img
            src={ensAvatar || generateAvatarUrl(address)}
            alt="Account Avatar"
            className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateAvatarUrl(address)
            }}
          />
          {/* Status Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor()}`}></div>
        </div>
        
        {/* Wallet Info */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </span>
          {ensName && (
            <span className="text-xs text-gray-500 truncate">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">已连接</span>
          </div>
        </div>
        
        {/* Copy Icon */}
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Copy Success Toast */}
      {copied && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            地址已复制!
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex flex-col items-center">
          <span>点击复制地址</span>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mt-1"></div>
        </div>
      </div>
    </div>
  )
}
