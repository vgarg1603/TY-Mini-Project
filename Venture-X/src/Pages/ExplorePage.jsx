import React, { useEffect, useRef, useState } from "react";
import { getCompanies, getWatchlist, toggleWatchlist } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const ExplorePage = () => {
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedCompanyIds, setSavedCompanyIds] = useState(new Set());

  const industries = [
    { name: "Technology", icon: "💻" },
    { name: "Pets", icon: "🐾" },
    { name: "Sports Tech", icon: "🏅" },
    { name: "Gaming", icon: "🕹️" },
    { name: "Healthcare", icon: "🧬" },
    { name: "Blockchain & Web3", icon: "⛓️" },
    { name: "Science & R&D", icon: "🔬" },
    { name: "Sports", icon: "⚽" },
    { name: "Subscription", icon: "🔁" },
    { name: "Service", icon: "🧰" },
    { name: "Childcare", icon: "🧒" },
    { name: "Food & Beverage", icon: "🍽️" },
    { name: "Clean Tech", icon: "🌿" },
    { name: "Climate Change", icon: "🌍" },
    { name: "Brick & Mortar", icon: "🧱" },
    { name: "Recreation", icon: "🎯" },
    { name: "Distillery & Vineyards", icon: "🍷" },
    { name: "Events & Festivals", icon: "🎪" },
    { name: "Restaurant", icon: "🍜" },
    { name: "Music", icon: "🎵" },
    { name: "Film", icon: "🎬" },
  ];

  const updateScrollable = () => {
    const el = scrollRef.current;
    if (!el) return;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    // Only show left arrow when scrolled significantly past the leftmost element
    const canLeft = el.scrollLeft > 10; // Small threshold to account for rounding
    setCanScrollRight(canRight);
    setCanScrollLeft(canLeft);
  };

  useEffect(() => {
    updateScrollable();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollable();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollable);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollable);
    };
  }, []);

  // Load watchlist when user changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) {
        setSavedCompanyIds(new Set());
        return;
      }
      try {
        const { companyIds } = await getWatchlist({
          supabaseId: user.id,
          email: user.email,
        });
        if (mounted) setSavedCompanyIds(new Set(companyIds || []));
      } catch {
        // non-blocking
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Fetch companies when selectedIndustry changes
  useEffect(() => {
    let isMounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const { items } = await getCompanies({
          industry: selectedIndustry || undefined,
          limit: 24,
        });
        if (isMounted) setCompanies(items || []);
      } catch (err) {
        if (isMounted) setError(err?.message || "Failed to load companies");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    run();
    return () => {
      isMounted = false;
    };
  }, [selectedIndustry]);

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: -amount, behavior: "smooth" });
  };

  async function onToggleWatch(c) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const id = String(c._id || c.id);
    const next = new Set(savedCompanyIds);
    const isSaved = next.has(id);
    if (isSaved) next.delete(id);
    else next.add(id);
    setSavedCompanyIds(next);
    try {
      await toggleWatchlist({
        supabaseId: user.id,
        email: user.email,
        companyId: id,
      });
    } catch {
      // revert on failure
      const revert = new Set(savedCompanyIds);
      setSavedCompanyIds(revert);
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
          if (slug)
            window.location.href = `/company/${encodeURIComponent(slug)}`;
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
            <div className="absolute inset-0 bg-gray-100" />
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

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-blue-600">
              Founders
            </h2>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <h1 className="font-semibold tracking-tight text-4xl sm:text-5xl text-slate-900">
          Invest in founders building the future
        </h1>

        {/* Industries scroller */}
        <div className="relative mt-10">
          {canScrollLeft && (
            <button
              type="button"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 shadow-lg rounded-full p-3 hover:bg-gray-50 hover:border-blue-500 hover:shadow-xl transition-all duration-200 z-10"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M14.71 6.71a1 1 0 00-1.42 0l-4 4a1 1 0 000 1.42l4 4a1 1 0 101.42-1.42L11.41 12l3.3-3.88a1 1 0 000-1.41z" />
              </svg>
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-hidden pb-6 pr-12 pl-12"
          >
            {/* Add an "All" filter */}
            <button
              key="__all__"
              className={`flex flex-col items-center justify-center min-w-[70px] w-24 select-none group`}
              type="button"
              onClick={() => setSelectedIndustry(null)}
            >
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 bg-white text-base shadow-md transition-all duration-200 ${
                  !selectedIndustry
                    ? "border-blue-500 ring-4 ring-blue-100 scale-105"
                    : "border-gray-300 hover:border-gray-400 hover:shadow-lg"
                }`}
              >
                <span className="text-sm font-semibold">All</span>
              </div>
              <div className="mt-3 text-center text-xs text-gray-700 leading-tight font-medium">
                All
              </div>
            </button>

            {industries.map((item) => (
              <button
                key={item.name}
                className="flex flex-col items-center justify-center min-w-[70px] w-24 select-none group"
                type="button"
                onClick={() => setSelectedIndustry(item.name)}
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-3xl shadow-md border-2 transition-all duration-200 ${
                    selectedIndustry === item.name
                      ? "border-blue-500 ring-4 ring-blue-100 scale-105"
                      : "border-gray-300 hover:border-gray-400 hover:shadow-lg"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                </div>
                <div className="mt-3 text-center text-xs text-gray-700 leading-tight font-medium">
                  {item.name}
                </div>
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 shadow-lg rounded-full p-3 hover:bg-gray-50 hover:border-blue-500 hover:shadow-xl transition-all duration-200 z-10"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M9.29 6.71a1 1 0 011.42 0l4 4a1 1 0 010 1.42l-4 4a1 1 0 11-1.42-1.42L12.59 12 9.29 8.12a1 1 0 010-1.41z" />
              </svg>
            </button>
          )}
        </div>

        <div className="my-12">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-3xl font-semibold text-slate-900">
              Raising Now
              {selectedIndustry ? (
                <span className="text-blue-600"> · {selectedIndustry}</span>
              ) : (
                ""
              )}
            </h2>
            {loading && (
              <span className="text-sm text-gray-500 animate-pulse">
                Loading…
              </span>
            )}
          </div>
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {companies.map((c) => (
                <CompanyCard
                  key={c._id || c.startupName || c.companyName}
                  c={c}
                />
              ))}
              {!companies.length && (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="text-lg font-medium">No companies found</p>
                  <p className="text-sm mt-1">
                    Try selecting a different industry
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
