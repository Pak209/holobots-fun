import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Quests from "./pages/Quests";
import Training from "./pages/Training";
import HolobotsInfo from "./pages/HolobotsInfo";
import HolosFarm from "./pages/HolosFarm";
import Gacha from "./pages/Gacha";
import UserItems from "./pages/UserItems";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/training" element={<Training />} />
          <Route path="/holobots-info" element={<HolobotsInfo />} />
          <Route path="/holos-farm" element={<HolosFarm />} />
          <Route path="/gacha" element={<Gacha />} />
          <Route path="/user-items" element={<UserItems />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;