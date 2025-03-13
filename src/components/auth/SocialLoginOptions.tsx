
import { Web3ModalLogin } from "@/components/auth/Web3ModalLogin";
import { SolanaWalletLogin } from "@/components/auth/SolanaWalletLogin";

interface SocialLoginOptionsProps {
  loading: boolean;
}

export function SocialLoginOptions({ loading }: SocialLoginOptionsProps) {
  return (
    <>
      <div className="mt-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-300 dark:border-gray-700 w-full"></div>
          <div className="px-2 text-sm text-gray-500 dark:text-gray-400 bg-holobots-background dark:bg-holobots-dark-background">or continue with</div>
          <div className="border-t border-gray-300 dark:border-gray-700 w-full"></div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Web3ModalLogin isLoading={loading} />
        <SolanaWalletLogin isLoading={loading} />
      </div>
    </>
  );
}
