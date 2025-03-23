
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MarketplaceFilters, FilterOptions } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceHolobotCard } from "@/components/marketplace/MarketplaceHolobotCard";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Boxes, 
  AlertCircle, 
  Gem, 
  PackagePlus, 
  Info, 
  Plus,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Item definitions
const MARKETPLACE_ITEMS = [
  // Holobots
  {
    id: "h1",
    type: "holobot",
    name: "ACE",
    level: 15,
    price: 5000,
    seller: "HoloTrader",
    createdAt: new Date('2023-07-15')
  },
  {
    id: "h2",
    type: "holobot",
    name: "KUMA",
    level: 22,
    price: 7500,
    seller: "RareBotSeller",
    createdAt: new Date('2023-07-10')
  },
  {
    id: "h3",
    type: "holobot",
    name: "HARE",
    level: 8,
    price: 3000,
    seller: "NewbTrader",
    createdAt: new Date('2023-07-18')
  },
  
  // Blueprints
  {
    id: "b1",
    type: "blueprint",
    holobotName: "ACE",
    tier: 1,
    price: 500,
    seller: "BlueprintMaster",
    createdAt: new Date('2023-07-16')
  },
  {
    id: "b2",
    type: "blueprint",
    holobotName: "KUMA",
    tier: 2,
    price: 1200,
    seller: "BlueprintMaster",
    createdAt: new Date('2023-07-17')
  },
  {
    id: "b3",
    type: "blueprint",
    holobotName: "WOLF",
    tier: 3,
    price: 2500,
    seller: "LegendaryTrader",
    createdAt: new Date('2023-07-12')
  },
  {
    id: "b4",
    type: "blueprint",
    holobotName: "TORA",
    tier: 2,
    price: 1000,
    seller: "RareBotSeller",
    createdAt: new Date('2023-07-15')
  },
  
  // Items
  {
    id: "i1",
    type: "item",
    itemType: "energy-refill" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "Daily Energy Refill",
    description: "Restores your daily energy to full",
    rarity: "common" as "common" | "rare" | "extremely-rare",
    price: 200,
    seller: "ItemShop",
    quantity: 3,
    createdAt: new Date('2023-07-19')
  },
  {
    id: "i2",
    type: "item",
    itemType: "exp-booster" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "EXP Battle Booster",
    description: "Doubles experience gained from battles for 24 hours",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 750,
    seller: "BoostMaster",
    quantity: 1,
    createdAt: new Date('2023-07-14')
  },
  {
    id: "i3",
    type: "item",
    itemType: "rank-skip" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "Rank Skip",
    description: "Skip to the next rank instantly",
    rarity: "extremely-rare" as "common" | "rare" | "extremely-rare",
    price: 5000,
    seller: "LegendaryTrader",
    quantity: 1,
    createdAt: new Date('2023-07-05')
  },
  {
    id: "i4",
    type: "item",
    itemType: "arena-pass" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "Arena Pass",
    description: "Grants entry to one arena battle without costing HOLOS tokens",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,
    seller: "BattleMaster",
    quantity: 2,
    createdAt: new Date('2023-07-12')
  },
  {
    id: "i5",
    type: "item",
    itemType: "gacha-ticket" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "Gacha Ticket",
    description: "Can be used for one pull in the Gacha system",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,
    seller: "GachaDealer",
    quantity: 3,
    createdAt: new Date('2023-07-16')
  },
  {
    id: "i6",
    type: "item",
    itemType: "boss-quest-pass" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "attribute-boost" | "boss-quest-pass",
    name: "Boss Quest Pass",
    description: "Challenge bosses without spending energy",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 300,
    seller: "BossHunter",
    quantity: 5,
    createdAt: new Date('2023-07-20')
  }
];

// Blueprint daily specials
const BLUEPRINT_SPECIALS = [
  { day: 1, holobotName: "ACE", tier: 1, discount: 0.25 },
  { day: 2, holobotName: "KUMA", tier: 1, discount: 0.25 },
  { day: 3, holobotName: "WOLF", tier: 1, discount: 0.25 },
  { day: 4, holobotName: "TORA", tier: 1, discount: 0.25 },
  { day: 5, holobotName: "HARE", tier: 1, discount: 0.25 },
  { day: 6, holobotName: "ACE", tier: 2, discount: 0.2 },
  { day: 0, holobotName: "KUMA", tier: 2, discount: 0.2 },
];

// Item daily specials
const ITEM_SPECIALS = [
  { day: 1, itemType: "energy-refill", discount: 0.5 },
  { day: 2, itemType: "gacha-ticket", discount: 0.3 },
  { day: 3, itemType: "arena-pass", discount: 0.4 },
  { day: 4, itemType: "exp-booster", discount: 0.3 },
  { day: 5, itemType: "boss-quest-pass", discount: 0.3 },
  { day: 6, itemType: "rank-skip", discount: 0.15 },
  { day: 0, itemType: "attribute-boost", discount: 0.25 },
];

// Base prices for each item type
const ITEM_BASE_PRICES = {
  "energy-refill": 200,
  "gacha-ticket": 150,
  "arena-pass": 100,
  "exp-booster": 750,
  "rank-skip": 5000,
  "boss-quest-pass": 300,
  "attribute-boost": 400
};

// Base prices for blueprints by tier
const BLUEPRINT_BASE_PRICES = {
  1: 500,
  2: 1200,
  3: 2500
};

const Marketplace = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    searchQuery: "",
    sortBy: "newest"
  });
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS);
  const [dailySpecials, setDailySpecials] = useState<any[]>([]);
  
  // Get current day of week (0-6, where 0 is Sunday)
  const currentDayOfWeek = new Date().getDay();
  
  // Daily marketplace specials generation
  useEffect(() => {
    const dayItems = [];
    
    // Get blueprint special for today
    const blueprintSpecial = BLUEPRINT_SPECIALS.find(s => s.day === currentDayOfWeek);
    if (blueprintSpecial) {
      const basePrice = BLUEPRINT_BASE_PRICES[blueprintSpecial.tier];
      const discountedPrice = Math.floor(basePrice * (1 - blueprintSpecial.discount));
      
      dayItems.push({
        id: `special-bp-${blueprintSpecial.holobotName}`,
        type: "blueprint",
        holobotName: blueprintSpecial.holobotName,
        tier: blueprintSpecial.tier,
        price: discountedPrice,
        originalPrice: basePrice,
        seller: "Daily Specials",
        createdAt: new Date(),
        discount: blueprintSpecial.discount * 100
      });
    }
    
    // Get item special for today
    const itemSpecial = ITEM_SPECIALS.find(s => s.day === currentDayOfWeek);
    if (itemSpecial) {
      const basePrice = ITEM_BASE_PRICES[itemSpecial.itemType];
      const discountedPrice = Math.floor(basePrice * (1 - itemSpecial.discount));
      
      // Find the name and description for this item type
      const itemTemplate = MARKETPLACE_ITEMS.find(
        item => item.type === "item" && item.itemType === itemSpecial.itemType
      ) as any;
      
      dayItems.push({
        id: `special-item-${itemSpecial.itemType}`,
        type: "item",
        itemType: itemSpecial.itemType,
        name: itemTemplate?.name || `${itemSpecial.itemType.replace("-", " ")}`,
        description: itemTemplate?.description || "Special offer for today only!",
        rarity: "rare",
        price: discountedPrice,
        originalPrice: basePrice,
        seller: "Daily Specials",
        quantity: 1,
        createdAt: new Date(),
        discount: itemSpecial.discount * 100
      });
    }
    
    setDailySpecials(dayItems);
  }, [currentDayOfWeek]);
  
  useEffect(() => {
    // Apply filters to the marketplace items
    let results = [...MARKETPLACE_ITEMS];
    
    // Filter by type
    if (filters.type !== 'all') {
      results = results.filter(item => item.type === filters.type);
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(item => 
        item.name?.toLowerCase().includes(query) || 
        item.holobotName?.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query)
      );
    }
    
    // Filter by price range
    if (filters.minPrice !== undefined) {
      results = results.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(item => item.price <= filters.maxPrice!);
    }
    
    // Filter by level range (only for holobots)
    if (filters.minLevel !== undefined) {
      results = results.filter(item => 
        item.type !== 'holobot' || (item.level && item.level >= filters.minLevel!)
      );
    }
    if (filters.maxLevel !== undefined) {
      results = results.filter(item => 
        item.type !== 'holobot' || (item.level && item.level <= filters.maxLevel!)
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'level-asc':
          if (a.type === 'holobot' && b.type === 'holobot') {
            return (a.level || 0) - (b.level || 0);
          }
          return 0;
        case 'level-desc':
          if (a.type === 'holobot' && b.type === 'holobot') {
            return (b.level || 0) - (a.level || 0);
          }
          return 0;
        default:
          return 0;
      }
    });
    
    setFilteredItems(results);
  }, [filters]);
  
  const handleBuy = (itemId: string, itemName: string, price: number, itemType?: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to buy items.",
        variant: "destructive",
      });
      return;
    }
    
    if ((user.holosTokens || 0) < price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${price} HOLOS to purchase this item.`,
        variant: "destructive",
      });
      return;
    }
    
    // Update user's holos balance
    const newHolosBalance = user.holosTokens - price;
    const updates: any = { holosTokens: newHolosBalance };
    
    // Update the appropriate item counter based on item type
    if (itemType) {
      switch (itemType) {
        case 'arena-pass':
          updates.arena_passes = (user.arena_passes || 0) + 1;
          break;
        case 'gacha-ticket':
          updates.gachaTickets = (user.gachaTickets || 0) + 1;
          break;
        case 'energy-refill':
          updates.energy_refills = (user.energy_refills || 0) + 1;
          break;
        case 'exp-booster':
          updates.exp_boosters = (user.exp_boosters || 0) + 1;
          break;
        case 'rank-skip':
          updates.rank_skips = (user.rank_skips || 0) + 1;
          break;
        case 'boss-quest-pass':
          updates.boss_quest_passes = (user.boss_quest_passes || 0) + 1;
          break;
        default:
          break;
      }
    }
    
    // Handle blueprint purchases
    if (itemId.startsWith('b') || itemId.includes('special-bp')) {
      const bpItem = [...MARKETPLACE_ITEMS, ...dailySpecials].find(i => i.id === itemId);
      if (bpItem && bpItem.holobotName) {
        const holobotKey = bpItem.holobotName.toLowerCase();
        const blueprints = { ...(user.blueprints || {}) };
        blueprints[holobotKey] = (blueprints[holobotKey] || 0) + 1;
        updates.blueprints = blueprints;
      }
    }
    
    // Update user profile
    updateUser(updates);
    
    toast({
      title: "Purchase Successful!",
      description: `You have purchased ${itemName} for ${price} HOLOS.`,
    });
  };
  
  const handleSell = () => {
    toast({
      title: "Coming Soon",
      description: "The ability to sell items will be available soon!",
    });
  };
  
  // Handle using a rank skip item
  const handleUseRankSkip = () => {
    if (!user || (user.rank_skips || 0) <= 0) {
      toast({
        title: "Cannot Use Item",
        description: "You don't have any Rank Skip items to use.",
        variant: "destructive"
      });
      return;
    }
    
    // For demonstration, we'll just increase the user's level
    const newLevel = (user.level || 1) + 1;
    updateUser({
      level: newLevel,
      rank_skips: (user.rank_skips || 0) - 1
    });
    
    toast({
      title: "Rank Skipped!",
      description: `You've advanced to level ${newLevel}!`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            HOLOBOT MARKETPLACE
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Buy and sell Holobots, Blueprints, and Items
          </p>
        </div>
        
        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Browse Marketplace
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1">
              <Boxes className="h-4 w-4" />
              My Inventory
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            {/* Daily Specials Section */}
            {dailySpecials.length > 0 && (
              <div className="mb-8">
                <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-yellow-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      Daily Marketplace Specials
                      <CalendarDays className="h-4 w-4 ml-2 text-gray-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4">
                      Special discounted items change every day. Don't miss today's deals!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dailySpecials.map(item => {
                        if (item.type === "blueprint") {
                          return (
                            <BlueprintCard 
                              key={item.id}
                              holobotName={item.holobotName}
                              tier={item.tier}
                              price={item.price}
                              originalPrice={item.originalPrice}
                              forSale={true}
                              discounted={true}
                              onClick={() => handleBuy(item.id, `${item.holobotName} Blueprint (Tier ${item.tier})`, item.price)}
                            />
                          );
                        } else if (item.type === "item") {
                          return (
                            <MarketplaceItemCard 
                              key={item.id}
                              name={item.name}
                              description={item.description}
                              rarity={item.rarity}
                              price={item.price}
                              originalPrice={item.originalPrice}
                              seller={item.seller}
                              quantity={item.quantity}
                              type={item.itemType}
                              discounted={true}
                              onBuy={() => handleBuy(item.id, item.name, item.price, item.itemType)}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <MarketplaceFilters 
              filters={filters}
              onFilterChange={setFilters}
            />
            
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground max-w-md">
                  No marketplace listings match your current filters. Try adjusting your search criteria or check back later for new listings.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Holobots section */}
                {filteredItems.some(item => item.type === 'holobot') && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Gem className="mr-2 h-5 w-5 text-holobots-accent" />
                      Holobots
                    </h2>
                    <div className="space-y-4">
                      {filteredItems
                        .filter(item => item.type === 'holobot')
                        .map(item => {
                          const holobotKey = item.name.toLowerCase();
                          const holobotStats = HOLOBOT_STATS[holobotKey];
                          
                          if (!holobotStats) return null;
                          
                          return (
                            <MarketplaceHolobotCard
                              key={item.id}
                              holobotKey={holobotKey}
                              holobotStats={{
                                ...holobotStats,
                                level: item.level || 1
                              }}
                              price={item.price}
                              seller={item.seller}
                              forSale={true}
                              onBuy={() => handleBuy(item.id, item.name, item.price)}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
                
                {/* Blueprints section */}
                {filteredItems.some(item => item.type === 'blueprint') && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <PackagePlus className="mr-2 h-5 w-5 text-holobots-accent" />
                      Blueprints
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {filteredItems
                        .filter(item => item.type === 'blueprint')
                        .map(item => (
                          <BlueprintCard 
                            key={item.id}
                            holobotName={item.holobotName || ""}
                            tier={item.tier || 1}
                            price={item.price}
                            forSale={true}
                            onClick={() => handleBuy(item.id, `${item.holobotName} Blueprint`, item.price)}
                          />
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Items section */}
                {filteredItems.some(item => item.type === 'item') && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Boxes className="mr-2 h-5 w-5 text-holobots-accent" />
                      Items
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredItems
                        .filter(item => item.type === 'item')
                        .map(item => (
                          <MarketplaceItemCard 
                            key={item.id}
                            name={item.name || ""}
                            description={item.description || ""}
                            rarity={item.rarity || "common"}
                            price={item.price}
                            seller={item.seller}
                            quantity={item.quantity}
                            type={item.itemType}
                            onBuy={() => handleBuy(item.id, item.name, item.price, item.itemType)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground max-w-md">
                  You need to be logged in to view your inventory and sell items.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-card/90 backdrop-blur-sm p-4 rounded-lg border border-holobots-border">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">My Inventory</h2>
                    <Button onClick={handleSell} className="bg-holobots-accent hover:bg-holobots-accent/80 text-black">
                      <Plus className="mr-1 h-4 w-4" />
                      Sell Item
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground">
                    Select items from your inventory to list them on the marketplace.
                  </p>
                </div>
                
                {/* User's items display */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Holobots</h3>
                    {user.holobots && user.holobots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {user.holobots.map((holobot, index) => {
                          const holobotKey = holobot.name.toLowerCase();
                          const holobotStats = HOLOBOT_STATS[holobotKey];
                          
                          if (!holobotStats) return null;
                          
                          return (
                            <MarketplaceHolobotCard
                              key={index}
                              holobotKey={holobotKey}
                              holobotStats={{
                                ...holobotStats,
                                level: holobot.level
                              }}
                              forSale={false}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No holobots available for sale</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Blueprints</h3>
                    {user.blueprints && Object.entries(user.blueprints).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Object.entries(user.blueprints).map(([holobotKey, quantity]) => (
                          <BlueprintCard 
                            key={holobotKey}
                            holobotName={holobotKey.toUpperCase()}
                            tier={1}
                            quantity={quantity}
                            forSale={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No blueprints in your inventory</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Items</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Arena Passes */}
                      {(user.arena_passes || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="Arena Pass"
                          description="Grants entry to one arena battle without costing HOLOS tokens"
                          rarity="rare"
                          price={100}
                          seller="You"
                          quantity={user.arena_passes || 0}
                          type="arena-pass"
                          onBuy={handleSell}
                        />
                      )}
                      
                      {/* Gacha Tickets */}
                      {(user.gachaTickets || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="Gacha Ticket"
                          description="Can be used for one pull in the Gacha system"
                          rarity="rare"
                          price={150}
                          seller="You"
                          quantity={user.gachaTickets || 0}
                          type="gacha-ticket"
                          onBuy={handleSell}
                        />
                      )}
                      
                      {/* Energy Refills */}
                      {(user.energy_refills || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="Daily Energy Refill"
                          description="Restores your daily energy to full"
                          rarity="common"
                          price={200}
                          seller="You"
                          quantity={user.energy_refills || 0}
                          type="energy-refill"
                          onBuy={handleSell}
                        />
                      )}
                      
                      {/* EXP Boosters */}
                      {(user.exp_boosters || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="EXP Battle Booster"
                          description="Doubles experience gained from battles for 24 hours"
                          rarity="rare"
                          price={750}
                          seller="You"
                          quantity={user.exp_boosters || 0}
                          type="exp-booster"
                          onBuy={handleSell}
                        />
                      )}
                      
                      {/* Rank Skips */}
                      {(user.rank_skips || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="Rank Skip"
                          description="Skip to the next rank instantly"
                          rarity="extremely-rare"
                          price={5000}
                          seller="You"
                          quantity={user.rank_skips || 0}
                          type="rank-skip"
                          onBuy={handleUseRankSkip}
                        />
                      )}
                      
                      {/* Boss Quest Passes */}
                      {(user.boss_quest_passes || 0) > 0 && (
                        <MarketplaceItemCard 
                          name="Boss Quest Pass"
                          description="Challenge bosses without spending energy"
                          rarity="rare"
                          price={300}
                          seller="You"
                          quantity={user.boss_quest_passes || 0}
                          type="boss-quest-pass"
                          onBuy={handleSell}
                        />
                      )}
                      
                      {/* Show message if no items */}
                      {(user.arena_passes || 0) === 0 && 
                       (user.gachaTickets || 0) === 0 && 
                       (user.energy_refills || 0) === 0 && 
                       (user.exp_boosters || 0) === 0 && 
                       (user.rank_skips || 0) === 0 && 
                       (user.boss_quest_passes || 0) === 0 && (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">
                            You don't have any items in your inventory.
                            Purchase items from the marketplace!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
