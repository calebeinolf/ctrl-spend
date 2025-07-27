import { useState } from "react";

const CustomTransactionModal = ({
  isOpen,
  onClose,
  onSave,
  existingTypes = [],
  saving = false,
}) => {
  const [customLabel, setCustomLabel] = useState("");

  const handleSave = () => {
    if (!customLabel.trim()) return;
    onSave(customLabel.trim());
    setCustomLabel("");
  };

  const handleClose = () => {
    setCustomLabel("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Custom Label
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's this transaction for?
          </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            placeholder="Enter description"
            autoFocus
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !customLabel.trim()}
            className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-xl font-medium disabled:bg-gray-300 hover:bg-lime-700 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTransactionModal;
