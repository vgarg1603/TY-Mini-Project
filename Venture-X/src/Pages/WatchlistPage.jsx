import React, { useEffect, useRef, useState } from "react";
import { getWatchlist, toggleWatchlist } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

const WatchlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedCompanyIds, setSavedCompanyIds] = useState(new Set());

  // Load watchlist when component mounts or user changes
  useEffect(() => {
    let mounted = true;

    async function loadWatchlist() {
      if (!user) {
        setCompanies([]);
        setSavedCompanyIds(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { companies: fetchedCompanies, companyIds } = await getWatchlist({
          supabaseId: user.id,
          email: user.email,
        });

        if (mounted) {
          setCompanies(fetchedCompanies || []);
          setSavedCompanyIds(new Set(companyIds || []));
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load watchlist");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWatchlist();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function onToggleWatch(c) {
    if (!user) {
      navigate("/login");
      return;
    }

    const id = String(c._id || c.id);
    const next = new Set(savedCompanyIds);
    const isSaved = next.has(id);

    // Optimistically update UI
    if (isSaved) {
      next.delete(id);
      setCompanies(companies.filter((company) => String(company._id) !== id));
    } else {
      next.add(id);
    }
    setSavedCompanyIds(next);

    try {
      await toggleWatchlist({
        supabaseId: user.id,
        email: user.email,
        companyId: id,
      });
    } catch {
      // Revert on failure
      const revert = new Set(savedCompanyIds);
      setSavedCompanyIds(revert);
      // Reload the list
      if (isSaved) {
        setCompanies([...companies, c]);
      } else {
        setCompanies(companies.filter((company) => String(company._id) !== id));
      }
    }
  }

  function CompanyCard({ c }) {
    const videoRef = useRef(null);
    const hasVideo = !!c.mainCoverVideo;
    const avatar = c?.team && c.team[0]?.profilePicture;
    const isSaved = savedCompanyIds.has(String(c._id || c.id));

    const onEnter = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    const onLeave = () => {
      const v = videoRef.current;
      if (v) {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    };

    return (
      <div
        className="group border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={() => {
          const slug = c.startupName || c.companyName;
          if (slug) navigate(`/company/${encodeURIComponent(slug)}`);
        }}
      >
        {/* Media */}
        <div className="relative w-full pt-[56.25%] bg-gray-100">
          {c.mainCoverPhoto ? (
            <img
              src={c.mainCoverPhoto}
              alt={c.companyName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          )}

          {hasVideo && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              muted
              loop
              playsInline
              preload="none"
              src={c.mainCoverVideo}
            />
          )}

          {/* Watchlist heart - top-right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch(c);
            }}
            className="absolute top-3 right-3 h-10 w-10 grid place-items-center rounded-full bg-white/95 hover:bg-white shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200 hover:scale-110"
            aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-5 w-5 transition-colors ${
                isSaved ? "text-rose-600" : "text-gray-500"
              }`}
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* Avatar overlay - bottom-right */}
          <div className="absolute bottom-3 right-3">
            {avatar ? (
              <img
                src={avatar}
                alt="team"
                className="w-14 h-14 rounded-full ring-4 ring-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg" />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-bold text-lg truncate text-slate-900"
              title={c.companyName}
            >
              {c.companyName}
            </h3>
          </div>
          {c.companyOneLiner && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {c.companyOneLiner}
            </p>
          )}
          {c.location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{c.location}</span>
            </div>
          )}
          {Array.isArray(c.industries) && c.industries.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {c.industries.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Sign in to view your watchlist
          </h2>
          <p className="text-gray-600 mb-6">
            Keep track of companies you're interested in
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50 min-h-screen">
      <div className="bg-gradient-to-br from-rose-50 to-pink-50/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-rose-500 rounded-full"></div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-rose-600">
              Your Picks
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 text-white"
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-4xl sm:text-5xl text-slate-900">
              My Watchlist
            </h1>
            <p className="text-gray-600 mt-2">Companies you're following</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-gray-600 font-medium">
                Loading your watchlist...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg font-medium border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {companies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {companies.map((c) => (
                  <CompanyCard
                    key={c._id || c.startupName || c.companyName}
                    c={c}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Your watchlist is empty
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start building your watchlist by exploring companies and
                  clicking the heart icon on those you're interested in
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Explore Companies
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
