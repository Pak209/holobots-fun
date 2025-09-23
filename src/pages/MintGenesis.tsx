import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/onchain/config';
import MintGenesis from '@/onchain/MintGenesis';

const queryClient = new QueryClient();

export default function MintGenesisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] flex items-center justify-center p-4">
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <MintGenesis />
        </WagmiProvider>
      </QueryClientProvider>
    </div>
  );
}
