
import { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export type FilterOptions = {
  type: 'all' | 'holobot' | 'blueprint' | 'item';
  minLevel?: number;
  maxLevel?: number;
  minPrice?: number;
  maxPrice?: number;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'level-asc' | 'level-desc';
};

interface MarketplaceFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export const MarketplaceFilters = ({ filters, onFilterChange }: MarketplaceFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value
    });
  };
  
  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value as FilterOptions['type']
    });
  };
  
  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sortBy: value as FilterOptions['sortBy']
    });
  };
  
  const handlePriceRangeChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1]
    });
  };
  
  const handleLevelRangeChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      minLevel: value[0],
      maxLevel: value[1]
    });
  };
  
  const handleClearFilters = () => {
    onFilterChange({
      type: 'all',
      searchQuery: '',
      sortBy: 'newest',
      minPrice: undefined,
      maxPrice: undefined,
      minLevel: undefined,
      maxLevel: undefined
    });
    setShowAdvancedFilters(false);
  };

  return (
    <div className="w-full space-y-3 bg-card/90 backdrop-blur-sm p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Basic Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[150px]">
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Item Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="holobot">Holobots</SelectItem>
              <SelectItem value="blueprint">Blueprints</SelectItem>
              <SelectItem value="item">Items</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="level-asc">Level: Low to High</SelectItem>
              <SelectItem value="level-desc">Level: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 pt-2 border-t border-holobots-border dark:border-holobots-dark-border">
          <div>
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Price Range (HOLOS)</h4>
              <div className="text-xs">
                <span>{filters.minPrice || 0}</span> - <span>{filters.maxPrice || 10000}</span>
              </div>
            </div>
            <Slider 
              defaultValue={[filters.minPrice || 0, filters.maxPrice || 10000]} 
              max={10000} 
              step={100}
              onValueChange={handlePriceRangeChange}
            />
          </div>
          
          {(filters.type === 'all' || filters.type === 'holobot') && (
            <div>
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-medium">Level Range</h4>
                <div className="text-xs">
                  <span>{filters.minLevel || 1}</span> - <span>{filters.maxLevel || 50}</span>
                </div>
              </div>
              <Slider 
                defaultValue={[filters.minLevel || 1, filters.maxLevel || 50]} 
                max={50} 
                step={1}
                onValueChange={handleLevelRangeChange}
              />
            </div>
          )}
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            
            <div className="flex items-center gap-1 text-xs">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Active Filters:</span>
              {filters.type !== 'all' && (
                <Badge variant="outline" className="text-[10px]">
                  {filters.type}
                </Badge>
              )}
              {filters.searchQuery && (
                <Badge variant="outline" className="text-[10px]">
                  search
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="outline" className="text-[10px]">
                  price
                </Badge>
              )}
              {(filters.minLevel || filters.maxLevel) && (
                <Badge variant="outline" className="text-[10px]">
                  level
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
