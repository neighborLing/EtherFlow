'use client'

import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import UniswapNetworkSelector from './UniswapNetworkSelector'
import UniswapWalletAvatar from './UniswapWalletAvatar'
import UniswapConnectButton from './UniswapConnectButton'

export default function UniswapStyleHeader() {
  const { isConnected } = useAccount()
  const pathname = usePathname()

  const navigation = [
    { name: '合约交互', href: '/', icon: '🔧' },
    { name: '抢红包', href: '/redpacket', icon: '🧧' },
  ]

  return (
    <>
      {/* 背景渐变效果 */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>

      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

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
