import React, { useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const RaiseMoneyPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Overview");
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  // Keep overlay and sidebar below the sticky Navbar
  const NAVBAR_HEIGHT = 80; // px, matches ~py-5 header with logo

  const startupDisplayName = useMemo(() => {
    // Prefer path param if present, otherwise try search params: ?startup=Name or ?name=Name
    if (startupNameFromPath) return decodeURIComponent(startupNameFromPath);
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("startup") || params.get("name");
    return fromQuery ? fromQuery : "Startup Name";
  }, [startupNameFromPath, location.search]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { name: "Overview" },
    { name: "Editor" },
    { name: "Investments" },
    { name: "Orders" },
    { name: "Products" },
  ];

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
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 group ${
                  activeItem === item.name
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => {
                  setActiveItem(item.name);
                  // Placeholder for navigation
                  console.log(`Navigating to ${item.name}`);
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
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-0"
        } p-8`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 min-h-[50vh]">
            {/* Plain content area for Overview (user will add content) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyPage;
