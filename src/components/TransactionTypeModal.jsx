import { useState, useEffect, useRef } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";

const TransactionTypeModal = ({
  isOpen,
  onClose,
  onSelect,
  onAddNew,
  transactionTypes = [],
  currentCategoryId = null,
  currentLabel = "",
  saving = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customInputActive, setCustomInputActive] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [modalHeight, setModalHeight] = useState("60vh");
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);
  const modalRef = useRef(null);

  // Reset state when props change (e.g., when label is removed)
  useEffect(() => {
    setSelectedCategory(
      currentLabel && currentCategoryId
        ? transactionTypes.find((type) => type.id === currentCategoryId) || null
        : null
    );
    setCustomInputActive(false);
    setCustomLabel("");
    setModalHeight("60vh");
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
    setLastScrollTop(0);
  }, [currentLabel, currentCategoryId, transactionTypes, isOpen]);

  // Handle modal visibility animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal renders before animating
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle scroll expansion (one-way only)
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;
    const scrollDelta = scrollTop - lastScrollTop;

    // Only process significant scroll movements to avoid jitter
    if (Math.abs(scrollDelta) < 5) {
      setLastScrollTop(scrollTop);
      return;
    }

    // Scrolling down: expand from 60vh to 90vh (one-way only)
    if (
      scrollDelta > 0 &&
      scrollTop > 20 &&
      modalHeight === "60vh" &&
      scrollHeight > clientHeight
    ) {
      setModalHeight("90vh");
      setLastScrollTop(0); // Reset to prevent any issues
      return;
    }

    setLastScrollTop(scrollTop);
  };

  // Handle touch/mouse events for dragging
  const handleStart = (clientY) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
  };

  const handleMove = (clientY) => {
    if (!isDragging) return;
    setCurrentY(clientY);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;

    // If dragging down and at top of scroll
    if (deltaY > 50 && scrollTop <= 5) {
      if (modalHeight === "90vh") {
        setModalHeight("60vh");
      } else if (modalHeight === "60vh") {
        setIsVisible(false);
        setTimeout(() => onClose(), 150);
      }
    }
    // If dragging up significantly from 60vh, expand to 90vh
    else if (deltaY < -50 && modalHeight === "60vh") {
      setModalHeight("90vh");
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

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
    // Close modal with animation first, then execute the action after a delay
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      if (selectedCategory) {
        // Save with selected category
        onSelect(selectedCategory);
      } else if (customInputActive && customLabel.trim() && !selectedCategory) {
        // Save with custom label only if it's active and no category is selected
        onSelect({ id: null, name: customLabel.trim(), color: null });
      }
    }, 150);
  };

  const handleRemoveLabelClick = () => {
    // Close modal with animation first, then execute the action after a delay
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onSelect({ id: null, name: "", color: null });
    }, 150);
  };

  const isCurrentLabelSelected = () => {
    if (selectedCategory) {
      return selectedCategory.id === currentCategoryId;
    }
    if (customInputActive && customLabel.trim()) {
      return customLabel.trim() === currentLabel;
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        // Only close if clicking on the backdrop (not the modal itself)
        if (e.target === e.currentTarget) {
          setIsVisible(false);
          setTimeout(() => onClose(), 150);
        }
      }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-t-3xl w-full max-w-md flex flex-col transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: modalHeight }}
      >
        {/* Header */}
        <div
          className="p-6 border-b border-gray-200 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleStart(e.clientY)}
          onMouseMove={(e) => handleMove(e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientY)}
          onTouchEnd={handleEnd}
        >
          <div className="text-2xl text-center text-gray-600 font-medium">
            What's it for?
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
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

            {/* Add New Label Card */}
            <button
              onClick={onAddNew}
              disabled={saving}
              className="w-full flex items-center gap-3 px-6 p-4 font-medium rounded-full text-left transition-all bg-lime-100 hover:bg-lime-200"
            >
              <Plus size={24} className="text-lime-700 flex-shrink-0" />
              <span className="text-lg text-lime-700">Add new label</span>
            </button>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200 font-medium">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 150);
            }}
            disabled={saving}
            className="w-full  p-4 text-nowrap text-center bg-gray-100 rounded-full text-xl text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          {(customInputActive && customLabel.trim() && !selectedCategory) ||
          selectedCategory ? (
            isCurrentLabelSelected() ? (
              <button
                onClick={handleRemoveLabelClick}
                disabled={saving}
                className="w-full p-4 bg-red-100 rounded-full text-xl text-red-700 hover:bg-red-200 transition-colors"
              >
                Remove label
              </button>
            ) : (
              <button
                onClick={handleDoneClick}
                disabled={saving}
                className="w-full p-4 bg-lime-600 rounded-full text-xl text-white hover:bg-lime-700 transition-colors"
              >
                Done
              </button>
            )
          ) : currentLabel ? (
            <button
              onClick={handleRemoveLabelClick}
              disabled={saving}
              className="w-full p-4 bg-red-100 rounded-full text-xl text-red-700 hover:bg-red-200 transition-colors"
            >
              Remove label
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeModal;
