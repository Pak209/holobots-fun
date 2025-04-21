import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CircleUser, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProfileTabs({ children, defaultTab = "profile", onTabChange }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 h-14 bg-holobots-card dark:bg-holobots-dark-card rounded-full p-1">
        <TabsTrigger 
          value="profile" 
          className={cn(
            "flex items-center gap-2 rounded-full transition-all",
            "data-[state=active]:bg-holobots-accent data-[state=active]:text-white",
            "data-[state=inactive]:text-gray-500 hover:text-holobots-accent"
          )}
        >
          <CircleUser className="w-5 h-5" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger 
          value="items" 
          className={cn(
            "flex items-center gap-2 rounded-full transition-all",
            "data-[state=active]:bg-holobots-accent data-[state=active]:text-white",
            "data-[state=inactive]:text-gray-500 hover:text-holobots-accent"
          )}
        >
          <Package className="w-5 h-5" />
          <span className="hidden sm:inline">Items</span>
        </TabsTrigger>
        <TabsTrigger 
          value="gacha" 
          className={cn(
            "flex items-center gap-2 rounded-full transition-all",
            "data-[state=active]:bg-holobots-accent data-[state=active]:text-white",
            "data-[state=inactive]:text-gray-500 hover:text-holobots-accent"
          )}
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Gacha</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  );
} 