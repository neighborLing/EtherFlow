'use client';

import { useAccount, useEnsName, useEnsAvatar, useSwitchChain, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';

export default function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined });
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [copied, setCopied] = useState(false);
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const supportedChains = [
    { ...mainnet, icon: '🔷' },
    { ...polygon, icon: '🟣' },
    { ...arbitrum, icon: '🔵' },
    { ...optimism, icon: '🔴' },
  ];

  const currentChain = supportedChains.find(chain => chain.id === chainId) || supportedChains[0];

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChainSwitch = (chainId: number) => {
    switchChain({ chainId });
    setShowChainDropdown(false);
  };

  const generateAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=f3f4f6&size=32`;
  };

  if (!isMounted || !isConnected || !address) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <h1 className="text-2xl font-bold text-gray-900">数据上链系统</h1>
      </div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Chain Switcher */}
      <div className="relative">
        <div
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowChainDropdown(!showChainDropdown)}
          title="切换网络"
        >
          <span className="text-lg">{currentChain.icon}</span>
          <span className="text-sm font-medium text-gray-900">{currentChain.name}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showChainDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-full z-50">
            {supportedChains.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                onClick={() => handleChainSwitch(chain.id)}
              >
                <span className="text-lg">{chain.icon}</span>
                <span className={`font-medium ${chain.id === chainId ? 'text-blue-600' : 'text-gray-900'}`}>
                  {chain.name}
                </span>
                {chain.id === chainId && (
                  <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Info */}
      <div 
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={copyToClipboard}
        title={copied ? '已复制!' : '点击复制地址'}
      >
        <div className="flex-shrink-0">
          <img
            src={ensAvatar || generateAvatarUrl(address)}
            alt="Account Avatar"
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateAvatarUrl(address);
            }}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
          {ensName && (
            <span className="text-xs text-gray-500 truncate">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          )}
        </div>
        {copied && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            已复制!
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showChainDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowChainDropdown(false)}
        />
      )}
      </div>
    </>
  );
}