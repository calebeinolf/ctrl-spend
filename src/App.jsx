import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppDataProvider } from "./contexts/AppDataContext";
import LoadingScreen from "./components/LoadingScreen";
import BottomNavBar from "./components/BottomNavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddTransaction from "./pages/AddTransaction";
import CurrentBudget from "./pages/CurrentBudget";
import BudgetHistory from "./pages/BudgetHistory";
import MonthBudgetHistory from "./pages/MonthBudgetHistory";
import TransactionDetails from "./pages/TransactionDetails";
import Settings from "./pages/Settings";
import TransactionTypes from "./pages/TransactionTypes";
import DeletedTransactions from "./pages/DeletedTransactions";
import AllTransactions from "./pages/AllTransactions";

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

  return user ? <Navigate to="/" replace /> : children;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <ProtectedRoute>
              <AddTransaction />
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

      {/* Show bottom nav only when user is authenticated and not on add-transaction page */}
      {user && location.pathname !== "/add-transaction" && <BottomNavBar />}
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
