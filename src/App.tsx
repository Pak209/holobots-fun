
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

function App() {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bytepaper" element={<Bytepaper />} />
            
            {/* Protected Routes with Mobile Layout */}
            <Route path="/mint" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Mint />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Dashboard />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/app" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Index />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/training" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Training />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/quests" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Quests />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/holos-farm" element={
              <ProtectedRoute>
                <MobileLayout>
                  <HolosFarm />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/holobots-info" element={
              <ProtectedRoute>
                <MobileLayout>
                  <HolobotsInfo />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/gacha" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Gacha />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/user-items" element={
              <ProtectedRoute>
                <MobileLayout>
                  <UserItems />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Marketplace />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Leaderboard />
                </MobileLayout>
              </ProtectedRoute>
            } />
            <Route path="/fitness" element={
              <ProtectedRoute>
                <MobileLayout>
                  <Fitness />
                </MobileLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
