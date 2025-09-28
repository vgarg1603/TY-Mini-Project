import React from "react";
import { useNavigate } from "react-router-dom";

const Finish = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl p-6 pb-28">
      <div className="flex items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl font-bold mb-6">Let's start investing</h1>
          <p className="text-xl text-gray-700 mb-8">
            You are now all set up to invest on Wefunder!
          </p>

          <div className="text-sm text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> Investing in startups is risky. Only
            invest what you can afford to lose.
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 max-w-lg">
            
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            className="text-gray-700 underline underline-offset-2 cursor-pointer"
            onClick={() => navigate("/welcome/public_profile")}
          >
            Back
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded bg-black text-white hover:bg-gray-900 cursor-pointer"
            onClick={() => navigate("/explore")}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Finish;
