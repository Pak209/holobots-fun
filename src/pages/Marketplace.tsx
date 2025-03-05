
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MarketplaceFilters, FilterOptions } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceHolobotCard } from "@/components/marketplace/MarketplaceHolobotCard";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  PackagePlus, 
  Gem, 
  Boxes, 
  ShoppingBag, 
  Plus, 
  Info, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    itemType: "energy-refill" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
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
    itemType: "exp-booster" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Exp Battle Booster",
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
    itemType: "rank-skip" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
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
    itemType: "arena-pass" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Arena Pass",
    description: "Grants entry to one arena battle without costing HOLOS tokens",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,  // Changed from 1000 to 50
    seller: "BattleMaster",
    quantity: 2,
    createdAt: new Date('2023-07-12')
  },
  {
    id: "i5",
    type: "item",
    itemType: "gacha-ticket" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Gacha Ticket",
    description: "Can be used for one pull in the Gacha system",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,  // Changed from 850 to 50
    seller: "GachaDealer",
    quantity: 3,
    createdAt: new Date('2023-07-16')
  }
];

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    searchQuery: "",
    sortBy: "newest"
  });
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS);
  
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
  
  const handleBuy = (itemId: string, itemName: string, price: number) => {
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
    
    // In a real app, we would call an API to process the purchase
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
                            onBuy={() => handleBuy(item.id, item.name, item.price)}
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
                
                {/* Mock inventory items - would be populated from user data in real app */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Holobots</h3>
                    <p className="text-muted-foreground">No holobots available for sale</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Blueprints</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {/* Mock blueprint data - would be dynamically populated in real app */}
                      <BlueprintCard 
                        holobotName="ACE"
                        tier={1}
                        quantity={2}
                        forSale={false}
                      />
                      <BlueprintCard 
                        holobotName="KUMA"
                        tier={2}
                        quantity={1}
                        forSale={false}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Items</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Mock item data - would be dynamically populated in real app */}
                      <MarketplaceItemCard 
                        name="Daily Energy Refill"
                        description="Restores your daily energy to full"
                        rarity="common"
                        price={200}
                        seller="You"
                        quantity={5}
                        onBuy={handleSell}
                      />
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
