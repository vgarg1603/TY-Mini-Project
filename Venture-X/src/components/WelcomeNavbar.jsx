import React from "react";
import { Link, useNavigate } from "react-router-dom";

const WelcomeNavbar = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <nav
        className="w-full px-6 py-5 flex items-center justify-between"
        aria-label="Welcome"
      >
        {/* Left: Logo only */}
        <Link to="/" className="block" aria-label="Venture X home">
          <img src="/VentureXLogo.png" alt="Venture X" className="h-7 w-auto" />
        </Link>

        {/* Right: Save & Exit */}
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={() => navigate("/")}
        >
          Save & Exit
        </button>
      </nav>
    </header>
  );
};

export default WelcomeNavbar;
