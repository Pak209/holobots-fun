
import { ReactNode } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { MobileNav } from "@/components/MobileNav";

export const MobileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto relative overflow-hidden bg-holobots-background dark:bg-holobots-dark-background">
      <div className="flex justify-center items-center p-2 h-[50px] bg-gradient-to-r from-holobots-dark-background to-holobots-background border-b border-holobots-border/20">
        <div className="flex-grow"></div>
        <div className="text-center">
          <img src="/holobots-logo.svg" alt="Holobots" className="h-8" />
        </div>
        <div className="flex-grow flex justify-end">
          <NavigationMenu />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto relative">
        {children}
      </div>
      
      <MobileNav />
    </div>
  );
};
