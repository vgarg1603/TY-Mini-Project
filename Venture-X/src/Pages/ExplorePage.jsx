import React, { useEffect, useRef, useState } from "react";
import { getCompanies, getWatchlist, toggleWatchlist } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const ExplorePage = () => {
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const [canScrollRight, setCanScrollRight] = useState(false);
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
    setCanScrollRight(canRight);
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
        className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition cursor-pointer"
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
            className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow border border-gray-200"
            aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${
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
          <div className="absolute bottom-2 right-2">
            {avatar ? (
              <img
                src={avatar}
                alt="team"
                className="w-12 h-12 rounded-full ring-2 ring-white object-cover shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 ring-2 ring-white" />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold truncate" title={c.companyName}>
              {c.companyName}
            </div>
          </div>
          {c.companyOneLiner && (
            <div className="mt-1 text-sm text-gray-600 line-clamp-2">
              {c.companyOneLiner}
            </div>
          )}
          {Array.isArray(c.industries) && c.industries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {c.industries.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
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
    <div>
      <div>
        <div className="py-6 px-20 bg-blue-50 font-medium">Founders</div>
        <div className="border-2 border-blue-500 w-fit px-12 mx-16"></div>
      </div>
      <div className="px-20 py-10">
        <span className="font-normal font-stretch-120% text-4xl">
          Invest in founders building the future
        </span>

        {/* Industries scroller */}
        <div className="relative mt-8">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden pb-4 pr-10"
          >
            {/* Add an "All" filter */}
            <button
              key="__all__"
              className={`flex flex-col items-center justify-center min-w-[60px] w-20 select-none ${
                !selectedIndustry ? "" : ""
              }`}
              type="button"
              onClick={() => setSelectedIndustry(null)}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border bg-white text-base shadow-sm ${
                  !selectedIndustry
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <span className="text-sm">All</span>
              </div>
              <div className="mt-2 text-center text-xs text-gray-700 leading-tight">
                All
              </div>
            </button>

            {industries.map((item) => (
              <button
                key={item.name}
                className="flex flex-col items-center justify-center min-w-[60px] w-20 select-none"
                type="button"
                onClick={() => setSelectedIndustry(item.name)}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-white text-3xl shadow-sm border ${
                    selectedIndustry === item.name
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                </div>
                <div className="mt-2 text-center text-xs text-gray-700 leading-tight">
                  {item.name}
                </div>
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-md rounded-full p-2 hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M9.29 6.71a1 1 0 011.42 0l4 4a1 1 0 010 1.42l-4 4a1 1 0 11-1.42-1.42L12.59 12 9.29 8.12a1 1 0 010-1.41z" />
              </svg>
            </button>
          )}
        </div>

        <div className="my-10">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl ">
              Raising Now{selectedIndustry ? ` · ${selectedIndustry}` : ""}
            </span>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {companies.map((c) => (
                <CompanyCard
                  key={c._id || c.startupName || c.companyName}
                  c={c}
                />
              ))}
              {!companies.length && (
                <div className="col-span-full text-sm text-gray-500">
                  No companies found.
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
