import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Layers,
  Swords,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import landingBg from "@/assets/icons/LandingPageBackground.png";
import { Link, useNavigate } from "react-router-dom";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useRef, useCallback } from "react";

const ELECTRIC_YELLOW = "#F5C400";
const ELECTRIC_CYAN = "#00D4FF";

// Arena Masters: name, stats, signature style
const ARENA_MASTERS = [
  {
    key: "kuma",
    name: "KUMA",
    stats: HOLOBOT_STATS.kuma,
    signatureStyle: "Tank tempo + counterplay",
  },
  {
    key: "shadow",
    name: "SHADOW",
    stats: HOLOBOT_STATS.shadow,
    signatureStyle: "Evasion pressure + burst",
  },
  {
    key: "ace",
    name: "ACE",
    stats: HOLOBOT_STATS.ace,
    signatureStyle: "Aggressive offense + aerial finishers",
  },
] as const;

const ArenaMasterCard = ({
  name,
  stats,
  signatureStyle,
}: {
  name: string;
  stats: (typeof HOLOBOT_STATS)[keyof typeof HOLOBOT_STATS];
  signatureStyle: string;
}) => {
  const imagePath = getHolobotImagePath(name);
  const hpPct = ((stats.maxHealth ?? 100) / 200) * 100;
  const atkPct = ((stats.attack ?? 5) / 10) * 100;
  const defPct = ((stats.defense ?? 5) / 10) * 100;
  const spdPct = ((stats.speed ?? 5) / 10) * 100;

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border-2 min-h-[180px] transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,196,0,0.4)]"
      style={{
        background: "rgba(10, 10, 15, 0.6)",
        backdropFilter: "blur(12px)",
        borderColor: ELECTRIC_YELLOW,
        boxShadow: `0 0 15px rgba(245,196,0,0.3), inset 0 0 20px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-white/20 bg-black/40 flex items-center justify-center">
        <img
          src={imagePath}
          alt={name}
          className="w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-white uppercase tracking-wider">
              {name}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-cyan-300/90 font-medium">
            Signature Style: {signatureStyle}
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider">
            Deck Profile
          </p>
          <div className="space-y-1 text-xs">
            <StatBar label="HP" value={hpPct} />
            <StatBar label="ATK" value={atkPct} />
            <StatBar label="DEF" value={defPct} />
            <StatBar label="SPD" value={spdPct} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-300 w-8">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, value)}%`,
          background: `linear-gradient(90deg, ${ELECTRIC_CYAN}, ${ELECTRIC_YELLOW})`,
          boxShadow: `0 0 6px ${ELECTRIC_CYAN}`,
        }}
      />
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef<HTMLElement>(null);

  const handlePlayDemo = () => {
    navigate("/auth");
  };

  const scrollToHowItWorks = useCallback(() => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full -z-10" aria-hidden>
        <img
          src={landingBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </div>

      {/* Top Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center"
        style={{
          background: "rgba(5, 5, 10, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(245,196,0,0.2)",
        }}
      >
        <div className="text-lg sm:text-xl font-black italic tracking-widest uppercase text-white">
          HOLOBOTS
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link to="/bytepaper">
            <Button
              size="sm"
              className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-bold uppercase tracking-wider text-xs sm:text-sm px-3 sm:px-4 py-1.5 transition-all shadow-[0_0_12px_rgba(245,196,0,0.5)]"
            >
              Game Guide
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold uppercase tracking-wider text-xs sm:text-sm px-3 sm:px-4 py-1.5 border-0 transition-all shadow-[0_0_12px_rgba(0,100,200,0.5)]"
            onClick={handlePlayDemo}
          >
            Play the Demo
          </Button>
        </div>
      </header>

      <main className="relative pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 py-2">
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest mb-4"
              style={{
                color: ELECTRIC_YELLOW,
                textShadow: `0 0 30px rgba(245,196,0,0.5), 0 0 60px rgba(245,196,0,0.3)`,
              }}
            >
              Holobots: Sync Circuit
            </h1>
            <p className="text-gray-300 text-sm sm:text-base uppercase tracking-wider mb-6 lg:mb-8 max-w-xl mx-auto lg:mx-0">
              A competitive strategy card game set in a futuristic battle arena.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                className="w-full sm:w-auto bg-[#F5C400] hover:bg-[#D4A400] py-6 px-8 text-base sm:text-lg text-black font-black uppercase tracking-widest transition-all"
                onClick={handlePlayDemo}
                style={{
                  boxShadow: `0 0 20px rgba(245,196,0,0.6), 0 0 40px rgba(245,196,0,0.4)`,
                }}
              >
                Play the Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto py-6 px-8 text-base sm:text-lg bg-transparent border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black font-black uppercase tracking-widest transition-all"
                onClick={scrollToHowItWorks}
              >
                How It Works
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2 w-full max-w-md lg:max-w-xl">
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] flex items-center justify-center"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(0,212,255,0.4)) drop-shadow(0 0 60px rgba(245,196,0,0.3))",
              }}
            >
              <img
                src={getHolobotImagePath("KUMA")}
                alt="Mecha bear Holobot"
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          ref={howItWorksRef}
          className="my-16 sm:my-24 scroll-mt-24"
        >
          <div
            className="w-full py-8 sm:py-12 px-6 sm:px-10 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest mb-2 text-white text-center">
              How It Works
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 text-center uppercase tracking-wide">
              Build a deck, battle Arena Masters, and climb the ranks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <HowItWorksItem
                icon={<Layers className="w-10 h-10 sm:w-12 sm:h-12" />}
                title="Build Your Deck"
                body="Collect Holobot cards and customize a strategy that fits your playstyle."
              />
              <HowItWorksItem
                icon={<Swords className="w-10 h-10 sm:w-12 sm:h-12" />}
                title="Battle in the Arena"
                body="Play stamina-based cards—strikes, blocks, combos, and finishers—to outplay opponents."
              />
              <HowItWorksItem
                icon={<TrendingUp className="w-10 h-10 sm:w-12 sm:h-12" />}
                title="Rise Through the Ranks"
                body="Defeat Arena Masters and earn Rank Tokens to unlock tougher challenges."
              />
            </div>
          </div>
        </section>

        {/* Strategy Over Spam */}
        <section className="my-16 sm:my-24">
          <h2
            className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-6 sm:mb-8 text-white"
            style={{
              borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
              paddingBottom: "0.5rem",
              width: "fit-content",
            }}
          >
            Strategy Over Spam
          </h2>
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 list-none pl-0 text-gray-300 text-sm sm:text-base space-y-2"
            style={{
              background: "rgba(10, 10, 20, 0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(245,196,0,0.2)",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              Stamina-based card costs (no energy colors).
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              Archetype-driven decks: Striker, Grappler, Technical, Balanced.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              Special + Hack meters reward smart timing.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              Arena Masters with signature decks.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              Rank progression that unlocks new content.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="flex-shrink-0 w-4 h-4 mt-0.5 text-[#F5C400]" />
              PvP ladder (coming soon).
            </li>
          </ul>
        </section>

        {/* Arena Masters */}
        <section className="my-16 sm:my-24">
          <h2
            className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-2 text-white"
            style={{
              borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
              paddingBottom: "0.5rem",
              width: "fit-content",
            }}
          >
            Challenge the Arena Masters
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 uppercase tracking-wide">
            Each Master guards a Rank Emblem and a signature strategy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARENA_MASTERS.map(({ key, name, stats, signatureStyle }) => (
              <ArenaMasterCard
                key={key}
                name={name}
                stats={stats}
                signatureStyle={signatureStyle}
              />
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="my-16 sm:my-24">
          <h2
            className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-6 sm:mb-8 text-white"
            style={{
              borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
              paddingBottom: "0.5rem",
              width: "fit-content",
            }}
          >
            Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoadmapCard
              phase="Phase 1"
              title="Sync Circuit (Now)"
              items={[
                "Deck-building + Arena Battles",
                "Rank progression",
                "Starter collection",
              ]}
            />
            <RoadmapCard
              phase="Phase 2"
              title="Arena Mode (Next)"
              items={["2D fighter expansion", "Shared progression"]}
            />
            <RoadmapCard
              phase="Phase 3"
              title="Open World Nexus (Later)"
              items={["Social hub + tournaments", "Cross-mode progression"]}
            />
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="mt-20 sm:mt-28 text-center">
          <p className="text-gray-300 text-sm sm:text-base mb-6 uppercase tracking-wider max-w-xl mx-auto">
            Discover, collect, and compete in the Holobots Arena.
          </p>
          <Button
            className="py-6 px-12 text-lg font-black uppercase tracking-widest transition-all"
            onClick={handlePlayDemo}
            style={{
              background: ELECTRIC_YELLOW,
              color: "#000",
              boxShadow: `0 0 25px rgba(245,196,0,0.6), 0 0 50px rgba(245,196,0,0.4)`,
            }}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </footer>
      </main>
    </div>
  );
};

const HowItWorksItem = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="text-center flex flex-col items-center">
    <div
      className="flex items-center justify-center text-[#00D4FF] mb-4 transition-transform hover:scale-110"
      style={{
        filter:
          "drop-shadow(0 0 10px #00D4FF) drop-shadow(0 0 20px rgba(0,212,255,0.5))",
      }}
    >
      {icon}
    </div>
    <h3 className="text-white font-bold uppercase tracking-wider text-sm sm:text-base mb-2">
      {title}
    </h3>
    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs">
      {body}
    </p>
  </div>
);

const RoadmapCard = ({
  phase,
  title,
  items,
}: {
  phase: string;
  title: string;
  items: string[];
}) => (
  <div
    className="p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,196,0,0.2)]"
    style={{
      background: "rgba(10, 10, 15, 0.6)",
      backdropFilter: "blur(12px)",
      borderColor: "rgba(245,196,0,0.4)",
      boxShadow: "0 0 15px rgba(245,196,0,0.1)",
    }}
  >
    <p className="text-[#F5C400] text-xs font-bold uppercase tracking-widest mb-1">
      {phase}
    </p>
    <h3 className="text-white font-black uppercase tracking-wider text-base sm:text-lg mb-4">
      {title}
    </h3>
    <ul className="space-y-2 list-none pl-0 text-gray-400 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight className="flex-shrink-0 w-3 h-3 mt-1.5 text-[#F5C400]" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Landing;
