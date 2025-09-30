import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { getWelcomeData, saveWelcomeProgress } from "../../lib/api.js";

const Interests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const saveTimer = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const allInterests = [
    "SaaS",
    "Pets",
    "Sports Tech",
    "Biotech",
    "Blockchain & Web3",
    "Science & R&D",
    "Sports",
    "Subscription",
    "Service",
    "Childcare",
    "Food & Beverage",
    "Clean Tech",
    "Climate Change",
    "Brick & Mortar",
    "Recreation",
    "Distillery & Vineyards",
    "Events & Festivals",
    "Bars & Clubs",
    "Restaurant",
    "Music",
    "Edtech",
    "Film",
    "Games",
    "Alcohol & Vice",
    "Media",
    "Technology",
    "Entertainment",
    "AI",
    "Sustainability",
    "Hardware",
    "Y Combinator",
    "Moonshots",
    "Health & Fitness",
    "Retail",
    "B2B",
    "Healthcare",
    "Marketplace",
    "B2C",
    "Ecommerce",
    "Energy",
    "Home Tech",
    "Manufacturing",
    "Infrastructure & Construction",
  ];

  const displayedInterests = showAll ? allInterests : allInterests.slice(0, 21);

  const toggleInterest = (interest) => {
    const newSelected = new Set(selectedInterests);
    if (newSelected.has(interest)) {
      newSelected.delete(interest);
    } else {
      newSelected.add(interest);
    }
    setSelectedInterests(newSelected);
  };

  // Load existing
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) return;
      try {
        const data = await getWelcomeData(user.email);
        if (!data || cancelled) return;
        setSelectedInterests(
          new Set(Array.isArray(data.interests) ? data.interests : [])
        );
        setNotifications(data.notifyPopularStartups ?? true);
      } catch (e) {
        console.warn("Failed to load interests", e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // Auto-save
  useEffect(() => {
    if (!loaded || !user?.email) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveWelcomeProgress({
          email: user.email,
          interests: Array.from(selectedInterests),
          notifyPopularStartups: !!notifications,
        });
      } catch (e) {
        console.warn("Autosave interests failed", e);
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [selectedInterests, notifications, loaded, user?.email]);

  const handleSaveExit = async () => {
    try {
      if (user?.email) {
        await saveWelcomeProgress({
          email: user.email,
          interests: Array.from(selectedInterests),
          notifyPopularStartups: !!notifications,
        });
      }
    } catch (e) {
      console.warn("Save & Exit interests failed", e);
    } finally {
      navigate("/explore");
    }
  };

  const handleBack = async () => {
    try {
      if (user?.email) {
        await saveWelcomeProgress({
          email: user.email,
          interests: Array.from(selectedInterests),
          notifyPopularStartups: !!notifications,
        });
      }
    } catch (e) {
      console.warn("Back save failed (non-blocking)", e);
    } finally {
      navigate("/welcome/identity");
    }
  };

  const handleSkip = async () => {
    try {
      if (user?.email) {
        await saveWelcomeProgress({ email: user.email });
      }
    } catch (e) {
      console.warn("Skip save failed (non-blocking)", e);
    } finally {
      navigate("/welcome/investment_plans");
    }
  };

  const handleNext = async () => {
    if (selectedInterests.size === 0) return;
    try {
      if (user?.email) {
        await saveWelcomeProgress({
          email: user.email,
          interests: Array.from(selectedInterests),
          notifyPopularStartups: !!notifications,
        });
      }
    } catch (e) {
      console.warn("Next save failed (non-blocking)", e);
    } finally {
      navigate("/welcome/investment_plans");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-6">What interests you?</h1>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-6">
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selected tags */}
        {selectedInterests.size > 0 && (
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from(selectedInterests).map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-2 px-3 py-1 border rounded-full bg-gray-100 text-sm"
                >
                  {interest}
                  <button
                    onClick={() => toggleInterest(interest)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search dropdown - only show when searching */}
        {searchTerm && (
          <div className="relative max-w-lg mx-auto mb-6">
            <div className="absolute top-0 left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {allInterests
                .filter((interest) =>
                  interest.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      toggleInterest(interest);
                      setSearchTerm(""); // Clear search after selection
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedInterests.has(interest)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {interest}
                    {selectedInterests.has(interest) && (
                      <span className="float-right text-blue-500">✓</span>
                    )}
                  </button>
                ))}
              {allInterests.filter((interest) =>
                interest.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No interests found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interest tags grid - always show the same set */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {displayedInterests.map((interest) => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-3 rounded-lg border text-sm transition-colors ${
              selectedInterests.has(interest)
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      {/* See less/more toggle */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showAll ? "See less" : "See more"}
        </button>
      </div>

      {/* Notification checkbox */}
      <div className="flex items-start gap-3 mb-8">
        <input
          type="checkbox"
          id="notifications"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="notifications" className="text-sm text-gray-700">
          Notify me about popular startups I might like
        </label>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            className="text-gray-700 underline underline-offset-2 hover:cursor-pointer"
            onClick={handleBack}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50 hover:cursor-pointer"
              onClick={handleSaveExit}
            >
              Save & Exit
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50 hover:cursor-pointer"
              onClick={handleSkip}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={selectedInterests.size === 0}
              className={`px-5 py-2 rounded text-white hover:cursor-pointer ${
                selectedInterests.size > 0
                  ? "bg-black hover:bg-gray-900"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interests;
