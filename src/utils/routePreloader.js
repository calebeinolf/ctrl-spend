// Progressive loading of main app tabs
export const preloadRoute = (routeName) => {
  switch (routeName) {
    // Main navigation tabs
    case "current-budget":
      return import("../pages/CurrentBudget");
    case "budget-history":
      return import("../pages/BudgetHistory");
    case "settings":
      return import("../pages/Settings");
    case "all-transactions":
      return import("../pages/AllTransactions");

    // Secondary pages
    case "transaction-details":
      return import("../pages/TransactionDetails");
    case "month-budget-history":
      return import("../pages/MonthBudgetHistory");
    case "transaction-types":
      return import("../pages/TransactionTypes");
    default:
      return null;
  }
};

// Progressive loading strategy: load main tabs after initial page renders
export const preloadCriticalRoutes = () => {
  // Phase 1: Load main navigation tabs immediately (but after initial render)
  setTimeout(() => {
    // if (import.meta.env.DEV) {
    //   console.log("🚀 Loading main navigation tabs...");
    // }
    Promise.all([
      preloadRoute("current-budget"),
      preloadRoute("budget-history"),
      preloadRoute("settings"),
      preloadRoute("all-transactions"),
    ]).then(() => {
      // if (import.meta.env.DEV) {
      //   console.log("✅ Main navigation tabs loaded and ready!");
      // }
    });
  }, 100); // Very small delay to let initial page render first

  // Phase 2: Load secondary pages after main tabs
  setTimeout(() => {
    preloadRoute("transaction-details");
    preloadRoute("month-budget-history");
    preloadRoute("transaction-types");
  }, 1000); // Load these after main tabs
};
