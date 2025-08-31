'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import _ from 'lodash'
import { CONTRACT_CONFIG } from '../config/contract'
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi'
import ContractEvents, { IContractEventsRef } from './ContractEvents'

interface IContractInterfaceProps {
  contractAddress?: string
  contractABI?: any[]
}

interface ITransferData {
  to: string
  amount: string
}

interface IContractCallData {
  message: string
}

const ContractInterface: React.FC<IContractInterfaceProps> = ({ 
  contractAddress = CONTRACT_CONFIG.address,
  contractABI = CONTRACT_CONFIG.abi
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'contract'>('transfer')
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [count, setCount] = useState(0)
  const [owner, setOwner] = useState('')

  // 转账表单状态
  const [transferData, setTransferData] = useState<ITransferData>({
    to: '',
    amount: ''
  })

  // 合约调用表单状态
  const [contractCallData, setContractCallData] = useState<IContractCallData>({
    message: ''
  })

  // 钱包连接相关状态
  const { address, isConnected: wagmiConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined })
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [customContractAddress, setCustomContractAddress] = useState(CONTRACT_CONFIG.address)
  const contractEventsRef = useRef<IContractEventsRef>(null)

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        // 使用自定义地址或默认地址
        const addressToUse = customContractAddress || contractAddress
        const contract = new ethers.Contract(addressToUse, contractABI, signer)
        
        setProvider(provider)
        setSigner(signer)
        setContract(contract)
        setIsConnected(true)
        
        // 获取合约状态
        await fetchContractState()
      } else {
        console.error('MetaMask未安装')
      }
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  // 监听 wagmi 连接状态变化，同步本地状态
  useEffect(() => {
    if (wagmiConnected && address) {
      // 如果 wagmi 已连接，自动初始化 ethers 连接
      const initEthersConnection = async () => {
        try {
          if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            
            // 使用自定义地址或默认地址
            const addressToUse = customContractAddress || contractAddress
            const contract = new ethers.Contract(addressToUse, contractABI, signer)
            
            setProvider(provider)
            setSigner(signer)
            setContract(contract)
            setIsConnected(true)
            
            // 获取合约状态
            await fetchContractState()
          }
        } catch (error) {
          console.error('自动初始化 ethers 连接失败:', error)
        }
      }
      
      initEthersConnection()
    } else if (!wagmiConnected) {
      // 如果 wagmi 断开连接，重置本地状态
      setIsConnected(false)
      setProvider(null)
      setSigner(null)
      setContract(null)
    }
  }, [wagmiConnected, address, customContractAddress, contractAddress, contractABI])

  // 重新连接合约
  const reconnectContract = async () => {
    if (!signer) return
    
    try {
      const addressToUse = customContractAddress || contractAddress
      const contract = new ethers.Contract(addressToUse, contractABI, signer)
      setContract(contract)
      await fetchContractState()
      setOperationStatus({ type: 'success', message: '合约重新连接成功' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } catch (error) {
      console.error('重新连接合约失败:', error)
      setOperationStatus({ type: 'error', message: '合约连接失败，请检查地址' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    }
  }

  // 获取合约状态
  const fetchContractState = async () => {
    if (!contract) return
    
    try {
      const [messageResult, countResult, ownerResult] = await Promise.all([
        contract.getMessage(),
        contract.getCount(),
        contract.getOwner()
      ])
      
      setMessage(messageResult)
      setCount(Number(countResult))
      setOwner(ownerResult)
      
      // 同时刷新合约事件
      contractEventsRef.current?.refresh()
    } catch (error) {
      console.error('获取合约状态失败:', error)
      // 设置默认值，避免显示空白
      setMessage('合约未连接或地址错误')
      setCount(0)
      setOwner('未知')
    }
  }

  // 执行转账
  const handleTransfer = async () => {
    if (!signer || !ethers.isAddress(transferData.to) || !transferData.amount) {
      return
    }

    setLoading(true)
    try {
      const amountWei = ethers.parseEther(transferData.amount)
      const tx = await signer.sendTransaction({
        to: transferData.to,
        value: amountWei
      })
      
      await tx.wait()
      setTransferData({ to: '', amount: '' })
      setOperationStatus({ type: 'success', message: '转账成功' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } catch (error) {
      console.error('转账失败:', error)
      setOperationStatus({ type: 'error', message: '转账失败' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } finally {
      setLoading(false)
    }
  }

  // 设置消息
  const handleSetMessage = async () => {
    if (!contract || !contractCallData.message.trim()) {
      return
    }

    setLoading(true)
    try {
      const tx = await contract.setMessage(contractCallData.message)
      await tx.wait()
      await fetchContractState()
      setContractCallData({ message: '' })
      setOperationStatus({ type: 'success', message: '消息设置成功' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } catch (error) {
      console.error('设置消息失败:', error)
      setOperationStatus({ type: 'error', message: '设置消息失败' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } finally {
      setLoading(false)
    }
  }

  // 增加计数
  const handleIncrement = async () => {
    if (!contract) return

    setLoading(true)
    try {
      const tx = await contract.increment()
      await tx.wait()
      await fetchContractState()
      setOperationStatus({ type: 'success', message: '计数增加成功' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } catch (error) {
      console.error('增加计数失败:', error)
      setOperationStatus({ type: 'error', message: '增加计数失败' })
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000)
    } finally {
      setLoading(false)
    }
  }

  // 防抖处理
  const debouncedSetMessage = _.debounce((value: string) => {
    setContractCallData(prev => ({ ...prev, message: value }))
  }, 300)

  const debouncedSetTransferAmount = _.debounce((value: string) => {
    setTransferData(prev => ({ ...prev, amount: value }))
  }, 300)

  const debouncedSetTransferTo = _.debounce((value: string) => {
    setTransferData(prev => ({ ...prev, to: value }))
  }, 300)



  return (
    <div className="max-w-6xl mx-auto fade-in">
      {/* 标题区域 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          DeFi 交互平台
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          连接您的钱包，体验现代化的区块链交互界面
        </p>
      </div>

      {/* 操作状态提示 */}
      {operationStatus.type && (
        <div className={`mb-8 mx-auto max-w-md text-center ${
          operationStatus.type === 'success' ? 'status-success' : 'status-error'
        }`}>
          {operationStatus.message}
        </div>
      )}

      {/* 连接钱包按钮 */}
      {!wagmiConnected ? (
        <div className="text-center mb-12">
          <div className="uniswap-card max-w-md mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">连接钱包</h2>
              <p className="text-gray-300 mb-8">连接您的 MetaMask 钱包开始使用</p>
              <button
                onClick={connectWallet}
                className="gradient-btn w-full text-lg py-4"
              >
                连接 MetaMask
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tab切换 */}
          <div className="flex justify-center mb-8">
            <div className="glass p-2 rounded-2xl">
              <button
                onClick={() => setActiveTab('transfer')}
                className={`uniswap-tab ${activeTab === 'transfer' ? 'active' : ''}`}
              >
                💸 转账功能
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`uniswap-tab ${activeTab === 'contract' ? 'active' : ''}`}
              >
                📄 合约调用
              </button>
            </div>
          </div>

          {/* 转账Tab内容 */}
          {activeTab === 'transfer' && (
            <div className="space-y-8">
              <div className="uniswap-card glass-hover">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">转账功能</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      接收地址
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="uniswap-input w-full"
                      onChange={(e) => debouncedSetTransferTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      转账金额 (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.001"
                      className="uniswap-input w-full"
                      onChange={(e) => debouncedSetTransferAmount(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleTransfer}
                    disabled={loading || !signer}
                    className="gradient-btn w-full text-lg py-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        处理中...
                      </div>
                    ) : (
                      '执行转账'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 合约调用Tab内容 */}
          {activeTab === 'contract' && (
            <div className="space-y-8">
              {/* 合约地址配置 */}
              <div className="uniswap-card glass-hover">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">合约配置</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      合约地址 (可选)
                    </label>
                    <input
                      type="text"
                      value={customContractAddress}
                      onChange={(e) => setCustomContractAddress(e.target.value)}
                      placeholder="输入您的hello合约地址 (0x...)"
                      className="uniswap-input w-full"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20">
                    <div className="flex items-start">
                      <div className="text-yellow-400 mr-3 mt-1">💡</div>
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-2">提示：</p>
                        <ul className="space-y-1 text-gray-400">
                          <li>• 如果您已经部署了hello合约，请输入合约地址</li>
                          <li>• 确保合约地址格式正确 (0x开头的42位地址)</li>
                          <li>• 确保钱包连接到正确的网络</li>
                          <li>• 如果留空，将使用默认地址</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {wagmiConnected && (
                    <button
                      onClick={reconnectContract}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      重新连接合约
                    </button>
                  )}
                </div>
              </div>

              {/* 合约状态显示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="uniswap-card glass-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">当前消息</h3>
                  <p className="text-lg font-bold text-white">{message || '未连接'}</p>
                </div>
                <div className="uniswap-card glass-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">计数器</h3>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div className="uniswap-card glass-hover text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">合约所有者</h3>
                  <p className="text-sm font-bold text-white break-all">{owner || '未连接'}</p>
                </div>
              </div>

              {/* 合约操作 */}
              <div className="uniswap-card glass-hover">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">合约操作</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      设置新消息
                    </label>
                    <input
                      type="text"
                      placeholder="输入新消息..."
                      className="uniswap-input w-full"
                      onChange={(e) => debouncedSetMessage(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleSetMessage}
                      disabled={loading || !contract}
                      className="gradient-btn text-lg py-4"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          处理中...
                        </div>
                      ) : (
                        '设置消息'
                      )}
                    </button>
                    <button
                      onClick={handleIncrement}
                      disabled={loading || !contract}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          处理中...
                        </div>
                      ) : (
                        '增加计数'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <ContractEvents 
                ref={contractEventsRef}
                contractAddress={customContractAddress} 
              />
              {/* 刷新按钮 */}
              <div className="text-center">
                <button
                  onClick={fetchContractState}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  刷新合约状态
                </button>
              </div>
            </div>
          )}
        </>
      )}


    </div>
  )
}

export default ContractInterface
