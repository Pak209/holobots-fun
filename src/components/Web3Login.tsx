import { useState } from "react";
import { Web3ModalLogin } from "./auth/Web3ModalLogin";
import { SolanaWalletLogin } from "./auth/SolanaWalletLogin";

interface Web3LoginProps {
  isLoading?: boolean;
}

export const Web3Login = ({ isLoading = false }: Web3LoginProps) => {
  return (
    <div className="space-y-4">
      <Web3ModalLogin isLoading={isLoading} />
      <SolanaWalletLogin isLoading={isLoading} />
    </div>
  );
};