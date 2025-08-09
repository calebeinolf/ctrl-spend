import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  List,
  LogOut,
  PiggyBank,
  Siren,
  Trash2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAppData } from "../contexts/AppDataContext";
import EditBudgetModal from "../components/EditBudgetModal";
import EditWarningModal from "../components/EditWarningModal";
import { formatCurrency } from "../utils/formatCurrency";
import { getWarningDescriptions } from "../utils/budgetWarnings";

const Settings = () => {
  const navigate = useNavigate();
  const { settings } = useAppData();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getWarningDescription = () => {
    const descriptions = getWarningDescriptions(settings.warning);
    return `${descriptions.yellow} • ${descriptions.red}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <h1 className="pt-[15vh] text-3xl font-medium text-gray-900 text-center">
        Settings
      </h1>

      {/* Main Content */}
      <main className="px-4 py-6 pt-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Edit Things */}
          <div className="rounded-2xl divide-y divide-gray-100 space-y-[3px]">
            <button
              onClick={() => setShowBudgetModal(true)}
              className="px-6 py-5 w-full flex items-center justify-between bg-white hover:bg-gray-50 rounded-b-md rounded-3xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <PiggyBank size={24} strokeWidth={1.7} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Edit Budget</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(settings.budget.amount)}{" "}
                    {settings.budget.frequency}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/settings/transaction-types")}
              className="px-6 py-5 w-full flex items-center justify-between bg-white hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="flex items-center gap-4">
                <List size={24} strokeWidth={1.7} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Edit Transaction Labels
                  </p>
                  <p className="text-sm text-gray-600">
                    Manage your spending categories
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowWarningModal(true)}
              className="px-6 py-5 w-full flex items-center justify-between bg-white hover:bg-gray-50 rounded-t-md rounded-3xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <Siren size={24} strokeWidth={1.7} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Edit Budget Warnings
                  </p>
                  <p className="text-sm text-gray-600">
                    {getWarningDescription()}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Deleted Transactions */}
          <div className="rounded-2xl divide-y divide-gray-100 space-y-1">
            <button
              onClick={() => navigate("/settings/deleted-transactions")}
              className="px-6 py-5 w-full flex items-center justify-between bg-white hover:bg-gray-50 rounded-3xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <Trash2 size={24} strokeWidth={1.7} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Deleted Transactions
                  </p>
                  <p className="text-sm text-gray-600">
                    View and restore deleted transactions
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Account */}
          <div className="rounded-2xl divide-y divide-gray-100 space-y-1">
            <button
              onClick={handleLogout}
              className="px-6 py-7 w-full flex items-center justify-between bg-white hover:bg-gray-50 rounded-3xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <LogOut size={24} className="text-red-500" />
                <p className="font-medium text-red-600">Sign Out</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
      />

      {/* Edit Warning Modal */}
      <EditWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      />
    </div>
  );
};

export default Settings;
