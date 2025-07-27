// Preload critical routes for better user experience
export const preloadRoute = (routeName) => {
  switch (routeName) {
    case "home":
      return import("../pages/Home");
    case "add-transaction":
      return import("../pages/AddTransaction");
    case "current-budget":
      return import("../pages/CurrentBudget");
    case "settings":
      return import("../pages/Settings");
    default:
      return null;
  }
};

// Preload critical routes after initial load
export const preloadCriticalRoutes = () => {
  // Preload most commonly used routes
  setTimeout(() => {
    preloadRoute("add-transaction");
    preloadRoute("current-budget");
  }, 1000);
};
