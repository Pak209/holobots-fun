import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHolobotContracts } from '@/hooks/useHolobotContracts';
import { useHolobotMint, useHolobotBalance } from '@/hooks/useHolobotNFT';
import { useStockpileDeposit, useStockpileWithdraw, useStockpileBalance, useStockpileRewards } from '@/hooks/useStockpile';
import { useBoosterStaking, useStakedBoosterPacks, useBoosterStakeRewards } from '@/hooks/useBoosterStaker';
import { ethers } from 'ethers';
import { Coins, Shield, Gift, Zap } from 'lucide-react';

export function SmartContractExamples() {
  const { address, isConnected } = useHolobotContracts();
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <HolobotNFTExample />
      <StockpileExample />
      <BoosterStakingExample />
      <ContractReadExample />
    </div>
  );
}

// Example 1: NFT Minting
function HolobotNFTExample() {
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { mint } = useHolobotMint();
  const { getBalance } = useHolobotBalance();
  const { toast } = useToast();

  const handleMint = async () => {
    if (!tokenId) {
      toast({
        title: "Token ID Required",
        description: "Please enter a token ID to mint",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const tx = await mint(Number(tokenId));
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      const receipt = await tx.wait();
      
      toast({
        title: "✅ Holobot Minted!",
        description: `Token #${tokenId} minted successfully. Tx: ${receipt.hash.slice(0, 10)}...`,
      });
      
      setTokenId('');
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "User cancelled the transaction",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Mint Failed",
          description: error.message || "Failed to mint Holobot",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Holobot NFT Minting
        </CardTitle>
        <CardDescription>
          Mint a new Holobot NFT with a custom token ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="Enter Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <Button 
          onClick={handleMint}
          disabled={isLoading || !tokenId}
          className="w-full"
        >
          {isLoading ? "Minting..." : "Mint Holobot NFT"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Example 2: Stockpile Operations
function StockpileExample() {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const { deposit } = useStockpileDeposit();
  const { withdraw } = useStockpileWithdraw();
  const { getBalance } = useStockpileBalance();
  const { getRewards, claimRewards } = useStockpileRewards();
  const { toast } = useToast();

  const handleDeposit = async () => {
    if (!amount) return;
    
    setIsDepositing(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await deposit(amountWei);
      
      toast({
        title: "Depositing...",
        description: "Transaction submitted, waiting for confirmation",
      });

      await tx.wait();
      
      toast({
        title: "✅ Deposit Successful",
        description: `Deposited ${amount} tokens to stockpile`,
      });
      
      setAmount('');
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to deposit tokens",
        variant: "destructive"
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    
    setIsWithdrawing(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await withdraw(amountWei);
      await tx.wait();
      
      toast({
        title: "✅ Withdrawal Successful",
        description: `Withdrew ${amount} tokens from stockpile`,
      });
      
      setAmount('');
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw tokens",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsClaiming(true);
    try {
      const tx = await claimRewards();
      await tx.wait();
      
      toast({
        title: "✅ Rewards Claimed",
        description: "Successfully claimed your staking rewards",
      });
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive"
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Stockpile Operations
        </CardTitle>
        <CardDescription>
          Deposit, withdraw, and claim rewards from the stockpile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleDeposit}
            disabled={isDepositing || !amount}
            variant="outline"
          >
            {isDepositing ? "Depositing..." : "Deposit"}
          </Button>
          <Button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || !amount}
            variant="outline"
          >
            {isWithdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </div>
        <Button 
          onClick={handleClaimRewards}
          disabled={isClaiming}
          className="w-full"
        >
          {isClaiming ? "Claiming..." : "Claim Rewards"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Example 3: Booster Pack Staking
function BoosterStakingExample() {
  const [tokenId, setTokenId] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  
  const { stake, unstake } = useBoosterStaking();
  const { getStakedTokens } = useStakedBoosterPacks();
  const { getRewards, claimRewards } = useBoosterStakeRewards();
  const { toast } = useToast();

  const handleStake = async () => {
    if (!tokenId) return;
    
    setIsStaking(true);
    try {
      const tx = await stake(Number(tokenId));
      await tx.wait();
      
      toast({
        title: "✅ Booster Pack Staked",
        description: `Token #${tokenId} is now earning rewards`,
      });
      
      setTokenId('');
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake booster pack",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!tokenId) return;
    
    setIsUnstaking(true);
    try {
      const tx = await unstake(Number(tokenId));
      await tx.wait();
      
      toast({
        title: "✅ Booster Pack Unstaked",
        description: `Token #${tokenId} has been unstaked`,
      });
      
      setTokenId('');
    } catch (error: any) {
      toast({
        title: "Unstaking Failed",
        description: error.message || "Failed to unstake booster pack",
        variant: "destructive"
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Booster Pack Staking
        </CardTitle>
        <CardDescription>
          Stake booster packs to earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="Booster Pack Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleStake}
            disabled={isStaking || !tokenId}
            variant="outline"
          >
            {isStaking ? "Staking..." : "Stake"}
          </Button>
          <Button 
            onClick={handleUnstake}
            disabled={isUnstaking || !tokenId}
            variant="outline"
          >
            {isUnstaking ? "Unstaking..." : "Unstake"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 4: Read-only Contract Calls
function ContractReadExample() {
  const [balance, setBalance] = useState<string>('');
  const [rewards, setRewards] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { getBalance } = useHolobotBalance();
  const { getBalance: getStockpileBalance } = useStockpileBalance();
  const { getRewards } = useStockpileRewards();
  const { address } = useHolobotContracts();

  const fetchData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [nftBalance, stockpileBalance, pendingRewards] = await Promise.all([
        getBalance(),
        getStockpileBalance(),
        getRewards()
      ]);
      
      setBalance(`NFTs: ${nftBalance}, Stockpile: ${ethers.formatEther(stockpileBalance)} ETH`);
      setRewards(`${ethers.formatEther(pendingRewards)} ETH`);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Contract Data
        </CardTitle>
        <CardDescription>
          Read current balances and rewards (no gas required)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={fetchData}
          disabled={isLoading || !address}
          className="w-full"
        >
          {isLoading ? "Loading..." : "Refresh Data"}
        </Button>
        {balance && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <p><strong>Balances:</strong> {balance}</p>
          </div>
        )}
        {rewards && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded text-sm">
            <p><strong>Pending Rewards:</strong> {rewards}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 