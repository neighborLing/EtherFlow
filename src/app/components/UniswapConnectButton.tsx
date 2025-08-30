'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function UniswapConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectorList, setShowConnectorList] = useState(false)

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          断开连接
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectorList(!showConnectorList)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        连接钱包
      </button>

      {showConnectorList && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 min-w-[280px] z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">选择钱包</span>
          </div>
          
          <div className="py-2">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
                onClick={() => {
                  connect({ connector })
                  setShowConnectorList(false)
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {connector.name}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {connector.id === 'injected' ? '浏览器钱包 (MetaMask等)' : 
                     connector.id === 'walletConnect' ? 'WalletConnect' : '钱包连接器'}
                  </span>
                </div>
                
                {isPending && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              推荐使用 MetaMask 或 WalletConnect
            </span>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showConnectorList && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowConnectorList(false)}
        />
      )}
    </div>
  )
}
