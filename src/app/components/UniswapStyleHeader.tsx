'use client'

import { useAccount } from 'wagmi'
import UniswapNetworkSelector from './UniswapNetworkSelector'
import UniswapWalletAvatar from './UniswapWalletAvatar'
import UniswapConnectButton from './UniswapConnectButton'

export default function UniswapStyleHeader() {
  const { isConnected } = useAccount()

  return (
    <>
      {/* 背景渐变效果 */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {isConnected ? (
          <>
            <UniswapNetworkSelector />
            <UniswapWalletAvatar />
          </>
        ) : (
          <UniswapConnectButton />
        )}
      </div>
    </>
  )
}
