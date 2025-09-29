import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InvestmentPlans = () => {
  const navigate = useNavigate();
  const [selectedAnnualAmount, setSelectedAnnualAmount] = useState("");
  const [perStartupFrom, setPerStartupFrom] = useState("₹8k");
  const [perStartupTo, setPerStartupTo] = useState("");

  const annualAmounts = [
    "₹8k to ₹1.7L",
    "₹1.7L to ₹8.3L",
    "₹8.3L to ₹21L",
    "₹21L to ₹83L",
    "₹83L to ₹2.1Cr",
    "₹2.1Cr+",
  ];

  const perStartupOptions = [
    "₹8k",
    "₹42k",
    "₹83k",
    "₹1.7L",
    "₹4.2L",
    "₹8.3L",
    "₹21L",
    "₹42L",
    "₹83L",
    "₹2.1Cr+",
  ];

  const isFormValid = selectedAnnualAmount && perStartupFrom && perStartupTo;

  return (
    <div className="max-w-4xl mx-auto p-6 pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-4">
          How much do you plan to invest?
        </h1>
        <p className="text-gray-600 mb-8">
          Annual angel investments, not just on Wefunder
        </p>
      </div>

      {/* Annual Investment Amount Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {annualAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAnnualAmount(amount)}
            className={`px-6 py-4 rounded-lg border text-center transition-colors ${
              selectedAnnualAmount === amount
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      {/* Per Startup Section */}
      <div className="mb-12">
        <h2 className="text-lg font-medium mb-6">Per startup</h2>
        <div className="flex items-center justify-center gap-4 max-w-md">
          <div className="flex-1">
            <select
              value={perStartupFrom}
              onChange={(e) => setPerStartupFrom(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              {perStartupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-600 font-medium">to</span>

          <div className="flex-1">
            <select
              value={perStartupTo}
              onChange={(e) => setPerStartupTo(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="">Select amount</option>
              {perStartupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            className="text-gray-700 underline underline-offset-2 cursor-pointer"
            onClick={() => navigate("/welcome/interests")}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/welcome/public_profile")}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={!isFormValid}
              className={`px-5 py-2 rounded text-white cursor-pointer ${
                isFormValid
                  ? "bg-black hover:bg-gray-900"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={() => isFormValid && navigate("/welcome/public_profile")}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlans;
