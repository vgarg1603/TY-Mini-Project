import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";

// Simple utility components used on this page
const Stat = ({ label, value, helper }) => (
  <div className="flex flex-col">
    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
      {value}
    </span>
    {helper && (
      <span className="text-slate-500 text-sm" aria-live="polite">
        {helper}
      </span>
    )}
    {label && <span className="sr-only">{label}</span>}
  </div>
);

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
    {children}
  </span>
);

const CompanyPage = () => {
  const { companyName } = useParams();
  const [termsOpen, setTermsOpen] = useState(false);

  const [company, setCompany] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // For now we query by slug using existing raise_money start endpoint fallback (would be better to add dedicated endpoint)
        // This assumes slug stored in startupName field.
        const { data } = await api.get("/api/raise_money/start", {
          params: { userSupaId: companyName }, // fallback if you later adapt to fetch by slug change here
        });
        if (!mounted) return;
        // The above is not actually correct for public view by slug. TODO: create /api/company/by-slug/:startupName
        // Mock fallback while proper endpoint not yet built.
        const fallback = {
          title: companyName?.replaceAll("-", " ") || "Untitled Company",
          slug: companyName,
          coverImage:
            data?.company?.mainCoverPhoto ||
            "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1470&auto=format&fit=crop",
          raised: 0,
          investorsText: "raised so far",
          minInvestment: 100,
          website: data?.company?.companyWebsite || "",
          websiteUrl: data?.company?.companyWebsite || "",
          location: data?.company?.location || "",
          founded: new Date().getFullYear(),
          tags: data?.company?.industries || [],
          terms: { type: "Future Equity", note: "$10M valuation cap" },
          companyDescription: data?.company?.companyDescription || "",
        };
        setCompany(fallback);
      } catch (e) {
        console.error("Failed to load company", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [companyName]);

  const currency = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Intro heading */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Invest in {company?.slug?.replaceAll("-", " ") || "this company"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Left/main content */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                {company?.title || "Loading..."}
              </h1>

              {/* Media */}
              <div className="mt-6">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={company?.coverImage}
                    alt="Company cover"
                    className="w-full h-auto object-cover aspect-[16/9]"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Info row */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Website
                    </p>
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-slate-900 hover:text-blue-600 font-medium"
                    >
                      {company?.website}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Location
                    </p>
                    <p className="mt-1 text-slate-900 font-medium">
                      {company?.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Founded
                    </p>
                    <p className="mt-1 text-slate-900 font-medium">
                      {company?.founded}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(company?.tags || []).map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sticky top-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1">
                🍀 FIRST GOAL HIT{" "}
                <span className="hidden sm:inline">(You can still invest)</span>
              </div>

              <div className="mt-4">
                <Stat
                  value={currency(company?.raised || 0)}
                  helper={company?.investorsText}
                />
              </div>

              {/* Invest form */}
              <div className="mt-6">
                <p className="text-xs text-slate-500 font-medium">
                  INVEST{" "}
                  <span className="ml-1">min ${company?.minInvestment}</span>
                </p>
                <div className="mt-2 flex">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 select-none">
                      $
                    </span>
                    <input
                      type="number"
                      min={company?.minInvestment}
                      placeholder="0"
                      className="w-full rounded-l-lg border border-slate-300 pl-7 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <button className="rounded-r-lg bg-rose-500 text-white px-5 py-2 font-semibold hover:bg-rose-600">
                    INVEST
                  </button>
                </div>

                <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  ♥ WATCH FOR UPDATES
                </button>
              </div>

              {/* Investment terms */}
              <div className="mt-6 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-900"
                  onClick={() => setTermsOpen((v) => !v)}
                  aria-expanded={termsOpen}
                >
                  <span>INVESTMENT TERMS</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform ${
                      termsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div
                  className={`${termsOpen ? "block" : "hidden"} mt-3 text-sm`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {company?.terms?.type}
                    </span>
                    <span className="font-medium text-slate-900">
                      {company?.terms?.note}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        {/* Description Section */}
        {company?.companyDescription && (
          <div className="mt-8 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 prose max-w-none">
            <div
              className="company-description"
              dangerouslySetInnerHTML={{ __html: company.companyDescription }}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default CompanyPage;
