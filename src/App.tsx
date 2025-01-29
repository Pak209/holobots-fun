import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Training from "@/pages/Training";
import Quests from "@/pages/Quests";
import HolosFarm from "@/pages/HolosFarm";
import HolobotsInfo from "@/pages/HolobotsInfo";
import Gacha from "@/pages/Gacha";
import UserItems from "@/pages/UserItems";
import Auth from "@/pages/Auth";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/training" element={<Training />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/holos-farm" element={<HolosFarm />} />
            <Route path="/holobots-info" element={<HolobotsInfo />} />
            <Route path="/gacha" element={<Gacha />} />
            <Route path="/user-items" element={<UserItems />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;