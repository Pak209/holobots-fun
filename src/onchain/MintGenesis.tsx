import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { addresses } from './addresses';
import { Holobots721A as HolobotsAbi } from './abi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function MintGenesis() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Use Base Sepolia by default for testing
  const contract = addresses.baseSepolia?.Holobots721A || addresses.base.Holobots721A;

  const handleMint = () => {
    const targetAddress = recipient || address;
    if (!targetAddress) return;

    writeContract({
      address: contract as `0x${string}`,
      abi: HolobotsAbi.abi,
      functionName: 'mint',
      args: [targetAddress, BigInt(quantity)],
    });
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Mint Genesis Holobot</CardTitle>
          <CardDescription>Connect your wallet to mint Genesis Holobots</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your wallet to continue</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mint Genesis Holobot</CardTitle>
        <CardDescription>Admin minting for Genesis collection (Base Sepolia)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address (optional)</Label>
          <Input
            id="recipient"
            placeholder={address}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to mint to your own address
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <Button
          onClick={handleMint}
          disabled={!address || isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPending ? 'Minting...' : 'Confirming...'}
            </>
          ) : (
            'Mint Genesis'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {hash && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction submitted: 
              <a 
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline"
              >
                View on Basescan
              </a>
            </AlertDescription>
          </Alert>
        )}

        {isConfirmed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully minted {quantity} Genesis Holobot{parseInt(quantity) > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Contract: {contract}</p>
          <p>Network: Base Sepolia</p>
        </div>
      </CardContent>
    </Card>
  );
}
