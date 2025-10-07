import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { saveRound, getInvestments } from "../../lib/api.js";
import { menuOptions } from "../../assets/data.js";

const RaiseMoneyPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Investment");
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className="min-h-screen bg-gray-100 relative font-sans">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Toggle menu"
        style={{ top: NAVBAR_HEIGHT + 8 }}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isSidebarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
            }`}
          ></span>
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
              isSidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isSidebarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
            }`}
          ></span>
        </div>
      </button>

      {/* Overlay (below navbar) */}
      {isSidebarOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-opacity-50 z-30"
          style={{ top: NAVBAR_HEIGHT }}
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <div className="p-6 relative h-full">
          {/* Header: Startup Name + Close */}
          <div className="my-8 pb-4 border-b border-gray-200 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 capitalize truncate">
                {startupDisplayName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Campaign Dashboard</p>
            </div>
            <button
              aria-label="Close menu"
              className="shrink-0 text-2xl text-gray-500 hover:text-gray-700 -mt-1"
              onClick={toggleSidebar}
            >
              ×
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuOptions.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 group ${
                  activeItem === item.name
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
                <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Round Details</h2>
            <form
              onSubmit={handleRoundSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Days Remaining
                </label>
                <input
                  name="days"
                  type="number"
                  value={roundForm.days}
                  onChange={handleRoundChange}
                  className="border rounded px-3 py-2"
                  placeholder="e.g. 30"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Target Amount
                </label>
                <input
                  name="target"
                  type="text"
                  value={roundForm.target}
                  onChange={handleRoundChange}
                  className="border rounded px-3 py-2"
                  placeholder="e.g. $250k"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Minimum Investment
                </label>
                <input
                  name="minInvest"
                  type="number"
                  value={roundForm.minInvest}
                  onChange={handleRoundChange}
                  className="border rounded px-3 py-2"
                  placeholder="e.g. 1000"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id="isLive"
                  name="isLive"
                  type="checkbox"
                  checked={roundForm.isLive}
                  onChange={handleRoundChange}
                />
                <label htmlFor="isLive" className="text-sm font-medium">
                  Round is Live
                </label>
              </div>
              <div className="md:col-span-2 flex items-center gap-4 mt-2">
                <button
                  type="submit"
                  disabled={roundSaving}
                  className={`px-4 py-2 rounded text-white ${
                    roundSaving
                      ? "bg-slate-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {roundSaving ? "Saving..." : "Save Round"}
                </button>
                {roundMessage && (
                  <span className="text-sm text-slate-600">{roundMessage}</span>
                )}
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Investment History</h2>
            {loadingInvestments ? (
              <p className="text-sm text-slate-500">Loading investments...</p>
            ) : investments.length === 0 ? (
              <p className="text-sm text-slate-500">No investments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium border-b">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b">
                        Investor
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv._id} className="border-b last:border-b-0">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          {inv.investorEmail || inv.investorSupaId || "—"}
                        </td>
                        <td className="px-3 py-2">{inv.amount}</td>
                        <td className="px-3 py-2 capitalize">{inv.status}</td>
                        <td
                          className="px-3 py-2 max-w-xs truncate"
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyPage;
