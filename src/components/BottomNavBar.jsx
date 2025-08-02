import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, History, CirclePlus, PiggyBank, Settings } from "lucide-react";

const BottomNavBar = () => {
  const location = useLocation();
  const navRef = useRef(null);

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "History" },
    { path: "/", icon: CirclePlus, label: "Add" },
    { path: "/current-budget", icon: PiggyBank, label: "Budget" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Set CSS custom property for nav height
  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--bottom-nav-height",
        `${height}px`
      );
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-[#F4F7EE] px-2 z-20 safe-area-pb"
    >
      <div className="flex justify-between items-center gap-4 mb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full flex-col items-center pt-2 transition-all duration-200 ${
                isActive ? "text-black " : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div
                className={`flex items-center justify-center w-full max-w-16 py-[0.25rem] rounded-full mb-1 ${
                  isActive ? " bg-lime-200" : ""
                }`}
              >
                <Icon size={22} />
              </div>

              <span className={`text-xs font-semibold `}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
