'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { ReactNode } from 'react';

// 定义本地测试链
const localhost = {
  id: 1337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:7545'] },
    public: { http: ['http://127.0.0.1:7545'] },
  },
  blockExplorers: {
    default: { name: 'Localhost', url: 'http://127.0.0.1:7545' },
  },
} as const;

const config = createConfig({
  chains: [localhost, sepolia, mainnet, polygon, arbitrum, optimism],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: 'your-walletconnect-project-id' // 替换为您的 WalletConnect Project ID
    }),
  ],
  transports: {
    [localhost.id]: http('http://127.0.0.1:7545'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export default function Web3ProviderWrapper({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}