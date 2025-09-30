import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  getWelcomeData,
  getRaiseMoneyRedirect,
  getCompanyStatus,
} from "../lib/api.js";
import { supabase } from "../lib/supabaseClient.js";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);
  const closeTimer = useRef(null);

  // Fetch profile image URL for logged-in user
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) {
        setProfileUrl("");
        return;
      }
      try {
        const data = await getWelcomeData(user.email);
        if (!cancelled) setProfileUrl(data?.profileURL || "");
      } catch {
        // ignore fetch failures, keep default avatar
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // Open/close handlers ensure the menu persists while moving from trigger to panel
  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 150);
  };

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

        {/* Right: Raise Money, Learn | Auth controls */}
        <div className="flex items-center gap-4">
          <ul className="hidden sm:flex items-center gap-5 m-0 p-0 list-none text-sm text-gray-700">
            <li>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 hover:text-black"
                onClick={async () => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  const supabaseId = user.id || user?.user_metadata?.sub;
                  const path = await getRaiseMoneyRedirect({ supabaseId });
                  navigate(path);
                }}
              >
                Raise Money
              </button>
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

          {/* If not logged in -> Login/Signup */}
          {!user && (
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
          )}

          {/* If logged in -> Avatar + Menu */}
          {user && (
            <div
              className="relative"
              ref={menuWrapRef}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
              onFocus={openMenu}
              onBlur={(e) => {
                // If focus moves outside wrapper, close
                const related = e.relatedTarget;
                if (!menuWrapRef.current?.contains(related)) scheduleClose();
              }}
            >
              <button
                type="button"
                className="flex items-center gap-2 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {/* Avatar preview */}
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-gray-800 text-white grid place-items-center text-xs font-semibold">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </button>

              <div
                role="menu"
                className={`absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl p-2 z-50 ${
                  menuOpen ? "block" : "hidden"
                }`}
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                {/* Filtered menu: no VIP, Followers, Activity Feed, Cash, Contact Support */}
                {/* My Company: only show if user has startupName */}
                {user && (
                  <MyCompanyMenuItem user={user} isMenuOpen={menuOpen} />
                )}
                <MenuItem label="Portfolio" href="#" icon={<IconPieChart />} />
                <MenuItem label="Watchlist" href="#" icon={<IconHeart />} />
                <MenuItem
                  label="Tax Documents"
                  href="#"
                  icon={<IconDocument />}
                />
                <MenuItem label="Account" href="#" icon={<IconGear />} />
                <MenuItem label="Profile" href="#" avatarUrl={profileUrl} />
                <div className="my-1 border-t border-gray-100" />
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600 flex items-center gap-3"
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                    } finally {
                      window.location.replace("/");
                    }
                  }}
                >
                  <IconLogout />
                  <span className="underline-offset-2 hover:underline hover:font-sans">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

// Small helper component for consistent menu items
const MenuItem = ({ label, href = "#", icon = null, avatarUrl = "" }) => (
  <a
    role="menuitem"
    href={href}
    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-800"
  >
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt=""
        className="h-6 w-6 rounded-full object-cover border"
      />
    ) : (
      <span className="text-gray-500" aria-hidden="true">
        {icon}
      </span>
    )}
    <span className="truncate underline-offset-2 hover:underline hover:font-sans">
      {label}
    </span>
  </a>
);

// Icons
const IconBriefcase = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="3"
      y="7"
      width="18"
      height="13"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconPieChart = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3v9h9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20.49 15A8.5 8.5 0 1 1 9 3.51"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconHeart = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconDocument = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M14 3v6h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconGear = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.4-2-3.4-2.3.7a8.1 8.1 0 0 0-1.7-1L13 3h-4l-.5 2.5a8.1 8.1 0 0 0-1.7 1l-2.3-.7-2 3.4L4.5 13a7.97 7.97 0 0 0 .1 2l-2 1.4 2 3.4 2.3-.7a8.1 8.1 0 0 0 1.7 1L9 23h4l.5-2.5a8.1 8.1 0 0 0 1.7-1l2.3.7 2-3.4L19.4 15Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLogout = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 12H3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 15l-3-3 3-3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export default Navbar;

// My Company dynamic menu entry
function MyCompanyMenuItem({ user, isMenuOpen }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [targetPath, setTargetPath] = useState("/raise_money/start");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabaseId = user?.id || user?.user_metadata?.sub;
        if (!supabaseId) return;
        const status = await getCompanyStatus({ supabaseId });
        const slug = (status?.startupName || "").trim();
        const hasStartupName = !!slug;
        if (!cancelled) setVisible(hasStartupName);
        // Always go to overview when visible
        if (!cancelled && hasStartupName) {
          setTargetPath(`/raise_money/${slug}/overview`);
        }
      } catch {
        if (!cancelled) setVisible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.user_metadata?.sub, isMenuOpen]);

  if (!visible) return null;
  return (
    <button
      role="menuitem"
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-800 flex items-center gap-3"
      onClick={() => navigate(targetPath)}
    >
      <span className="text-gray-500" aria-hidden="true">
        <IconBriefcase />
      </span>
      <span className="truncate underline-offset-2 hover:underline hover:font-sans">
        My Company
      </span>
    </button>
  );
}
