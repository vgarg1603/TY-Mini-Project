import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 font-sans font-stretch-110%">
      <nav
        className="w-full px-4 py-5 flex items-center justify-between gap-4"
        aria-label="Primary"
      >
        {/* Left: Logo + Explore + Search */}
        <div className="flex items-center gap-7">
          <Link to="/" className="block" aria-label="Venture X home">
            {/* Served from Vite public/ folder */}
            <img
              src="/VentureXLogo.png"
              alt="Venture X"
              className="h-7 w-auto"
            />
          </Link>

          <ul className="inline-flex items-center gap-8 m-0 p-0 list-none text-gray-700 text-sm">
            <li className="hidden sm:block">
              <Link to="#" className="hover:text-black">
                Explore
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-1.5 hover:text-black"
              >
                <span className="text-gray-700" aria-hidden="true">
                  {/* search icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Search</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Right: Raise Money, Learn | Log in, Sign up */}
        <div className="flex items-center gap-4 pr-10">
          <ul className="hidden sm:flex items-center gap-5 m-0 p-0 list-none text-sm text-gray-700">
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 hover:text-black"
              >
                Raise Money
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 hover:text-black"
              >
                Learn
                <span className="text-gray-500" aria-hidden="true">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </li>
          </ul>

          <div
            className="w-px h-6 bg-gray-200"
            role="separator"
            aria-orientation="vertical"
          />

          <ul className="flex items-center gap-3 m-0 p-0 list-none text-sm">
            <li>
              <Link to="/login" className="text-gray-700 hover:text-black">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/signup" className="text-gray-700 hover:text-black">
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
