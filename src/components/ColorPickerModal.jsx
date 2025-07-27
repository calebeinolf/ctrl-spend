import { useState, useEffect } from "react";

const ColorPickerModal = ({
  isOpen,
  onClose,
  onColorSelect,
  currentColor,
  currentName,
  title = "Edit Transaction Label",
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || "#ef4444");
  const [selectedName, setSelectedName] = useState(currentName || "");

  // Update state when props change
  useEffect(() => {
    setSelectedColor(currentColor || "#ef4444");
    setSelectedName(currentName || "");
  }, [currentColor, currentName]);

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

  const handleSave = () => {
    onColorSelect(selectedColor, selectedName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3
          className="text-xl font-semibold text-gray-900 mb-6"
          style={{ color: selectedColor }}
        >
          {title}
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              placeholder="Enter type name"
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
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedName.trim()}
            className="flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedName.trim() ? selectedColor : undefined,
            }}
          >
            <span style={{ color: "white" }}>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
