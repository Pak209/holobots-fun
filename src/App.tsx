
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
import Bytepaper from "./pages/Bytepaper";
import Mint from "@/pages/Mint";

const network = WalletAdapterNetwork.Mainnet;
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

// Implement error boundary to catch web3 errors
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Caught error in ErrorBoundary:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-holobots-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <p className="mb-4">We encountered an issue with Web3 components. You can still use the app without Web3 functionality.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-holobots-accent text-white rounded hover:bg-holobots-hover"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }
};

// Safely wrap Web3 components
const SafeWeb3Wrapper = ({ children }: { children: React.ReactNode }) => {
  try {
    return (
      <Web3ReactProvider connectors={web3Connectors as any}>
        <WagmiConfig config={wagmiConfig}>
          <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
            <WalletProvider wallets={wallets} autoConnect>
              {children}
            </WalletProvider>
          </ConnectionProvider>
        </WagmiConfig>
      </Web3ReactProvider>
    );
  } catch (error) {
    console.error("Failed to initialize Web3 components:", error);
    return <>{children}</>;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <SafeWeb3Wrapper>
        <ThemeProvider defaultTheme="dark" enableSystem>
          <Router>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/mint" element={<MobileLayout><Mint /></MobileLayout>} />
                
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
                <Route path="/bytepaper" element={<Bytepaper />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </SafeWeb3Wrapper>
      {/* Web3Modal rendered outside of error boundary */}
      <Web3Modal projectId="YOUR_WALLETCONNECT_PROJECT_ID" ethereumClient={ethereumClient} />
    </ErrorBoundary>
  );
}

export default App;
