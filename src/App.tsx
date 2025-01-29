import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Training from "./pages/Training";
import Quests from "./pages/Quests";
import HolobotsInfo from "./pages/HolobotsInfo";
import HolosFarm from "./pages/HolosFarm";
import Gacha from "./pages/Gacha";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/training" element={<Training />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/holobots-info" element={<HolobotsInfo />} />
            <Route path="/holos-farm" element={<HolosFarm />} />
            <Route path="/gacha" element={<Gacha />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;