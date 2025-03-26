
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth";
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
import Fitness from "@/pages/Fitness";

// Simple auth check component
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  // This is just a simple client-side check
  // The real auth check is done within the AuthProvider
  const hasSession = localStorage.getItem("supabase.auth.token") !== null;
  
  if (!hasSession) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/mint" element={<MobileLayout><Mint /></MobileLayout>} />
            <Route path="/bytepaper" element={<Bytepaper />} />
            
            {/* App routes with mobile layout & auth protection */}
            <Route path="/dashboard" element={
              <RequireAuth>
                <MobileLayout><Dashboard /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/app" element={
              <RequireAuth>
                <MobileLayout><Index /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/training" element={
              <RequireAuth>
                <MobileLayout><Training /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/quests" element={
              <RequireAuth>
                <MobileLayout><Quests /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/holos-farm" element={
              <RequireAuth>
                <MobileLayout><HolosFarm /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/holobots-info" element={
              <RequireAuth>
                <MobileLayout><HolobotsInfo /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/gacha" element={
              <RequireAuth>
                <MobileLayout><Gacha /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/user-items" element={
              <RequireAuth>
                <MobileLayout><UserItems /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/marketplace" element={
              <RequireAuth>
                <MobileLayout><Marketplace /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/leaderboard" element={
              <RequireAuth>
                <MobileLayout><Leaderboard /></MobileLayout>
              </RequireAuth>
            } />
            <Route path="/fitness" element={
              <RequireAuth>
                <MobileLayout><Fitness /></MobileLayout>
              </RequireAuth>
            } />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
