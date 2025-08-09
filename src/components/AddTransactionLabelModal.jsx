import { useState } from "react";

const AddTransactionLabelModal = ({
  isOpen,
  onClose,
  onAdd,
  saving = false,
}) => {
  const [newTypeName, setNewTypeName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ef4444");

  const predefinedColors = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#eab308", // yellow
    "#22c55e", // lime
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f97316", // orange
  ];

  const handleAdd = () => {
    if (!newTypeName.trim()) return;
    onAdd(newTypeName.trim(), selectedColor);
    setTimeout(() => {
      setNewTypeName("");
      setSelectedColor("#ef4444");
    }, 300);
  };

  const handleCancel = () => {
    setNewTypeName("");
    setSelectedColor("#ef4444");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-4xl p-6 w-full max-w-sm">
        <h3
          className="text-xl font-semibold text-gray-900 mb-6"
          style={{ color: selectedColor }}
        >
          Add Transaction Label
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-transparent"
              placeholder="Enter type name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    selectedColor === color
                      ? "border-gray-900 scale-110"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={saving || !newTypeName.trim()}
            className="flex-1 px-4 py-3 text-white rounded-full font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{
              backgroundColor: newTypeName.trim() ? selectedColor : undefined,
            }}
          >
            <span style={{ color: "white" }}>
              {saving ? "Adding..." : "Add"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionLabelModal;
