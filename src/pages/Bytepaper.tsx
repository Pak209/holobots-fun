
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Bytepaper = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-holobots-accent to-holobots-hover">
            HOLOBOTS BYTEPAPER
          </h1>
        </div>

        <div className="space-y-8 text-holobots-text">
          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">What are Holobots?</h2>
            <p className="mb-4">
              Holobots are collectible digital battling robots that exist on the blockchain. Each Holobot has unique attributes, abilities, and visual characteristics that make them special and valuable in the ecosystem.
            </p>
            <p>
              Holobots combine elements of RPG progression, battle strategy, and collectible gaming, creating a rich ecosystem where players can train, battle, and evolve their digital fighters.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Minting & Ownership</h2>
            <p className="mb-4">
              Players can mint their own Holobots using HOLOS tokens. Each minted Holobot becomes a unique NFT owned by the player, with verifiable blockchain ownership.
            </p>
            <p className="mb-4">
              The minting process uses a rarity system that determines the initial attributes of your Holobot. Rarer Holobots start with higher base stats but are more difficult to obtain.
            </p>
            <p>
              <strong>Minting Cost:</strong> 100-500 HOLOS tokens, varying by rarity tier and market conditions.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Battle System</h2>
            <p className="mb-4">
              The Arena Battle system allows players to pit their Holobots against AI opponents or other players in strategic combat. Battles use a turn-based system where speed, attack, defense, and intelligence stats determine outcomes.
            </p>
            <p className="mb-4">
              <strong>Battle Mechanics:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Attack Mode: Focuses on dealing maximum damage but increases vulnerability</li>
              <li>Defense Mode: Reduces damage taken and increases special gauge fill rate</li>
              <li>Special Attacks: Unique powerful moves that charge over time</li>
              <li>Hack System: Technical advantages that can be deployed strategically</li>
            </ul>
            <p>
              Winning battles earns HOLOS tokens, experience points, and occasionally special items.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Training & Progression</h2>
            <p className="mb-4">
              Holobots can be trained to improve their attributes and unlock new abilities. Training requires energy and time but results in permanent improvements to your Holobot.
            </p>
            <p className="mb-4">
              <strong>Training Options:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Attack Training: Increases damage output</li>
              <li>Defense Training: Improves damage reduction</li>
              <li>Speed Training: Enhances action frequency and evasion</li>
              <li>Intelligence Training: Improves special attack efficiency and hack success rate</li>
            </ul>
            <p>
              Each Holobot can level up through experience gained in battles and training. Higher levels unlock rank titles and new ability thresholds.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Quest System</h2>
            <p className="mb-4">
              Quests provide narrative-driven challenges that reward players with HOLOS tokens, experience, and special items. Quests range from simple tasks to complex multi-stage missions.
            </p>
            <p>
              Some quests require specific Holobots or attribute thresholds, encouraging diverse collection building and strategic progression.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Gacha System</h2>
            <p className="mb-4">
              The Gacha Machine allows players to obtain special items through a randomized drawing system. Players can use HOLOS tokens or special Gacha Tickets to pull from the machine.
            </p>
            <p className="mb-4">
              <strong>Available Items:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Daily Energy Refills: Restore training and battle energy</li>
              <li>Exp Battle Boosters: Increase experience gain from battles</li>
              <li>Arena Passes: Grant entry to special tournaments</li>
              <li>Rank Skips: Advance through ranking tiers faster</li>
              <li>Temporary Attribute Boosts: Enhance stats for limited periods</li>
            </ul>
            <p>
              <strong>Pull Costs:</strong> 50 HOLOS for a single pull, 500 HOLOS for ten pulls, with one free daily pull.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Marketplace</h2>
            <p className="mb-4">
              The Marketplace is a player-driven economy where Holobots, items, and upgrades can be bought and sold using HOLOS tokens.
            </p>
            <p className="mb-4">
              <strong>Marketplace Features:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Buy and sell Holobots with unique attributes and histories</li>
              <li>Trade special items and consumables</li>
              <li>Auction rare components and limited edition Holobots</li>
              <li>Set prices or accept bids on your digital assets</li>
            </ul>
            <p>
              All transactions are secured on the blockchain with a small marketplace fee that gets burned, creating deflationary pressure on the HOLOS token.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Leaderboard System</h2>
            <p className="mb-4">
              The Leaderboard showcases the top players across different categories including battle record, token holdings, and Holobot levels.
            </p>
            <p>
              Ranking on the leaderboard provides visibility, prestige, and occasionally special rewards during seasonal events.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">HOLOS Token</h2>
            <p className="mb-4">
              HOLOS is the primary utility token of the Holobots ecosystem, used for all in-game transactions, upgrades, and rewards.
            </p>
            <p className="mb-4">
              <strong>Token Utility:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Minting new Holobots</li>
              <li>Purchasing items and upgrades</li>
              <li>Tournament entry fees</li>
              <li>Marketplace transactions</li>
              <li>Staking for passive rewards</li>
            </ul>
            <p className="mb-4">
              <strong>Token Economics:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Total Supply: 1,000,000,000 HOLOS</li>
              <li>Initial Circulating Supply: 250,000,000 HOLOS</li>
              <li>Deflationary Mechanism: Transaction fees and certain actions burn tokens</li>
              <li>Distribution: 40% gameplay rewards, 20% staking rewards, 15% development, 15% marketing, 10% team</li>
            </ul>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Farming & Staking</h2>
            <p className="mb-4">
              Players can stake their HOLOS tokens in various pools to earn passive rewards. Different pools offer varying APR based on lock-up periods and risk profiles.
            </p>
            <p className="mb-4">
              <strong>Available Pools:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Solana Pool: 120% APR</li>
              <li>ETH Pool: 90% APR</li>
              <li>wBTC Pool: 75% APR</li>
              <li>NFT-backed Pools: Variable APR based on rarity</li>
            </ul>
            <p>
              Staking not only provides token rewards but can also grant special access to events, exclusive items, and governance voting rights.
            </p>
          </section>

          <section className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h2 className="text-2xl font-bold mb-4 text-holobots-accent">Future Development</h2>
            <p className="mb-4">
              The Holobots ecosystem has an extensive roadmap for continued development and expansion:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Guild System: Form teams and compete in guild wars</li>
              <li>Tournaments: Weekly and monthly competitive events with substantial prizes</li>
              <li>Breeding: Combine Holobots to create new ones with inherited traits</li>
              <li>Land Ownership: Establish bases and training facilities</li>
              <li>Mobile App: Expanded access across devices</li>
              <li>Governance DAO: Community-driven decision making</li>
            </ul>
            <p>
              Development priorities will be influenced by community feedback and governed through proposals once the DAO is established.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>This Bytepaper represents the current vision for the Holobots project and may be updated as development progresses.</p>
          <p className="mt-2">Last Updated: June 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Bytepaper;
