
import { Web3ModalLogin } from "./auth/Web3ModalLogin";
import { SolanaWalletLogin } from "./auth/SolanaWalletLogin";
import { Separator } from "@/components/ui/separator";

export const Web3Login = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="space-y-4">
      <Web3ModalLogin isLoading={isLoading} />
      
      <div className="flex items-center">
        <Separator className="flex-1 bg-gray-600" />
        <span className="px-2 text-sm text-gray-600">or</span>
        <Separator className="flex-1 bg-gray-600" />
      </div>
      
      <SolanaWalletLogin isLoading={isLoading} />
    </div>
  );
};
