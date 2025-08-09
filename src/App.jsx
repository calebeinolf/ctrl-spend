import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppDataProvider } from "./contexts/AppDataContext";
import LoadingScreen from "./components/LoadingScreen";
import BottomNavBar from "./components/BottomNavBar";
import { preloadCriticalRoutes } from "./utils/routePreloader";

// Import only the most critical components that might be the landing page
import Home from "./pages/Home";
import AddTransaction from "./pages/AddTransaction";

// Lazy load ALL other components (will be progressively loaded after initial render)
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const CurrentBudget = lazy(() => import("./pages/CurrentBudget"));
const BudgetHistory = lazy(() => import("./pages/BudgetHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const AllTransactions = lazy(() => import("./pages/AllTransactions"));
const MonthBudgetHistory = lazy(() => import("./pages/MonthBudgetHistory"));
const TransactionDetails = lazy(() => import("./pages/TransactionDetails"));
const TransactionTypes = lazy(() => import("./pages/TransactionTypes"));
const DeletedTransactions = lazy(() => import("./pages/DeletedTransactions"));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/home" replace /> : children;
};

// Lightweight fallback for lazy components - invisible to avoid flash
const LazyFallback = () => <div className="min-h-screen"></div>;

const AppContent = () => {
  const { user, loading } = useAuth();

  // Preload critical routes after authentication
  useEffect(() => {
    if (user) {
      // Start preloading immediately without delay
      preloadCriticalRoutes();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Loading Screen with fade out transition */}
      <div
        className={`absolute inset-0 z-50 transition-opacity duration-200 ease-out ${
          loading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <LoadingScreen />
      </div>

      {/* Main App Content */}
      <div
        className={`transition-opacity duration-500 ease-out ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AddTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/current-budget"
              element={
                <ProtectedRoute>
                  <CurrentBudget />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <BudgetHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/:year/:month"
              element={
                <ProtectedRoute>
                  <MonthBudgetHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-transactions"
              element={
                <ProtectedRoute>
                  <AllTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/transaction-types"
              element={
                <ProtectedRoute>
                  <TransactionTypes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/deleted-transactions"
              element={
                <ProtectedRoute>
                  <DeletedTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Show bottom nav when user is authenticated */}
        {user && <BottomNavBar />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <Router>
          <AppContent />
        </Router>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
