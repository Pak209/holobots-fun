
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig } from 'wagmi';
import { Web3ReactProvider } from '@web3-react/core';
import { wagmiConfig, ethereumClient, web3Connectors } from '@/lib/web3Config';
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Training from "@/pages/Training";
import Quests from "@/pages/Quests";
import HolosFarm from "@/pages/HolosFarm";
import HolobotsInfo from "@/pages/HolobotsInfo";
import Gacha from "@/pages/Gacha";
import UserItems from "@/pages/UserItems";
import Marketplace from "@/pages/Marketplace";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import { MobileLayout } from "@/components/MobileLayout";

const network = WalletAdapterNetwork.Mainnet;
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

function App() {
  return (
    <Web3ReactProvider connectors={web3Connectors as any}>
      <WagmiConfig config={wagmiConfig}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={wallets} autoConnect>
            <ThemeProvider defaultTheme="dark" enableSystem>
              <Router>
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* App routes with mobile layout */}
                    <Route path="/dashboard" element={<MobileLayout><Dashboard /></MobileLayout>} />
                    <Route path="/app" element={<MobileLayout><Index /></MobileLayout>} />
                    <Route path="/training" element={<MobileLayout><Training /></MobileLayout>} />
                    <Route path="/quests" element={<MobileLayout><Quests /></MobileLayout>} />
                    <Route path="/holos-farm" element={<MobileLayout><HolosFarm /></MobileLayout>} />
                    <Route path="/holobots-info" element={<MobileLayout><HolobotsInfo /></MobileLayout>} />
                    <Route path="/gacha" element={<MobileLayout><Gacha /></MobileLayout>} />
                    <Route path="/user-items" element={<MobileLayout><UserItems /></MobileLayout>} />
                    <Route path="/marketplace" element={<MobileLayout><Marketplace /></MobileLayout>} />
                    <Route path="/leaderboard" element={<MobileLayout><Leaderboard /></MobileLayout>} />
                  </Routes>
                  <Toaster />
                </AuthProvider>
              </Router>
            </ThemeProvider>
          </WalletProvider>
        </ConnectionProvider>
      </WagmiConfig>
      <Web3Modal projectId="YOUR_WALLETCONNECT_PROJECT_ID" ethereumClient={ethereumClient} />
    </Web3ReactProvider>
  );
}

export default App;
