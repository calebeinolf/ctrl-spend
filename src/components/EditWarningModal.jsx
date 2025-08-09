import { useState, useEffect } from "react";
import { useAppData } from "../contexts/AppDataContext";
import { validateWarningSettings } from "../utils/budgetWarnings";

const EditWarningModal = ({ isOpen, onClose }) => {
  const { settings, updateWarningSettings } = useAppData();
  const [warningType, setWarningType] = useState(
    settings.warning.yellowType || "percentage"
  );
  const [yellowWarningValue, setYellowWarningValue] = useState(
    (isNaN(Number(settings.warning.yellowValue))
      ? 40
      : settings.warning.yellowValue
    ).toString()
  );
  const [redWarningValue, setRedWarningValue] = useState(
    (isNaN(Number(settings.warning.redValue))
      ? 20
      : settings.warning.redValue
    ).toString()
  );
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWarningType(settings.warning.yellowType || "percentage");
      setYellowWarningValue(
        (isNaN(Number(settings.warning.yellowValue))
          ? 40
          : settings.warning.yellowValue
        ).toString()
      );
      setRedWarningValue(
        (isNaN(Number(settings.warning.redValue))
          ? 20
          : settings.warning.redValue
        ).toString()
      );
    }
  }, [isOpen, settings.warning]);

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
      onClose();
    } catch (error) {
      console.error("Error updating warning:", error);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setWarningType(settings.warning.yellowType || "percentage");
    setYellowWarningValue((settings.warning.yellowValue || 40).toString());
    setRedWarningValue((settings.warning.redValue || 20).toString());
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
          </div>

          {/* Yellow Warning Section */}
          <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h4 className="font-medium text-yellow-900">Yellow Warning</h4>
            </div>

            <div>
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
                  placeholder={warningType === "percentage" ? "40" : "200.00"}
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
                  placeholder={warningType === "percentage" ? "20" : "100.00"}
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
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-full font-medium"
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
            className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-full font-medium disabled:bg-gray-300"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWarningModal;
