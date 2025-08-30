'use client'

import { useSwitchChain, useChainId } from 'wagmi'
import { useState, useEffect } from 'react'
import { mainnet, polygon, arbitrum, optimism, sepolia } from 'wagmi/chains'

interface IChainInfo {
  id: number
  name: string
  icon: string
  color: string
  bgColor: string
  gradient: string
}

export default function UniswapNetworkSelector() {
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const supportedChains: IChainInfo[] = [
    { 
      id: 1337, 
      name: 'Localhost', 
      icon: '🏠', 
      color: '#10B981',
      bgColor: '#F0FDF4',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      id: sepolia.id, 
      name: 'Sepolia', 
      icon: '🧪', 
      color: '#8B5CF6',
      bgColor: '#FAF5FF',
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      id: mainnet.id, 
      name: 'Ethereum', 
      icon: '🔷', 
      color: '#627EEA',
      bgColor: '#F0F4FF',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      id: polygon.id, 
      name: 'Polygon', 
      icon: '🟣', 
      color: '#8247E5',
      bgColor: '#F3F0FF',
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      id: arbitrum.id, 
      name: 'Arbitrum', 
      icon: '🔵', 
      color: '#28A0F0',
      bgColor: '#F0F9FF',
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      id: optimism.id, 
      name: 'Optimism', 
      icon: '🔴', 
      color: '#FF0420',
      bgColor: '#FFF0F0',
      gradient: 'from-red-500 to-orange-600'
    },
  ]

  const currentChain = supportedChains.find(chain => chain.id === chainId) || supportedChains[0]

  const handleChainSwitch = (chainId: number) => {
    switchChain({ chainId })
    setShowDropdown(false)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="relative">
      {/* Network Selector Button */}
      <div
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          backgroundColor: currentChain.bgColor,
          borderColor: currentChain.color + '30'
        }}
      >
        {/* Network Icon */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-transform duration-200 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${currentChain.color}, ${currentChain.color}dd)`,
            color: 'white'
          }}
        >
          {currentChain.icon}
        </div>
        
        {/* Network Name */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {currentChain.name}
          </span>
          <span className="text-xs text-gray-500">
            {currentChain.id === 1337 ? '本地网络' : 
             currentChain.id === 11155111 ? '测试网络' : 
             currentChain.id === 1 ? 'Mainnet' : 
             currentChain.id === 137 ? 'Polygon' :
             currentChain.id === 42161 ? 'Arbitrum One' :
             currentChain.id === 10 ? 'Optimism' : 'Network'}
          </span>
        </div>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 min-w-[280px] z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">选择网络</span>
          </div>
          
          {/* Network Options */}
          <div className="py-2">
            {supportedChains.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
                onClick={() => handleChainSwitch(chain.id)}
              >
                {/* Network Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-transform duration-200 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${chain.color}, ${chain.color}dd)`,
                    color: 'white'
                  }}
                >
                  {chain.icon}
                </div>
                
                {/* Network Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${chain.id === chainId ? 'text-blue-600' : 'text-gray-900'}`}>
                      {chain.name}
                    </span>
                    {chain.id === chainId && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {chain.id === 1337 ? '本地开发网络 (127.0.0.1:7545)' : 
                     chain.id === 11155111 ? '以太坊测试网络' : 
                     chain.id === 1 ? '以太坊主网' : 
                     chain.id === 137 ? 'Polygon 网络' :
                     chain.id === 42161 ? 'Arbitrum One' :
                     chain.id === 10 ? 'Optimism 网络' : '区块链网络'}
                  </span>
                </div>
                
                {/* Check Icon */}
                {chain.id === chainId && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              当前网络: {currentChain.name}
            </span>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
