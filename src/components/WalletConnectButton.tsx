import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useHolobotContracts, useNetworkCheck } from '@/hooks/useHolobotContracts';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { isCorrectNetwork, chainName } = useNetworkCheck();
  
  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton />
      
      {isConnected && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          {!isCorrectNetwork && (
            <p className="text-sm text-red-500">
              Wrong network: {chainName}. Please switch to Base Sepolia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Example component showing how to use contracts
export function HolobotInteractionExample() {
  const { contracts, isConnected, address } = useHolobotContracts();
  
  const handleMintHolobot = async () => {
    if (!contracts.holobot || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      // Example mint - you'd want to get tokenId from your app logic
      const tokenId = Math.floor(Math.random() * 10000);
      const tx = await contracts.holobot.mint(address, tokenId);
      await tx.wait();
      alert('Holobot minted successfully!');
    } catch (error) {
      console.error('Error minting Holobot:', error);
      alert('Failed to mint Holobot');
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Holobot Interactions</h3>
      <button 
        onClick={handleMintHolobot}
        disabled={!isConnected}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Mint Holobot
      </button>
    </div>
  );
} 