import { useState } from "react";
import { Check, Pencil } from "lucide-react";

const TransactionTypeModal = ({
  isOpen,
  onClose,
  onSelect,
  onAddNew,
  transactionTypes = [],
  currentCategoryId = null,
  saving = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(
    transactionTypes.find((type) => type.id === currentCategoryId) || null
  );
  const [customInputActive, setCustomInputActive] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  const handleCategorySelect = (category) => {
    // If this category is already selected, deselect it
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      // Select this category but don't clear custom input text
      setSelectedCategory(category);
      setCustomInputActive(false);
      // Note: We keep customLabel so user can go back to it
    }
  };

  const handleCustomInputClick = () => {
    setCustomInputActive(true);
    setSelectedCategory(null); // Clear any selected category
  };

  const handleCustomInputChange = (e) => {
    setCustomLabel(e.target.value);
  };

  const handleDoneClick = () => {
    if (selectedCategory) {
      // Save with selected category
      onSelect(selectedCategory);
    } else if (customInputActive && customLabel.trim() && !selectedCategory) {
      // Save with custom label only if it's active and no category is selected
      onSelect({ id: null, name: customLabel.trim(), color: null });
    }
  };

  const handleSkipClick = () => {
    onSelect({ id: null, name: "Transaction", color: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-2xl text-center text-gray-600 font-medium">
            What's it for?
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3 pb-4">
            {/* Custom Label */}
            <div
              onClick={handleCustomInputClick}
              className={`w-full flex items-center gap-4 px-6 p-4 border rounded-full cursor-text ${
                customInputActive && !selectedCategory && customLabel.trim()
                  ? "border-lime-500 bg-lime-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Pencil
                size={16}
                className={`flex-shrink-0 ${
                  customInputActive && !selectedCategory && customLabel.trim()
                    ? "text-lime-600"
                    : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={customLabel}
                onChange={handleCustomInputChange}
                onFocus={handleCustomInputClick}
                className="flex-1 bg-transparent !text-lg text-gray-800 placeholder-gray-400 outline-none"
                placeholder="Custom"
                disabled={saving}
              />
            </div>

            {/* Transaction Types */}
            {transactionTypes.map((type) => {
              const isSelected = selectedCategory?.id === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleCategorySelect(type)}
                  disabled={saving}
                  className={`w-full flex items-center gap-4 px-6 p-4 rounded-full text-left transition-all ${
                    isSelected
                      ? "text-white hover:opacity-90"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={isSelected ? { backgroundColor: type.color } : {}}
                >
                  {isSelected ? (
                    <Check
                      size={20}
                      strokeWidth={3}
                      className="text-white flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                  )}
                  <span className="text-lg">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200 font-medium">
          <button
            onClick={onAddNew}
            disabled={saving}
            className="px-10 p-4 text-nowrap text-center bg-lime-100 rounded-full text-xl text-lime-700 hover:bg-lime-200 transition-colors"
          >
            + New
          </button>

          {(customInputActive && customLabel.trim() && !selectedCategory) ||
          selectedCategory ? (
            <button
              onClick={handleDoneClick}
              disabled={saving}
              className="flex-1 p-4 bg-lime-600 rounded-full text-xl text-white hover:bg-lime-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={handleSkipClick}
              disabled={saving}
              className="flex-1 p-4 bg-lime-100 rounded-full text-xl text-lime-700 hover:bg-lime-200 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeModal;
