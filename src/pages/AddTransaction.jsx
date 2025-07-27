import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Delete,
  Check,
  Plus,
  Minus,
  Equal,
  Pencil,
} from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";
import { formatCurrency } from "../utils/formatCurrency";
import AddTransactionHeader from "../components/AddTransactionHeader";
import AddTransactionLabelModal from "../components/AddTransactionLabelModal";

const AddTransaction = () => {
  const navigate = useNavigate();
  const {
    addTransaction,
    settings,
    getCurrentMonthSpending,
    shouldShowWarning,
    getCurrentBudgetWarningState,
    updateTransactionTypes,
  } = useAppData();
  const [step, setStep] = useState(1); // 1: Calculator, 2: Category selection
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showAddLabelModal, setShowAddLabelModal] = useState(false);
  const [customInputActive, setCustomInputActive] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pendingOperation, setPendingOperation] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [backspaceTimeout, setBackspaceTimeout] = useState(null);
  const [fullEquation, setFullEquation] = useState("");
  const amountDisplayRef = useRef(null);

  const currentSpending = getCurrentMonthSpending();
  const budgetLeft = settings.budget.amount - currentSpending;
  const showWarning = shouldShowWarning();
  const warningState = getCurrentBudgetWarningState();

  // Auto-scroll to the right when displayAmount changes
  useEffect(() => {
    if (amountDisplayRef.current) {
      amountDisplayRef.current.scrollLeft =
        amountDisplayRef.current.scrollWidth;
    }
  }, [displayAmount]);

  const handleNumberPress = (num) => {
    if (waitingForOperand) {
      setDisplayAmount(num);
      setAmount(num);
      setWaitingForOperand(false);
    } else if (displayAmount === "0") {
      setDisplayAmount(num);
      setAmount(num);
    } else {
      // If we're editing a result (no pending operation and no waiting for operand), clear the equation
      if (!pendingOperation && !waitingForOperand && fullEquation) {
        setFullEquation("");
        setPreviousValue(null);
      }
      const newAmount = displayAmount + num;
      setDisplayAmount(newAmount);
      setAmount(newAmount);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplayAmount("0.");
      setAmount("0.");
      setWaitingForOperand(false);
    } else if (!displayAmount.includes(".")) {
      // If we're editing a result (no pending operation and no waiting for operand), clear the equation
      if (!pendingOperation && !waitingForOperand && fullEquation) {
        setFullEquation("");
        setPreviousValue(null);
      }
      const newAmount = displayAmount + ".";
      setDisplayAmount(newAmount);
      setAmount(newAmount);
    }
  };

  const handleOperation = (operation) => {
    // Don't allow operation if we're waiting for operand (except for the first operation)
    if (waitingForOperand && previousValue !== null) {
      return;
    }

    const inputValue = parseFloat(displayAmount);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setFullEquation(`${displayAmount} ${operation}`);
    } else if (pendingOperation && !waitingForOperand) {
      const currentValue = previousValue || 0;
      let result;

      switch (pendingOperation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        default:
          return;
      }

      result = Math.max(0, result); // Don't allow negative results
      const formattedResult = result.toString();
      setDisplayAmount(formattedResult);
      setAmount(formattedResult);
      setPreviousValue(result);
      setFullEquation((prev) => `${prev} ${displayAmount} ${operation}`);
    }

    setWaitingForOperand(true);
    setPendingOperation(operation);
  };

  const handleEquals = () => {
    // Don't allow equals if we're waiting for operand
    if (waitingForOperand) {
      return;
    }

    const inputValue = parseFloat(displayAmount);

    if (previousValue !== null && pendingOperation) {
      let result;

      switch (pendingOperation) {
        case "+":
          result = previousValue + inputValue;
          break;
        case "-":
          result = previousValue - inputValue;
          break;
        default:
          return;
      }

      result = Math.max(0, result); // Don't allow negative results
      const formattedResult = result.toString();
      setDisplayAmount(formattedResult);
      setAmount(formattedResult);

      // Update equation to show the full calculation
      setFullEquation((prev) => `${prev} ${displayAmount}`);

      setPreviousValue(null);
      setPendingOperation(null);
      setWaitingForOperand(false);
    }
  };

  const handleCheckmarkButton = () => {
    if (pendingOperation && !waitingForOperand) {
      // If there's a pending operation and we're not waiting for operand, act as equals button
      handleEquals();
    } else if (!pendingOperation) {
      // If no pending operation, act as next button
      handleNext();
    }
    // If waiting for operand, do nothing
  };

  const handleBackspace = () => {
    if (displayAmount.length === 1) {
      setDisplayAmount("0");
      setAmount("");
    } else {
      const newAmount = displayAmount.slice(0, -1);
      setDisplayAmount(newAmount);
      setAmount(newAmount);
    }
  };

  const handleBackspaceStart = () => {
    // Clear any existing timeout
    if (backspaceTimeout) {
      clearTimeout(backspaceTimeout);
    }

    // Set timeout for long press (2 seconds)
    const timeout = setTimeout(() => {
      handleClear();
    }, 500);

    setBackspaceTimeout(timeout);
  };

  const handleBackspaceEnd = () => {
    // Clear the timeout if backspace is released before 2 seconds
    if (backspaceTimeout) {
      clearTimeout(backspaceTimeout);
      setBackspaceTimeout(null);
    }
  };

  const handleClear = () => {
    setDisplayAmount("0");
    setAmount("");
    setPreviousValue(null);
    setPendingOperation(null);
    setWaitingForOperand(false);
    setFullEquation("");
  };

  const handleNext = () => {
    if (amount && parseFloat(amount) > 0) {
      setStep(2);
    }
  };

  const handleCategorySelect = async (category) => {
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

  const handleCustomTransaction = async (customLabel) => {
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        label: customLabel,
        categoryId: null,
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding custom transaction:", error);
    }
    setLoading(false);
  };

  const handleCustomInputClick = () => {
    setCustomInputActive(true);
    setSelectedCategory(null); // Clear any selected category
  };

  const handleCustomInputChange = (e) => {
    setCustomLabel(e.target.value);
  };

  const handleCustomInputKeyPress = (e) => {
    if (e.key === "Enter" && customLabel.trim()) {
      handleCustomTransaction(customLabel.trim());
    }
  };

  const handleDoneClick = () => {
    if (selectedCategory) {
      // Save with selected category
      handleSaveTransaction(selectedCategory);
    } else if (customInputActive && customLabel.trim() && !selectedCategory) {
      // Save with custom label only if it's active and no category is selected
      handleCustomTransaction(customLabel.trim());
    }
  };

  const handleSaveTransaction = async (category) => {
    setLoading(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        label: category?.name || "Transaction",
        categoryId: category?.id || null,
      });
      navigate("/current-budget");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
    setLoading(false);
  };

  const handleAddTransactionLabel = async (name, color) => {
    const types = settings?.transactionTypes?.types || [];
    const newType = {
      id: Date.now().toString(),
      name: name.trim(),
      color: color,
    };

    const updatedTypes = [...types, newType];

    setLoading(true);
    try {
      await updateTransactionTypes(updatedTypes);
      setShowAddLabelModal(false);
    } catch (error) {
      console.error("Error adding Transaction Label:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div
        className={
          step === 2 ? "fixed left-0 right-0 top-0 " : "flex flex-col flex-1"
        }
      >
        <AddTransactionHeader
          step={step}
          showWarning={showWarning}
          warningState={warningState}
          budgetLeft={budgetLeft}
          budgetAmount={settings.budget.amount}
          formatCurrency={formatCurrency}
          onBackClick={() => setStep(1)}
        />

        {/* Back Button - Only shown in step 2 */}
        {step === 2 && (
          <div className="px-6 pb-4 bg-white">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        )}

        {/* Amount Display - Always shown */}
        <div
          className={`${
            step === 2 ? "bg-white pb-6" : "flex-1"
          } flex flex-col justify-end items-end p-4`}
        >
          {fullEquation && (
            <div className="text-xl font-medium text-gray-400 mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {fullEquation}
            </div>
          )}
          <div className="flex w-full items-center text-8xl relative">
            <div className={`text-gray-400 flex-shrink-0`}>
              <span>$</span>
            </div>
            <div
              ref={amountDisplayRef}
              className="flex-1 overflow-x-auto scrollbar-hide overflow-hidden"
            >
              <div
                className={`
                  ${
                    step === 2 ? "text-gray-400" : "text-gray-800"
                  } text-right whitespace-nowrap min-w-full`}
              >
                {displayAmount}
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 ml-[1ch]"></div>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        {step === 2 && (
          <div className="h-20 -translate-y-[1px] bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
        )}
      </div>

      {/* Step 1: Calculator */}
      {step === 1 && (
        <div className="p-4 flex justify-center">
          <div className="w-full max-w-md grid grid-cols-4 gap-3 aspect-square">
            {[7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                className="aspect-square bg-gray-100 text-gray-800 text-4xl rounded-full  hover:bg-gray-200 transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              onMouseDown={handleBackspaceStart}
              onMouseUp={handleBackspaceEnd}
              onMouseLeave={handleBackspaceEnd}
              onTouchStart={handleBackspaceStart}
              onTouchEnd={handleBackspaceEnd}
              className="flex justify-center items-center aspect-square bg-lime-100 text-lime-800 text-4xl rounded-full hover:bg-lime-200 transition-colors active:scale-95"
            >
              <Delete size={32} />
            </button>

            {[4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                className="aspect-square bg-gray-100 text-gray-800 text-4xl rounded-full  hover:bg-gray-200 transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleOperation("-")}
              disabled={waitingForOperand && previousValue !== null}
              className="flex justify-center items-center aspect-square bg-lime-100 text-lime-800 text-4xl rounded-full hover:bg-lime-200 transition-colors disabled:bg-gray-300 disabled:text-gray-500 active:scale-95"
            >
              <Minus size={32} />
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num.toString())}
                className="aspect-square bg-gray-100 text-gray-800 text-4xl rounded-full  hover:bg-gray-200 transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => handleOperation("+")}
              disabled={waitingForOperand && previousValue !== null}
              className="flex justify-center items-center aspect-square bg-lime-100 text-lime-800 text-4xl rounded-full hover:bg-lime-200 transition-colors disabled:bg-gray-300 disabled:text-gray-500 active:scale-95"
            >
              <Plus size={32} />
            </button>

            <button
              onClick={() => handleNumberPress("0")}
              className="col-span-2  bg-gray-100 text-gray-800 text-4xl rounded-full  hover:bg-gray-200 transition-colors active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="aspect-square bg-gray-100 text-gray-800 text-4xl rounded-full  hover:bg-gray-200 transition-colors active:scale-95"
            >
              .
            </button>
            <button
              onClick={handleCheckmarkButton}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                (pendingOperation && waitingForOperand)
              }
              className="flex justify-center items-center aspect-square bg-lime-600 text-white text-4xl rounded-full hover:bg-lime-700 transition-colors active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {pendingOperation && !waitingForOperand ? (
                <Equal size={32} />
              ) : (
                <Check size={32} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Category Selection */}
      {step === 2 && (
        <div className="overflow-y-auto mt-[40vh]">
          <div className="text-2xl text-center text-gray-600 font-medium mt-2 mb-6">
            What's it for?
          </div>

          {/* Categories - starts at halfway point and continues down */}
          <div className="px-6 pb-6">
            {/* Custom Label */}
            <div className="space-y-3 pb-20">
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
                  onKeyPress={handleCustomInputKeyPress}
                  onFocus={handleCustomInputClick}
                  className="flex-1 bg-transparent !text-lg text-gray-800 placeholder-gray-400 outline-none"
                  placeholder="Custom"
                  disabled={loading}
                />
              </div>

              {(settings?.transactionTypes?.types || []).map((type) => {
                const isSelected = selectedCategory?.id === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleCategorySelect(type)}
                    disabled={loading}
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
        </div>
      )}

      {/* Bottom Action Buttons */}
      {step === 2 && (
        <div className="fixed flex items-center gap-3 left-0 right-0 bottom-0 p-6 z-20 font-medium">
          <button
            onClick={() => setShowAddLabelModal(true)}
            disabled={loading}
            className="px-10 p-4 text-nowrap text-center bg-lime-100 rounded-full text-xl text-lime-700 hover:bg-lime-200 transition-colors"
          >
            + New
          </button>

          {(customInputActive && customLabel.trim() && !selectedCategory) ||
          selectedCategory ? (
            <button
              onClick={handleDoneClick}
              disabled={loading}
              className="flex-1 p-4 bg-lime-600 rounded-full text-xl text-white hover:bg-lime-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={() => handleCustomTransaction("Transaction")}
              disabled={loading}
              className="flex-1 p-4 bg-lime-100 rounded-full text-xl text-lime-700 hover:bg-lime-200 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      )}

      {/* Bottom Gradient Overlay 2 */}
      {step === 2 && (
        <div>
          {/* <div className="fixed left-0 right-0 bottom-24 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 translate-y-1"></div> */}
          <div className="fixed left-0 right-0 bottom-0 h-24 bg-white pointer-events-none z-10"></div>
        </div>
      )}

      {/* Add Transaction Label Modal */}
      <AddTransactionLabelModal
        isOpen={showAddLabelModal}
        onClose={() => setShowAddLabelModal(false)}
        onAdd={handleAddTransactionLabel}
        saving={loading}
      />
    </div>
  );
};

export default AddTransaction;
