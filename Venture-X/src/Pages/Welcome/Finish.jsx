import React from "react";
import { useNavigate } from "react-router-dom";

const Finish = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto p-6 pb-28">
      <div className="flex items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl font-bold mb-6">Let's start investing</h1>
          <p className="text-xl text-gray-700 mb-8">
            You are now all set up to invest on VentureX!
          </p>
          
          <div className="text-sm text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> Investing in startups is risky. Only invest what you can afford to lose.
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            {/* Treasure chest illustration placeholder */}
            <div className="w-full h-80 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute top-4 left-8">
                <div className="w-16 h-20 bg-teal-600 rounded-t-full"></div>
              </div>
              <div className="absolute top-6 right-12">
                <div className="w-12 h-16 bg-teal-600 rounded-t-full"></div>
              </div>
              
              {/* Palm leaves */}
              <div className="absolute top-0 left-0">
                <div className="w-32 h-32 bg-teal-700 rounded-full opacity-60 transform -translate-x-8 -translate-y-8"></div>
              </div>
              <div className="absolute top-0 right-0">
                <div className="w-24 h-24 bg-teal-700 rounded-full opacity-60 transform translate-x-8 -translate-y-8"></div>
              </div>
              <div className="absolute bottom-0 left-0">
                <div className="w-20 h-20 bg-teal-700 rounded-full opacity-60 transform -translate-x-6 translate-y-6"></div>
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="w-28 h-28 bg-teal-700 rounded-full opacity-60 transform translate-x-10 translate-y-10"></div>
              </div>
              
              {/* Central treasure chest */}
              <div className="relative z-10">
                {/* Chest base */}
                <div className="w-32 h-20 bg-amber-800 rounded-lg relative">
                  {/* Chest lid */}
                  <div className="w-32 h-12 bg-amber-700 rounded-t-lg absolute -top-6 border-2 border-yellow-600"></div>
                  {/* Lock */}
                  <div className="w-4 h-4 bg-yellow-500 rounded absolute top-1 left-1/2 transform -translate-x-1/2"></div>
                  {/* Coins spilling out */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Additional coins around chest */}
                <div className="absolute -bottom-2 -left-4">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="absolute -bottom-2 -right-4">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="absolute bottom-4 -left-6">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="absolute bottom-4 -right-6">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              
              {/* Sand dunes */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-yellow-200 to-transparent rounded-b-2xl"></div>
              <div className="absolute bottom-0 left-1/4 w-32 h-8 bg-yellow-300 rounded-full opacity-70"></div>
              <div className="absolute bottom-0 right-1/4 w-24 h-6 bg-yellow-300 rounded-full opacity-70"></div>
            </div>
          </div>
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
