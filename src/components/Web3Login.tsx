import { useState } from "react";
import { EVMWalletLogin } from "./auth/EVMWalletLogin";
import { SolanaWalletLogin } from "./auth/SolanaWalletLogin";

export const Web3Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4">
      <EVMWalletLogin isLoading={isLoading} />
      <SolanaWalletLogin isLoading={isLoading} />
    </div>
  );
};