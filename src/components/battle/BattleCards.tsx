import { HOLOBOT_STATS, HolobotStats } from "@/types/holobot";
import { getExperienceProgress } from "@/utils/battleUtils";

interface BattleCardsProps {
  selectedLeftHolobot: string;
  selectedRightHolobot: string;
  leftLevel: number;
  rightLevel: number;
  leftXp: number;
  rightXp: number; // This prop exists but isn't used in the component
}

export const BattleCards = ({
  selectedLeftHolobot,
  selectedRightHolobot,
  leftLevel,
  rightLevel,
  leftXp
}: BattleCardsProps) => {
  const leftHolobotBaseStats = HOLOBOT_STATS[selectedLeftHolobot];
  const rightHolobotBaseStats = HOLOBOT_STATS[selectedRightHolobot];

  // Retrieve user's holobots from local storage or default to an empty array
  const storedHolobots = localStorage.getItem('holobots');
  const userHolobots = storedHolobots ? JSON.parse(storedHolobots) : [];

  // Find the selected holobots in the user's collection
  const leftUserHolobot = userHolobots.find((h: any) =>
    h.name.toLowerCase() === leftHolobotBaseStats?.name?.toLowerCase()
  );
  const rightUserHolobot = userHolobots.find((h: any) =>
    h.name.toLowerCase() === rightHolobotBaseStats?.name?.toLowerCase()
  );

  const leftHolobotStats = leftHolobotBaseStats ? applyUserHolobotBoosts(leftHolobotBaseStats, leftUserHolobot) : leftHolobotBaseStats;
  const rightHolobotStats = rightHolobotBaseStats ? applyUserHolobotBoosts(rightHolobotBaseStats, rightUserHolobot) : rightHolobotBaseStats;

  const leftXpDetails = getExperienceProgress(leftXp, leftLevel);

  return (
    <div className="flex justify-between items-center gap-2">
      {/* Left Holobot Card */}
      <div className="w-1/2 bg-holobots-card p-3 rounded-lg border border-holobots-border shadow-neon">
        <h3 className="text-lg font-bold text-holobots-text">{leftHolobotStats?.name}</h3>
        <p className="text-sm text-gray-400">Level: {leftLevel}</p>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
            <div
              style={{ width: `${leftXpDetails.progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-holobots-accent transition-all duration-500"
            ></div>
          </div>
          <p className="text-[0.6rem] text-gray-500 absolute -top-4">{leftXpDetails.currentXp} / {leftXpDetails.requiredXp} XP</p>
        </div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Attack: {leftHolobotStats?.attack}</span>
          <span>Defense: {leftHolobotStats?.defense}</span>
          <span>Speed: {leftHolobotStats?.speed}</span>
        </div>
      </div>

      {/* Right Holobot Card */}
      <div className="w-1/2 bg-holobots-card p-3 rounded-lg border border-holobots-border shadow-neon">
        <h3 className="text-lg font-bold text-holobots-text">{rightHolobotStats?.name}</h3>
        <p className="text-sm text-gray-400">Level: {rightLevel}</p>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
            <div
              style={{ width: `0%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-500"
            ></div>
          </div>
          <p className="text-[0.6rem] text-gray-500 absolute -top-4">0 / 0 XP</p>
        </div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Attack: {rightHolobotStats?.attack}</span>
          <span>Defense: {rightHolobotStats?.defense}</span>
          <span>Speed: {rightHolobotStats?.speed}</span>
        </div>
      </div>
    </div>
  );
};

// Helper functions with proper types
const applyUserHolobotBoosts = (baseStats: HolobotStats, userHolobot: any): HolobotStats => {
  if (!userHolobot || !userHolobot.boostedAttributes) {
    return baseStats;
  }

  const boostedStats: HolobotStats = { ...baseStats };

  if (userHolobot.boostedAttributes.attack) {
    boostedStats.attack += userHolobot.boostedAttributes.attack;
  }
  if (userHolobot.boostedAttributes.defense) {
    boostedStats.defense += userHolobot.boostedAttributes.defense;
  }
  if (userHolobot.boostedAttributes.speed) {
    boostedStats.speed += userHolobot.boostedAttributes.speed;
  }
    if (userHolobot.boostedAttributes.health && boostedStats.maxHealth) {
        boostedStats.maxHealth += userHolobot.boostedAttributes.health;
    }

  return boostedStats;
};
