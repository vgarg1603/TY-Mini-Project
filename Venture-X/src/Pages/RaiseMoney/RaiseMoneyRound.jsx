import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { saveRound, getInvestments } from "../../lib/api.js";
import { menuOptions } from "../../assets/data.js";

const RaiseMoneyPage = () => {
  const [activeItem, setActiveItem] = useState("Investments");
  const [roundForm, setRoundForm] = useState({
    days: "",
    target: "",
    minInvest: "",
    isLive: false,
  });
  const [roundSaving, setRoundSaving] = useState(false);
  const [roundMessage, setRoundMessage] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const NAVBAR_HEIGHT = 80;

  const startupDisplayName = useMemo(() => {
    if (startupNameFromPath) return decodeURIComponent(startupNameFromPath);
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("startup") || params.get("name");
    return fromQuery ? fromQuery : "Startup Name";
  }, [startupNameFromPath, location.search]);

  // Load investment history (mock: by startupName)
  useEffect(() => {
    (async () => {
      if (!startupNameFromPath) return;
      try {
        setLoadingInvestments(true);
        const items = await getInvestments({
          startupName: startupNameFromPath,
        });
        setInvestments(items);
      } catch (e) {
        console.error("Failed to load investments", e);
      } finally {
        setLoadingInvestments(false);
      }
    })();
  }, [startupNameFromPath]);

  const handleRoundChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoundForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoundSubmit = async (e) => {
    e.preventDefault();
    setRoundMessage(null);
    try {
      setRoundSaving(true);
      // Convert numeric fields
      const payload = {
        days: roundForm.days !== "" ? Number(roundForm.days) : undefined,
        target: roundForm.target,
        minInvest:
          roundForm.minInvest !== "" ? Number(roundForm.minInvest) : undefined,
        isLive: roundForm.isLive,
      };
      const userSupaId = user.id;
      if (!userSupaId) {
        setRoundMessage("User not authenticated");
        return;
      }
      await saveRound({ userSupaId, round: payload });
      setRoundMessage("Round saved");
    } catch (e) {
      setRoundMessage(e.message || "Failed to save");
    } finally {
      setRoundSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative font-sans">
      {/* Sidebar - Always Open */}
      <div
        className="fixed left-0 w-80 bg-white shadow-2xl z-40 border-r-2 border-gray-100"
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <div className="p-6 relative h-full overflow-y-auto">
          {/* Header: Startup Name */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize truncate">
                {startupDisplayName}
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">Campaign Dashboard</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5">
            {menuOptions.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${
                  activeItem === item.name
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-2 border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent"
                }`}
                onClick={() => {
                  setActiveItem(item.name);
                  if (item.path) {
                    const slug =
                      startupNameFromPath ||
                      encodeURIComponent(
                        startupDisplayName
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                      );
                    navigate(item.path(slug));
                  } else {
                    console.log(
                      `Navigating to ${item.name} (not yet implemented)`
                    );
                  }
                }}
              >
                <span className={`text-xl mr-3 transition-transform duration-200 ${
                  activeItem === item.name ? "scale-110" : "group-hover:scale-110"
                }`}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.name}</span>
                {activeItem === item.name && (
                  <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Always has left margin */}
      <div className="ml-80 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 sm:p-10 min-h-[50vh]">
            {/* Page Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Investment Round
                </h2>
              </div>
              <p className="text-gray-600 ml-13">Manage your funding round details and track investments</p>
            </div>

            {/* Round Details Section */}
            <div className="mb-10 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-6 border-2 border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                Round Configuration
              </h3>
              <form
                onSubmit={handleRoundSubmit}
                className="grid gap-6 md:grid-cols-2"
              >
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Days Remaining
                  </label>
                  <input
                    name="days"
                    type="number"
                    value={roundForm.days}
                    onChange={handleRoundChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Target Amount
                  </label>
                  <input
                    name="target"
                    type="text"
                    value={roundForm.target}
                    onChange={handleRoundChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="e.g. $250k"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Minimum Investment
                  </label>
                  <input
                    name="minInvest"
                    type="number"
                    value={roundForm.minInvest}
                    onChange={handleRoundChange}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input
                    id="isLive"
                    name="isLive"
                    type="checkbox"
                    checked={roundForm.isLive}
                    onChange={handleRoundChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="isLive" className="text-sm font-semibold text-gray-700">
                    Round is Live
                  </label>
                </div>
                <div className="md:col-span-2 flex items-center gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={roundSaving}
                    className={`px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                      roundSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    {roundSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Round
                      </>
                    )}
                  </button>
                  {roundMessage && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      roundMessage.toLowerCase().includes('saved')
                        ? 'bg-green-50 text-green-700 border-2 border-green-200'
                        : 'bg-red-50 text-red-700 border-2 border-red-200'
                    }`}>
                      {roundMessage.toLowerCase().includes('saved') ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      )}
                      <span className="font-medium">{roundMessage}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Investment History Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-6 border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Investment History
              </h3>
              {loadingInvestments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600 font-medium">Loading investments...</span>
                  </div>
                </div>
              ) : investments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No investments yet</p>
                  <p className="text-sm text-gray-400 mt-1">Investment history will appear here once you start receiving investments</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                          Investor
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {investments.map((inv) => (
                        <tr key={inv._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {inv.investorEmail || inv.investorSupaId || "—"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-700">{inv.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              inv.status === 'completed' ? 'bg-green-100 text-green-800' :
                              inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 max-w-xs truncate text-gray-600"
                            title={inv.note}
                          >
                            {inv.note || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyPage;
