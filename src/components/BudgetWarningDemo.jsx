import React, { useState } from "react";
import {
  getBudgetWarningState,
  getBudgetBackgroundClass,
  getBudgetTextClass,
  getBudgetTextDarkClass,
  getBudgetProgressClass,
  getBudgetAccentClass,
  WARNING_STATES,
  getWarningDescriptions,
  validateWarningSettings,
} from "../utils/budgetWarnings";

/**
 * Demo component to showcase the budget warning system
 * This component demonstrates how the warning colors change based on different budget states
 */
const BudgetWarningDemo = () => {
  const [totalBudget, setTotalBudget] = useState(1000);
  const [budgetLeft, setBudgetLeft] = useState(500);
  const [warningSettings, setWarningSettings] = useState({
    yellowType: "percentage",
    yellowValue: 40,
    redType: "percentage",
    redValue: 20,
  });

  const warningState = getBudgetWarningState(
    budgetLeft,
    totalBudget,
    warningSettings
  );
  const spentAmount = totalBudget - budgetLeft;
  const spentPercentage = ((spentAmount / totalBudget) * 100).toFixed(1);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const quickTestScenarios = [
    {
      name: "Safe (Green)",
      budgetLeft: 700,
      description: "Plenty of budget remaining",
    },
    {
      name: "Warning (Yellow)",
      budgetLeft: 300,
      description: "Approaching threshold",
    },
    { name: "Critical (Red)", budgetLeft: 100, description: "Very low budget" },
    {
      name: "Over Budget (Red)",
      budgetLeft: -50,
      description: "Budget exceeded",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Budget Warning System Demo
        </h2>
        <p className="text-gray-600">
          Test how the warning colors change based on budget thresholds
        </p>
      </div>

      {/* Quick Test Scenarios */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Quick Test Scenarios
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickTestScenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => setBudgetLeft(scenario.budgetLeft)}
              className="p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-600">
                {scenario.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget
          </label>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Remaining
          </label>
          <input
            type="number"
            value={budgetLeft}
            onChange={(e) => setBudgetLeft(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Warning Display */}
      <div
        className={`p-6 rounded-2xl ${getBudgetBackgroundClass(warningState)}`}
      >
        <div className="text-center space-y-4">
          <div
            className={`text-4xl font-bold ${getBudgetTextDarkClass(
              warningState
            )}`}
          >
            {formatCurrency(budgetLeft)}
          </div>
          <div className={`text-lg ${getBudgetTextClass(warningState)}`}>
            Budget Remaining
          </div>
          <div className={`text-sm ${getBudgetAccentClass(warningState)}`}>
            {formatCurrency(spentAmount)} spent ({spentPercentage}%) • Current
            State: {warningState.toUpperCase()}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getBudgetProgressClass(
                warningState
              )} transition-all duration-300`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warning Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Warning Thresholds
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              🟢 <strong>Green:</strong> More than {warningSettings.yellowValue}
              % of budget remaining
            </div>
            <div>
              🟡 <strong>Yellow:</strong> {warningSettings.redValue}% -{" "}
              {warningSettings.yellowValue}% of budget remaining
            </div>
            <div>
              🔴 <strong>Red:</strong> Less than {warningSettings.redValue}% of
              budget remaining (or over budget)
            </div>
          </div>
        </div>
      </div>

      {/* Style Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Available Utility Classes
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-mono text-sm text-gray-800">
              getBudgetBackgroundClass('{warningState}') → '
              {getBudgetBackgroundClass(warningState)}'
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-mono text-sm text-gray-800">
              getBudgetTextClass('{warningState}') → '
              {getBudgetTextClass(warningState)}'
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-mono text-sm text-gray-800">
              getBudgetTextDarkClass('{warningState}') → '
              {getBudgetTextDarkClass(warningState)}'
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-mono text-sm text-gray-800">
              getBudgetProgressClass('{warningState}') → '
              {getBudgetProgressClass(warningState)}'
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetWarningDemo;
