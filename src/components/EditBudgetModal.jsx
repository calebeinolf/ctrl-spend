import { useState, useEffect } from "react";
import { useAppData } from "../contexts/AppDataContext";

const EditBudgetModal = ({ isOpen, onClose }) => {
  const { settings, updateBudgetSettings } = useAppData();
  const [budgetAmount, setBudgetAmount] = useState(
    settings.budget.amount.toString()
  );
  const [frequency, setFrequency] = useState(settings.budget.frequency);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBudgetAmount(settings.budget.amount.toString());
      setFrequency(settings.budget.frequency);
    }
  }, [isOpen, settings.budget.amount, settings.budget.frequency]);

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      await updateBudgetSettings({
        amount: parseFloat(budgetAmount),
        frequency: frequency,
      });
      onClose();
    } catch (error) {
      console.error("Error updating budget:", error);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setBudgetAmount(settings.budget.amount.toString());
    setFrequency(settings.budget.frequency);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    // Close modal only if clicking on the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-4xl p-6 w-full max-w-sm">
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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-full font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBudget}
            disabled={saving || !budgetAmount || parseFloat(budgetAmount) <= 0}
            className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-full font-medium disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBudgetModal;
