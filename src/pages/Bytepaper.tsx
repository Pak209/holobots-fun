import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Layers, Swords, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import landingBg from "@/assets/icons/LandingPageBackground.png";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";

const ELECTRIC_YELLOW = "#F5C400";

const NeonIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div
    className="flex items-center justify-center text-[#00D4FF]"
    style={{
      filter: "drop-shadow(0 0 10px #00D4FF) drop-shadow(0 0 20px rgba(0,212,255,0.5))",
    }}
  >
    {icon}
  </div>
);

const Bytepaper = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* Background - same as landing */}
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
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%)",
          }}
        />
      </div>

      {/* Header - same style as landing */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-300 hover:text-[#F5C400] hover:bg-white/5 font-bold uppercase tracking-wider text-xs sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Link to="/auth">
            <Button
              size="sm"
              className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold uppercase tracking-wider text-xs sm:text-sm px-3 sm:px-4 py-1.5 border-0 transition-all shadow-[0_0_12px_rgba(0,100,200,0.5)]"
            >
              Play the Demo
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
        {/* Hero intro - landing-style typography */}
        <div className="text-center mb-12 sm:mb-16">
          <h1
            className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-2"
            style={{
              color: ELECTRIC_YELLOW,
              textShadow: "0 0 30px rgba(245,196,0,0.5), 0 0 60px rgba(245,196,0,0.3)",
            }}
          >
            Game Guide
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-4">
            Sync Circuit
          </p>
          <p className="text-gray-300 text-base sm:text-lg uppercase tracking-wider space-y-1">
            <span className="block">Build your deck.</span>
            <span className="block">Master the Arena.</span>
            <span className="block">Rise through the ranks.</span>
          </p>
        </div>

        {/* Sections - same panel style as landing "How It Works" */}
        <div className="space-y-6 sm:space-y-8">
          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white">
              What Is Holobots?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Holobots is a competitive strategy card game where your digital companion grows with you.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              This isn’t just a card game.
              <br />
              It’s the first chapter of a connected game universe.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-2">Your Holobot has:</p>
            <ul className="list-none space-y-1 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li className="flex items-center gap-2">
                <span className="text-[#F5C400]">•</span> Real stats
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#F5C400]">•</span> Real progression
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#F5C400]">•</span> Real rank
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#F5C400]">•</span> A battle history
              </li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Win matches. Improve your rank. Unlock stronger challenges.
              <br />
              <span className="text-[#F5C400] font-bold">Everything carries forward.</span>
            </p>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white">
              What Are Holobots?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Holobots are digital battle companions built for long-term growth.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              In Sync Circuit, they appear as powerful strategy cards.
              <br />
              But that’s only the beginning.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-2">Future modes will let you:</p>
            <ul className="list-none space-y-1 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Fight in real-time Arena battles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Explore shared worlds
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Compete in seasonal events
              </li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Your Holobot isn’t disposable.
              <br />
              <span className="text-[#F5C400] font-bold">It evolves with you.</span>
            </p>
          </div>

          {/* How It Works - 3 columns with cyan icons like landing */}
          <div
            className="w-full py-8 sm:py-12 px-6 sm:px-10 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-2 text-white text-center">
              How It Works
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-10 text-center uppercase tracking-wide">
              Build a deck. Battle Arena Masters. Climb the ranks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <div className="text-center flex flex-col items-center">
                <NeonIcon icon={<Layers className="w-10 h-10 sm:w-12 sm:h-12" />} />
                <h3 className="text-white font-bold uppercase tracking-wider text-sm sm:text-base mt-4 mb-2">
                  1. Build Your Deck
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Choose your Holobots.
                  <br />
                  Add tactical cards.
                  <br />
                  Shape your strategy.
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <NeonIcon icon={<Swords className="w-10 h-10 sm:w-12 sm:h-12" />} />
                <h3 className="text-white font-bold uppercase tracking-wider text-sm sm:text-base mt-4 mb-2">
                  2. Battle Arena Masters
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Each Master has a signature style.
                  <br />
                  Beat them to earn Rank Tokens.
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <NeonIcon icon={<TrendingUp className="w-10 h-10 sm:w-12 sm:h-12" />} />
                <h3 className="text-white font-bold uppercase tracking-wider text-sm sm:text-base mt-4 mb-2">
                  3. Climb the Ladder
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Unlock new tiers.
                  <br />
                  Face tougher opponents.
                  <br />
                  Prove your skill.
                </p>
              </div>
            </div>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white"
              style={{
                borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
                paddingBottom: "0.5rem",
                width: "fit-content",
              }}
            >
              Strategy Over Spam
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Holobots rewards smart play — not button mashing.
            </p>
            <ul className="list-none space-y-2 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Stamina-based card costs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> No elemental types
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Special + Hack meters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Archetype-driven decks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Tactical sequencing wins games
              </li>
            </ul>
            <p className="text-[#F5C400] font-bold uppercase tracking-wider">Timing &gt; luck.</p>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white"
              style={{
                borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
                paddingBottom: "0.5rem",
                width: "fit-content",
              }}
            >
              Arena Masters
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Each Arena Master guards a Rank Emblem and brings a unique strategy.
            </p>
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 border-l-2 pl-4 py-2 min-h-[60px]"
                style={{ borderColor: ELECTRIC_YELLOW }}
              >
                <img
                  src={getHolobotImagePath("KUMA")}
                  alt="KUMA"
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg border border-white/20 bg-black/40 object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div>
                  <p className="font-black text-white uppercase tracking-wider">KUMA</p>
                  <p className="text-gray-400 text-sm">Tank tempo + counterplay</p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 border-l-2 pl-4 py-2 min-h-[60px]"
                style={{ borderColor: ELECTRIC_YELLOW }}
              >
                <img
                  src={getHolobotImagePath("SHADOW")}
                  alt="SHADOW"
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg border border-white/20 bg-black/40 object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div>
                  <p className="font-black text-white uppercase tracking-wider">SHADOW</p>
                  <p className="text-gray-400 text-sm">Evasion pressure + burst</p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 border-l-2 pl-4 py-2 min-h-[60px]"
                style={{ borderColor: ELECTRIC_YELLOW }}
              >
                <img
                  src={getHolobotImagePath("ACE")}
                  alt="ACE"
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg border border-white/20 bg-black/40 object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div>
                  <p className="font-black text-white uppercase tracking-wider">ACE</p>
                  <p className="text-gray-400 text-sm">Aggressive offense + aerial finishers</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm sm:text-base mt-4">Beat them. Take their emblem. Move up.</p>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white"
              style={{
                borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
                paddingBottom: "0.5rem",
                width: "fit-content",
              }}
            >
              Choose Your Playstyle
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Every deck fits an archetype:
            </p>
            <ul className="list-none space-y-2 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li>
                <span className="text-[#F5C400] font-bold">Striker</span>
                <span className="text-gray-400"> – High pressure offense</span>
              </li>
              <li>
                <span className="text-[#F5C400] font-bold">Grappler</span>
                <span className="text-gray-400"> – Control + counterplay</span>
              </li>
              <li>
                <span className="text-[#F5C400] font-bold">Technical</span>
                <span className="text-gray-400"> – Meter manipulation</span>
              </li>
              <li>
                <span className="text-[#F5C400] font-bold">Balanced</span>
                <span className="text-gray-400"> – Adapt and react</span>
              </li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base">Experiment. Refine. Dominate.</p>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white"
              style={{
                borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
                paddingBottom: "0.5rem",
                width: "fit-content",
              }}
            >
              PvP Is Coming
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Soon you’ll battle real players in:
            </p>
            <ul className="list-none space-y-1 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Ranked ladder matches
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Seasonal resets
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Leaderboards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Competitive tournaments
              </li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base">
              Build smarter decks.
              <br />
              Outplay real opponents.
            </p>
          </div>

          <div
            className="w-full py-6 sm:py-8 px-4 sm:px-6 rounded-xl border-2"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white"
              style={{
                borderBottom: `2px solid ${ELECTRIC_YELLOW}`,
                paddingBottom: "0.5rem",
                width: "fit-content",
              }}
            >
              The Bigger Vision
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Sync Circuit is just Phase 1.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Future expansions will connect your Holobot across:
            </p>
            <ul className="list-none space-y-1 text-gray-300 text-sm sm:text-base mb-4 pl-0">
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Skill-based Arena combat
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Open world social hubs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00D4FF]">•</span> Competitive seasonal events
              </li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              One companion.
              <br />
              Multiple modes.
              <br />
              <span className="text-[#F5C400] font-bold">Shared progression.</span>
            </p>
          </div>

          {/* CTA section */}
          <div
            className="w-full py-8 sm:py-12 px-6 sm:px-10 rounded-xl border-2 text-center"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(245,196,0,0.4)",
              boxShadow: "0 0 30px rgba(245,196,0,0.15)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-4 text-white">
              This Is Just The Beginning.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              The Arena is open.
            </p>
            <p
              className="text-2xl sm:text-3xl font-black uppercase tracking-widest mb-8"
              style={{
                color: ELECTRIC_YELLOW,
                textShadow: "0 0 20px rgba(245,196,0,0.5)",
              }}
            >
              Are you ready?
            </p>
            <Link to="/auth">
              <Button
                className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest py-6 px-8"
                style={{ boxShadow: "0 0 20px rgba(245,196,0,0.6), 0 0 40px rgba(245,196,0,0.4)" }}
              >
                Play the Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
          <p>Game Guide · Holobots: Sync Circuit</p>
        </div>
      </main>
    </div>
  );
};

export default Bytepaper;
