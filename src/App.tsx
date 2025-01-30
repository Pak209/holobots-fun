import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Index from "@/pages/Index";
import Training from "@/pages/Training";
import Quests from "@/pages/Quests";
import HolosFarm from "@/pages/HolosFarm";
import HolobotsInfo from "@/pages/HolobotsInfo";
import Gacha from "@/pages/Gacha";
import UserItems from "@/pages/UserItems";
import Auth from "@/pages/Auth";
import { useAuth } from "@/contexts/AuthContext";

const network = WalletAdapterNetwork.Mainnet;
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Web3ReactProvider connectors={web3Connectors}>
      <WagmiConfig config={wagmiConfig}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={wallets} autoConnect>
            <ThemeProvider defaultTheme="system" enableSystem>
              <AuthProvider>
                <Router>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
                    <Route path="/quests" element={<ProtectedRoute><Quests /></ProtectedRoute>} />
                    <Route path="/holos-farm" element={<ProtectedRoute><HolosFarm /></ProtectedRoute>} />
                    <Route path="/holobots-info" element={<ProtectedRoute><HolobotsInfo /></ProtectedRoute>} />
                    <Route path="/gacha" element={<ProtectedRoute><Gacha /></ProtectedRoute>} />
                    <Route path="/user-items" element={<ProtectedRoute><UserItems /></ProtectedRoute>} />
                  </Routes>
                </Router>
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </WalletProvider>
        </ConnectionProvider>
      </WagmiConfig>
      <Web3Modal projectId="YOUR_WALLETCONNECT_PROJECT_ID" ethereumClient={ethereumClient} />
    </Web3ReactProvider>
  );
}

export default App;