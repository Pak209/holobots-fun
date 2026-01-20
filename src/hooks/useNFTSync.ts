import { useHolobotContracts } from './useHolobotContracts';
import { useAuth } from '@/contexts/auth';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import HolobotABI from '@/abis/HolobotNFT.json';
import { HOLOBOT_STATS } from '@/types/holobot';
import { useToast } from './use-toast';

/**
 * Hook to sync NFTs from blockchain to local game database
 */
export function useNFTSync() {
  const { address, publicClient } = useHolobotContracts();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const syncNFTsFromBlockchain = async () => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected');
    }

    console.log('🔄 Syncing NFTs from blockchain for wallet:', address);
    console.log('📍 Contract:', CONTRACT_ADDRESSES.holobotNFT);

    try {
      // Get balance of NFTs owned by this address
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.holobotNFT as `0x${string}`,
        abi: HolobotABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      console.log('💎 NFT Balance:', balance.toString());

      if (balance === 0n) {
        toast({
          title: 'No NFTs Found',
          description: 'This wallet doesn\'t own any Holobot NFTs yet.',
          variant: 'destructive',
        });
        return [];
      }

      // Get all token IDs owned by this address
      const tokenIds: number[] = [];
      
      // Try tokenOfOwnerByIndex (ERC721Enumerable)
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.holobotNFT as `0x${string}`,
            abi: HolobotABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(i)],
          }) as bigint;
          
          tokenIds.push(Number(tokenId));
        } catch (error) {
          console.warn(`Could not get token at index ${i}:`, error);
        }
      }

      console.log('🎯 Found Token IDs:', tokenIds);

      // Map token IDs to Holobots
      const syncedHolobots = tokenIds.map((tokenId, index) => {
        // For now, assign based on index (ace, shadow, kuma)
        const starterKeys = ['ace', 'shadow', 'kuma'];
        const holobotKey = starterKeys[index % starterKeys.length];
        const stats = HOLOBOT_STATS[holobotKey];

        return {
          name: stats.name,
          level: 1,
          experience: 0,
          nextLevelExp: 100,
          boostedAttributes: {},
          tokenId: tokenId,
          contractAddress: CONTRACT_ADDRESSES.holobotNFT,
          mintTxHash: 'synced-from-blockchain', // Placeholder since we don't have the original hash
        };
      });

      // Merge with existing holobots (avoid duplicates by tokenId)
      const existingHolobots = user?.holobots || [];
      const existingTokenIds = new Set(
        existingHolobots.map(h => h.tokenId).filter(Boolean)
      );

      const newHolobots = syncedHolobots.filter(
        h => !existingTokenIds.has(h.tokenId)
      );

      if (newHolobots.length === 0) {
        toast({
          title: 'Already Synced',
          description: 'All your NFTs are already in the game!',
        });
        return syncedHolobots;
      }

      // Update user with new holobots
      const updatedHolobots = [...existingHolobots, ...newHolobots];
      
      await updateUser({
        holobots: updatedHolobots,
      });

      console.log('✅ Synced', newHolobots.length, 'new Holobots to game database');

      toast({
        title: '✅ NFTs Synced!',
        description: `Added ${newHolobots.length} Holobot(s) to your collection!`,
      });

      return syncedHolobots;
    } catch (error: any) {
      console.error('❌ Error syncing NFTs:', error);
      
      toast({
        title: 'Sync Failed',
        description: error.message || 'Could not sync NFTs from blockchain',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  return { syncNFTsFromBlockchain };
}
