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
import { formatCurrency } from "../utils/formatCurrency";
import {
  validateWarningSettings,
  getWarningDescriptions,
} from "../utils/budgetWarnings";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateBudgetSettings, updateWarningSettings } =
    useAppData();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(
    settings.budget.amount.toString()
  );
  const [frequency, setFrequency] = useState(settings.budget.frequency);
  const [warningType, setWarningType] = useState(
    settings.warning.yellowType || "percentage"
  );
  const [yellowWarningValue, setYellowWarningValue] = useState(
    (settings.warning.yellowValue || 40).toString()
  );
  const [redWarningValue, setRedWarningValue] = useState(
    (settings.warning.redValue || 20).toString()
  );
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      await updateBudgetSettings({
        amount: parseFloat(budgetAmount),
        frequency: frequency,
      });
      setShowBudgetModal(false);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
    setSaving(false);
  };

  const handleSaveWarning = async () => {
    // Validate warning settings
    const yellowSettings = {
      type: warningType,
      value: parseFloat(yellowWarningValue),
    };
    const redSettings = {
      type: warningType,
      value: parseFloat(redWarningValue),
    };

    const validation = validateWarningSettings(
      yellowSettings,
      redSettings,
      settings.budget.amount
    );
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setSaving(true);
    try {
      await updateWarningSettings({
        yellowType: warningType,
        yellowValue: parseFloat(yellowWarningValue),
        redType: warningType,
        redValue: parseFloat(redWarningValue),
      });
      setShowWarningModal(false);
    } catch (error) {
      console.error("Error updating warning:", error);
    }
    setSaving(false);
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
                    Edit Budget Warning
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
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setBudgetAmount(settings.budget.amount.toString());
                  setFrequency(settings.budget.frequency);
                  setShowBudgetModal(false);
                }}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={
                  saving || !budgetAmount || parseFloat(budgetAmount) <= 0
                }
                className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Budget Warnings
            </h3>

            <div className="space-y-6">
              {/* Warning Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Type
                </label>
                <select
                  value={warningType}
                  onChange={(e) => setWarningType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="percentage">Percentage of Budget Left</option>
                  <option value="amount">Dollar Amount Left</option>
                </select>
                {/* <p className="text-xs text-gray-500 mt-1">
                  Choose whether warnings are based on percentage or dollar
                  amounts
                </p> */}
              </div>

              {/* Yellow Warning Section */}
              <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium text-yellow-900">
                    Yellow Warning
                  </h4>
                </div>

                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                    Threshold
                  </label> */}
                  <div className="relative">
                    {warningType === "amount" && (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        $
                      </span>
                    )}
                    <input
                      type="number"
                      value={yellowWarningValue}
                      onChange={(e) => setYellowWarningValue(e.target.value)}
                      className={`w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm ${
                        warningType === "amount" ? "pl-8" : "pl-3"
                      }`}
                      placeholder={
                        warningType === "percentage" ? "40" : "200.00"
                      }
                    />
                    {warningType === "percentage" && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        %
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {warningType === "percentage"
                      ? "Turn yellow when this percentage of budget is left"
                      : "Turn yellow when this dollar amount is left"}
                  </p>
                </div>
              </div>

              {/* Red Warning Section */}
              <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-medium text-red-900">Red Warning</h4>
                </div>

                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                    Threshold
                  </label> */}
                  <div className="relative">
                    {warningType === "amount" && (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        $
                      </span>
                    )}
                    <input
                      type="number"
                      value={redWarningValue}
                      onChange={(e) => setRedWarningValue(e.target.value)}
                      className={`w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                        warningType === "amount" ? "pl-8" : "pl-3"
                      }`}
                      placeholder={
                        warningType === "percentage" ? "20" : "100.00"
                      }
                    />
                    {warningType === "percentage" && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        %
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {warningType === "percentage"
                      ? "Turn red when this percentage of budget is left"
                      : "Turn red when this dollar amount is left"}
                  </p>
                </div>
              </div>

              {/* <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <strong>Note:</strong> The red threshold must be lower than the
                yellow threshold. Colors progress from green → yellow → red as
                you spend your budget.
              </div> */}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setWarningType(settings.warning.yellowType || "percentage");
                  setYellowWarningValue(
                    (settings.warning.yellowValue || 40).toString()
                  );
                  setRedWarningValue(
                    (settings.warning.redValue || 20).toString()
                  );
                  setShowWarningModal(false);
                }}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWarning}
                disabled={
                  saving ||
                  !yellowWarningValue ||
                  parseFloat(yellowWarningValue) <= 0 ||
                  !redWarningValue ||
                  parseFloat(redWarningValue) <= 0
                }
                className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-xl font-medium disabled:bg-gray-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
