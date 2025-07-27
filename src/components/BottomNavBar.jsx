import { useLocation, Link } from "react-router-dom";
import { Home, History, CirclePlus, PiggyBank, Settings } from "lucide-react";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "History" },
    { path: "/add-transaction", icon: CirclePlus, label: "Add" },
    { path: "/current-budget", icon: PiggyBank, label: "Budget" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2  z-20 safe-area-pb">
      <div className="flex justify-between items-center gap-4 mb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full flex-col items-center py-2 transition-all duration-200 ${
                isActive ? "text-black " : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div
                className={`flex items-center justify-center w-full py-[0.375rem] rounded-full mb-1 ${
                  isActive ? " bg-lime-200" : ""
                }`}
              >
                <Icon />
              </div>

              <span className={`text-xs font-medium `}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
