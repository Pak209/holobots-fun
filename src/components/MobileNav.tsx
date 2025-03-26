
import { Home, Award, Sword, Coins, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const MobileNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: "Home", path: "/dashboard" },
    { icon: <Sword className="h-6 w-6" />, label: "Quests", path: "/quests" },
    { icon: <Coins className="h-6 w-6" />, label: "Farm", path: "/holos-farm" },
    { icon: <Award className="h-6 w-6" />, label: "Arena", path: "/training" },
    { icon: <User className="h-6 w-6" />, label: "Profile", path: "/user-items" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-holobots-card/90 backdrop-blur-md border-t border-holobots-border/20 z-50 max-w-lg mx-auto">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center ${
              path === item.path ? "text-holobots-accent" : "text-gray-400"
            } w-20`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
