/**
 * Card component for displaying seasonal rental Holobots
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Star, 
  AlertTriangle, 
  Trophy,
  Zap,
  Calendar
} from 'lucide-react';
import { ConversionPricingModal } from './ConversionPricingModal';
import { type SeasonalRental } from '@/integrations/holos';
import { isRentalExpiring, isRentalExpired } from '@/integrations/holos/pricing';

interface SeasonalRentalCardProps {
  rental: SeasonalRental;
  stockpileStakeAmount?: number;
}

export const SeasonalRentalCard = ({ 
  rental, 
  stockpileStakeAmount = 0 
}: SeasonalRentalCardProps) => {
  const [showConversionModal, setShowConversionModal] = useState(false);

  const expired = isRentalExpired(rental.expiresAt);
  const expiring = isRentalExpiring(rental.expiresAt);
  
  // Calculate time remaining
  const timeRemaining = new Date(rental.expiresAt).getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));

  const getTierColor = () => {
    switch (rental.tier) {
      case 'COMMON': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CHAMPION': return 'bg-green-100 text-green-800 border-green-200';
      case 'RARE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ELITE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LEGENDARY': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusBadge = () => {
    if (expired) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    
    if (expiring) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
        <Zap className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const getTimeDisplay = () => {
    if (expired) return "Expired";
    if (daysRemaining > 0) return `${daysRemaining} days left`;
    return `${hoursRemaining} hours left`;
  };

  const getProgressPercentage = () => {
    const totalDuration = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    const elapsed = Date.now() - new Date(rental.createdAt).getTime();
    return Math.min(100, (elapsed / totalDuration) * 100);
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-lg ${
        expired ? 'border-red-200 bg-red-50/30' : 
        expiring ? 'border-orange-200 bg-orange-50/30' : 
        'border-border'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {rental.name}
                <Badge className={getTierColor()}>
                  {rental.tier}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Level {rental.level} • {rental.experience} XP
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Time Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Rental Period
              </span>
              <span className={
                expired ? 'text-red-600 font-medium' :
                expiring ? 'text-orange-600 font-medium' :
                'text-muted-foreground'
              }>
                {getTimeDisplay()}
              </span>
            </div>
            <Progress 
              value={getProgressPercentage()} 
              className={`h-2 ${
                expired ? 'bg-red-100' :
                expiring ? 'bg-orange-100' :
                'bg-muted'
              }`}
            />
          </div>

          {/* Conversion Pricing Preview */}
          {rental.canConvert && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Convert to NFT</p>
                  <p className="text-xs text-muted-foreground">
                    From ${rental.conversionPricing.finalPriceUSD.toFixed(2)}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowConversionModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {expired ? (
              <div className="flex-1 text-center py-2 text-sm text-red-600">
                This rental has expired and cannot be used
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {expiring && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowConversionModal(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Convert Now
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ConversionPricingModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        rental={{
          id: rental.id,
          holobotKey: rental.holobotKey,
          name: rental.name,
          tier: rental.tier,
          expiresAt: rental.expiresAt
        }}
        stockpileStakeAmount={stockpileStakeAmount}
      />
    </>
  );
};
