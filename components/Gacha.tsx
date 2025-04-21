import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ItemCard } from '@/components/items/ItemCard';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useAuthStore } from '@/store/auth-store';
import { Package, Ticket, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface GachaItem {
  name: string;
  rarity: "common" | "rare" | "extremely-rare";
  chance: number;
}

const ITEMS: GachaItem[] = [
  { name: "Daily Energy Refill", rarity: "common", chance: 0.597 },
  { name: "Exp Battle Booster", rarity: "rare", chance: 0.1015 },
  { name: "Temporary Attribute Boost", rarity: "rare", chance: 0.1015 },
  { name: "Rank Skip", rarity: "extremely-rare", chance: 0.002 }
];

const SINGLE_PULL_COST = 50;
const MULTI_PULL_COST = 500;
const DAILY_COOLDOWN_HOURS = 24;

export default function Gacha() {
  const { user, updateUser } = useAuthStore();
  const [pulls, setPulls] = useState<GachaItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeUntilNextDailyPull, setTimeUntilNextDailyPull] = useState<string | null>(null);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [isUsingItem, setIsUsingItem] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('gacha');

  const userItems = [
    {
      type: "arena-pass" as const,
      name: "Arena Pass",
      description: "Grants entry to one arena battle without costing HOLOS tokens",
      quantity: user?.arenaPasses || 0
    },
    {
      type: "gacha-ticket" as const,
      name: "Gacha Ticket",
      description: "Can be used for one pull in the Gacha system",
      quantity: user?.gachaTickets || 0
    },
    {
      type: "energy-refill" as const,
      name: "Daily Energy Refill",
      description: "Instantly restores your daily energy to full",
      quantity: user?.energyRefills || 0
    },
    {
      type: "exp-booster" as const,
      name: "EXP Battle Booster",
      description: "Doubles experience gained from battles for 24 hours",
      quantity: user?.expBoosters || 0
    },
    {
      type: "rank-skip" as const,
      name: "Rank Skip",
      description: "Skip to the next rank instantly",
      quantity: user?.rankSkips || 0
    }
  ];

  const handleUseItem = async (type: string) => {
    setIsUsingItem(true);
    
    try {
      switch (type) {
        case "arena-pass":
          if ((user.arenaPasses || 0) <= 0) {
            toast({
              title: "No Arena Passes",
              description: "You don't have any Arena Passes to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            arenaPasses: (user.arenaPasses || 0) - 1 
          });
          
          toast({
            title: "Arena Pass Used",
            description: "You can now enter one arena battle without spending HOLOS tokens.",
          });
          break;
          
        case "gacha-ticket":
          if ((user.gachaTickets || 0) <= 0) {
            toast({
              title: "No Gacha Tickets",
              description: "You don't have any Gacha Tickets to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            gachaTickets: (user.gachaTickets || 0) - 1 
          });
          
          const specialPull: GachaItem[] = [];
          const rand = Math.random();
          let cumulative = 0;
          
          for (const item of ITEMS) {
            cumulative += item.chance;
            if (rand <= cumulative) {
              specialPull.push(item);
              break;
            }
          }
          
          setPulls(specialPull);
          handleItemsFromPulls(specialPull);
          
          toast({
            title: "Gacha Ticket Used",
            description: "You received a special item from your ticket!",
          });
          break;
          
        case "energy-refill":
          if ((user.energyRefills || 0) <= 0) {
            toast({
              title: "No Energy Refills",
              description: "You don't have any Energy Refills to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            energyRefills: (user.energyRefills || 0) - 1,
            dailyEnergy: user.maxDailyEnergy // This will trigger the special handling in the store
          });
          
          toast({
            title: "Energy Refilled",
            description: "Your daily energy has been restored to full!",
          });
          break;
          
        case "exp-booster":
          if ((user.expBoosters || 0) <= 0) {
            toast({
              title: "No EXP Boosters",
              description: "You don't have any EXP Boosters to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            expBoosters: (user.expBoosters || 0) - 1
          });
          
          toast({
            title: "EXP Booster Active",
            description: "Double experience for all battles for the next 24 hours!",
          });
          break;
          
        case "rank-skip":
          if ((user.rankSkips || 0) <= 0) {
            toast({
              title: "No Rank Skips",
              description: "You don't have any Rank Skips to use.",
              variant: "destructive"
            });
            return;
          }
          
          await updateUser({ 
            rankSkips: (user.rankSkips || 0) - 1
          });
          
          toast({
            title: "Rank Skipped",
            description: "You've advanced to the next rank!",
          });
          break;
          
        default:
          toast({
            title: "Unknown Item",
            description: "This item cannot be used right now.",
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error("Error using item:", error);
      toast({
        title: "Error",
        description: "Failed to use the item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUsingItem(false);
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <div className="container mx-auto px-4 py-8 pt-16">
        <ProfileTabs defaultTab={activeTab} onTabChange={setActiveTab}>
          <TabsContent value="gacha" className="space-y-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/dbbb9702-9979-48e3-96d9-574fbbf4ec3f.png" 
                alt="Gacha Machine" 
                className="mx-auto mb-8 w-96 h-auto"
              />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-yellow-500" />
                    <span className="text-holobots-accent">Tickets: {user?.gachaTickets || 0}</span>
                  </div>
                </div>
                <div className="bg-holobots-card dark:bg-holobots-dark-card p-2 rounded-lg shadow-neon-border">
                  <span className="text-holobots-accent">Holos: {user?.holosTokens || 0}</span>
                </div>
              </div>
            </div>

            {/* Rest of the gacha content */}
          </TabsContent>
          
          <TabsContent value="items">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-holobots-text dark:text-holobots-dark-text">
                Your Items
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Use your items to gain advantages in battles, restore energy, or gain rewards.
              </p>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item, index) => (
                  <ItemCard
                    key={index}
                    name={item.name}
                    description={item.description}
                    quantity={item.quantity}
                    type={item.type}
                    onClick={() => handleUseItem(item.type)}
                    actionLabel="Use Item"
                    disabled={item.quantity <= 0}
                    isLoading={isUsingItem}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            {/* Profile content will be handled by the parent component */}
          </TabsContent>
        </ProfileTabs>
      </div>
    </div>
  );
} 