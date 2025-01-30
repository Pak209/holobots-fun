import { useState } from "react";
import { Web3ModalLogin } from "./auth/Web3ModalLogin";
import { SolanaWalletLogin } from "./auth/SolanaWalletLogin";

export const Web3Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4">
      <Web3ModalLogin isLoading={isLoading} />
      <SolanaWalletLogin isLoading={isLoading} />
    </div>
  );
};