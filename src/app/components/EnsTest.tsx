'use client'

import { useState } from 'react'
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi'
import { ethers } from 'ethers'

export default function EnsTest() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined })
  
  const [testAddress, setTestAddress] = useState('')
  const [ensResult, setEnsResult] = useState<{
    name: string | null
    avatar: string | null
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const generateAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=f3f4f6&size=32`
  }

  const testEnsLookup = async () => {
    if (!testAddress || !ethers.isAddress(testAddress)) {
      alert('请输入有效的以太坊地址')
      return
    }

    setLoading(true)
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        
        // 查询ENS名称
        const name = await provider.lookupAddress(testAddress)
        
        // 查询ENS头像
        let avatar = null
        if (name) {
          try {
            const resolver = await provider.getResolver(testAddress)
            if (resolver) {
              const avatarResult = await resolver.getAvatar()
              if (avatarResult && typeof avatarResult === 'string') {
                avatar = avatarResult
              } else if (avatarResult && typeof avatarResult === 'object' && (avatarResult as any).url) {
                avatar = (avatarResult as any).url
              }
            }
          } catch (error) {
            console.log('获取头像失败:', error)
          }
        }

        setEnsResult({ name, avatar })
      }
    } catch (error) {
      console.error('ENS查询失败:', error)
      setEnsResult({ name: null, avatar: null })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">ENS 功能测试</h2>
        <p className="text-gray-600">请先连接钱包以测试ENS功能</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">ENS 功能测试</h2>
      
      {/* 当前钱包ENS信息 */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">当前钱包ENS信息</h3>
        <div className="flex items-center gap-4">
          <img
            src={ensAvatar || generateAvatarUrl(address || '')}
            alt="Avatar"
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateAvatarUrl(address || '')
            }}
          />
          <div>
            <div className="font-medium">
              {ensName || '未设置ENS名称'}
            </div>
            <div className="text-sm text-gray-600 break-all">
              {address}
            </div>
          </div>
        </div>
      </div>

      {/* ENS查询测试 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">ENS查询测试</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            placeholder="输入以太坊地址 (0x...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={testEnsLookup}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '查询中...' : '查询ENS'}
          </button>
        </div>

        {/* 测试结果 */}
        {ensResult && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">查询结果</h4>
            <div className="flex items-center gap-4">
              {ensResult.avatar && (
                <img
                  src={ensResult.avatar}
                  alt="ENS Avatar"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateAvatarUrl(testAddress)
                  }}
                />
              )}
              <div>
                <div className="font-medium">
                  {ensResult.name || '未找到ENS名称'}
                </div>
                <div className="text-sm text-gray-600 break-all">
                  {testAddress}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 测试地址建议 */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold mb-2">测试地址建议</h4>
        <p className="text-sm text-gray-700 mb-2">
          您可以尝试以下已知的ENS地址进行测试：
        </p>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => setTestAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
            className="text-blue-600 hover:underline"
          >
            vitalik.eth (0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)
          </button>
          <br />
          <button
            onClick={() => setTestAddress('0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326')}
            className="text-blue-600 hover:underline"
          >
            rsf.eth (0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326)
          </button>
        </div>
      </div>
    </div>
  )
}
