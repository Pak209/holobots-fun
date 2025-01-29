import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useToast } from "@/components/ui/use-toast";
import { Wallet } from "lucide-react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

const injected = new InjectedConnector({
  supportedChainIds: [8453], // Base network
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login, signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Web3 hooks
  const { activate: activateEVM } = useWeb3React();
  const { connect: connectSolana, wallet: solanaWallet } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
      
      toast({
        title: isLogin ? "Welcome back!" : "Account created successfully!",
        description: "You are now logged in.",
      });
      
      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description: error || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const connectEVMWallet = async () => {
    try {
      await activateEVM(injected);
      toast({
        title: "Wallet Connected",
        description: "EVM wallet connected successfully!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect EVM wallet",
        variant: "destructive",
      });
    }
  };

  const connectSolanaWallet = async () => {
    try {
      if (!solanaWallet) {
        await connectSolana();
      }
      toast({
        title: "Wallet Connected",
        description: "Solana wallet connected successfully!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Solana wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <NavigationMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h1 className="text-2xl font-bold mb-6 text-holobots-text dark:text-holobots-dark-text">
              {isLogin ? "Login" : "Create Account"}
            </h1>
            
            <div className="space-y-4 mb-6">
              <Button 
                onClick={connectEVMWallet}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Wallet className="w-5 h-5" />
                Connect Base EVM Wallet
              </Button>
              
              <Button 
                onClick={connectSolanaWallet}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Wallet className="w-5 h-5" />
                Connect Solana Wallet
              </Button>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-holobots-border dark:border-holobots-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-holobots-card dark:bg-holobots-dark-card px-2 text-holobots-text dark:text-holobots-dark-text">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              )}
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-holobots-accent dark:text-holobots-dark-accent hover:underline"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}