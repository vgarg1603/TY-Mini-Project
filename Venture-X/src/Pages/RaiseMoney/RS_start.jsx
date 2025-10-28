import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import {
  getRaiseStart,
  saveRaiseStart,
  getRaiseMoneyRedirect,
} from "../../lib/api.js";

const RS_start = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Industry options and query for searchable multi-select
  const INDUSTRY_OPTIONS = useMemo(
    () => [
      "Technology",
      "Financials",
      "Healthcare",
      "Industrials",
      "Retail",
      "Energy",
      "Utilities",
      "Materials",
      "Communication",
      "Clean Tech",
      "Agriculture",
      "Construction",
      "Education",
      "Hospitality",
      "Consulting",
      "Automotive",
      "Aerospace",
      "Biotech",
      "Mining",
      "Textiles",
      "Logistics",
      "Insurance",
      "Media",
      "Gaming",
      "Leisure",
      "ECommerce",
      "Chemicals",
      "Pharmaceuticals",
      "Defense",
      "Wholesale",
      "FoodService",
      "Cybersecurity",
      "FinTech",
      "Apparel",
      "Publishing",
      "Legal",
      "Maintenance",
      "Security",
      "HR",
      "Engineering",
      "Architecture",
      "Nonprofit",
      "Sports",
      "Government",
      "VentureCapital",
      "Other",
    ],
    []
  );
  const [industryQuery, setIndustryQuery] = useState("");

  const steps = useMemo(
    () => [
      {
        key: "basics",
        title: "Let's start with the basics",
        render: (state, setState) => (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Your company name"
                value={state.companyName}
                onChange={(e) =>
                  setState((s) => ({ ...s, companyName: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 px-4 py-3 outline-none placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Website (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔗
                </span>
                <input
                  type="url"
                  placeholder="https://"
                  value={state.website}
                  onChange={(e) =>
                    setState((s) => ({ ...s, website: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 pl-10 pr-4 py-3 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Location
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  📍
                </span>
                <input
                  type="text"
                  placeholder="Search your city"
                  value={state.location}
                  onChange={(e) =>
                    setState((s) => ({ ...s, location: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 pl-10 pr-4 py-3 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Industry multi-select */}
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Company Industry domain
              </label>
              {/* Selected chips */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(state.industries || []).map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {ind}
                    <button
                      type="button"
                      aria-label={`Remove ${ind}`}
                      className="text-gray-500 hover:text-black"
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          industries: (s.industries || []).filter(
                            (x) => x !== ind
                          ),
                          otherIndustry: ind === "Other" ? "" : s.otherIndustry,
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {/* Search input */}
              <input
                type="text"
                value={industryQuery}
                onChange={(e) => setIndustryQuery(e.target.value)}
                placeholder="Type to search and select industries"
                className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 px-4 py-3 outline-none placeholder:text-gray-400"
              />
              {/* Suggestions */}
              <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
                {(() => {
                  const q = (industryQuery || "").trim().toLowerCase();
                  const base = INDUSTRY_OPTIONS.filter((opt) =>
                    opt.toLowerCase().includes(q)
                  );
                  const hasMatches = base.length > 0;
                  const list = hasMatches
                    ? base.slice(0, 5)
                    : q
                    ? [industryQuery]
                    : ["Other"];
                  const selected = new Set(state.industries || []);
                  return list.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={selected.has(opt)}
                      onClick={() => {
                        setState((s) => {
                          const current = new Set(s.industries || []);
                          if (current.has("Other") && opt !== "Other") {
                            current.delete("Other");
                          }
                          current.add(opt);
                          return {
                            ...s,
                            industries: Array.from(current),
                            otherIndustry:
                              opt === "Other" ? s.otherIndustry : "",
                          };
                        });
                        setIndustryQuery("");
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selected.has(opt) ? "bg-gray-100" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ));
                })()}
              </div>

              {/* Other text when 'Other' selected */}
              {(state.industries || []).includes("Other") && (
                <div className="mt-3">
                  <label className="block text-gray-800 font-medium mb-2">
                    Please specify (for 'Other')
                  </label>
                  <input
                    type="text"
                    value={state.otherIndustry || ""}
                    onChange={(e) =>
                      setState((s) => ({ ...s, otherIndustry: e.target.value }))
                    }
                    placeholder="e.g., PropTech, AgriTech, Clean Energy, etc."
                    className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 px-4 py-3 outline-none placeholder:text-gray-400"
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Tip: You can select multiple industries. At least one is
                required.
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "oneliner",
        title: "What's your one-liner?",
        render: (state, setState) => (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Describe your company in 3 to 7 words
              </label>
              <input
                type="text"
                placeholder="Your company one-liner"
                value={state.oneLiner}
                onChange={(e) =>
                  setState((s) => ({ ...s, oneLiner: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 px-4 py-3 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">Examples:</p>
              <p>Flying cars. Seriously.</p>
              <p>Oakland's first cidery.</p>
              <p>WiFi for astronauts.</p>
              <p>Making gardening ridiculously easy.</p>
              <p>Book rooms with locals rather than hotels.</p>
            </div>
          </div>
        ),
      },
      {
        key: "raise",
        title: "How much do you want to raise?",
        render: (state, setState) => (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                How much have you already raised?
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={state.alreadyRaised}
                  onChange={(e) =>
                    setState((s) => ({ ...s, alreadyRaised: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 pl-7 pr-4 py-3 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                How much more do you want to raise?
              </label>
              <input
                type="text"
                placeholder="An estimate is fine"
                value={state.raiseMore}
                onChange={(e) =>
                  setState((s) => ({ ...s, raiseMore: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 focus:border-black focus:ring-0 px-4 py-3 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        ),
      },
    ],
    [industryQuery, INDUSTRY_OPTIONS]
  );

  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState({
    companyName: "",
    website: "",
    location: "",
    oneLiner: "",
    alreadyRaised: "",
    raiseMore: "",
    industries: [], // array of strings from INDUSTRY_OPTIONS
  });
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hydrate from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const company = await getRaiseStart(user.id);
        if (!mounted) return;
        if (company) {
          // Map backend -> UI state
          const industries = Array.isArray(company.industries)
            ? company.industries
            : [];
          // Split recognized vs unknown for 'Other'
          const recognized = industries.filter((i) =>
            INDUSTRY_OPTIONS.includes(i)
          );
          const unknowns = industries.filter(
            (i) => !INDUSTRY_OPTIONS.includes(i)
          );
          const otherIndustry = unknowns[0] || "";
          const uiIndustries = [...recognized];
          if (otherIndustry) uiIndustries.push("Other");

          setFormState({
            companyName: company.companyName || "",
            website: company.companyWebsite || "",
            location: company.location || "",
            oneLiner: company.companyOneLiner || "",
            alreadyRaised:
              company?.raise?.already !== undefined &&
              company?.raise?.already !== null
                ? String(company.raise.already)
                : "",
            raiseMore:
              company?.raise?.want !== undefined &&
              company?.raise?.want !== null
                ? String(company.raise.want)
                : "",
            industries: uiIndustries,
            otherIndustry,
          });
          setLastSavedAt(new Date());
        }
      } catch {
        // ignore fetch errors for first load
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Validation helpers
  const isValidURL = (url) => /^https?:\/\/[^\s]+$/i.test(url);
  const wordCount = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;
  const isNumber = (v) => v !== "" && !Number.isNaN(Number(v));

  const stepValid = useMemo(() => {
    if (step === 0) {
      const hasBasics =
        (formState.companyName || "").trim().length >= 2 &&
        ((formState.website || "").trim() === "" ||
          isValidURL(formState.website || "")) &&
        (formState.location || "").trim().length >= 2;
      const hasIndustries =
        Array.isArray(formState.industries) && formState.industries.length > 0;
      const needsOtherSpec = (formState.industries || []).includes("Other");
      const hasOtherSpec = (formState.otherIndustry || "").trim().length > 0;
      return hasBasics && hasIndustries && (!needsOtherSpec || hasOtherSpec);
    }
    if (step === 1) {
      const wc = wordCount(formState.oneLiner);
      return wc >= 3 && wc <= 7;
    }
    if (step === 2) {
      return isNumber(formState.alreadyRaised) && isNumber(formState.raiseMore);
    }
    return true;
  }, [step, formState]);

  const progress = ((step + 1) / steps.length) * 100;

  // Prepare payload for backend
  const buildPayload = () => {
    const { companyName, website, location, oneLiner, industries } = formState;
    // Transform industries: replace 'Other' with specified text if available
    let inds = Array.isArray(industries) ? [...industries] : [];
    if (inds.includes("Other")) {
      const idx = inds.indexOf("Other");
      const other = (formState.otherIndustry || "").trim();
      inds.splice(idx, 1, other || "Other");
    }

    const payload = {
      userSupaId: user?.id,
      companyName,
      companyWebsite: website,
      location,
      industries: inds,
      companyOneLiner: oneLiner,
    };
    // numeric fields
    const already = Number(formState.alreadyRaised);
    const want = Number(formState.raiseMore);
    payload.raise = {
      already: Number.isNaN(already) ? undefined : already,
      want: Number.isNaN(want) ? undefined : want,
    };
    return payload;
  };

  // Debounced autosave when form changes
  useEffect(() => {
    if (!user?.id) return;
    // Don't autosave while initial load still pending to avoid overwriting
    if (loading) return;
    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        await saveRaiseStart(buildPayload());
        setLastSavedAt(new Date());
      } catch {
        // ignore transient autosave errors
      } finally {
        setSaving(false);
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, user?.id, loading]);

  const next = async () => {
    if (!stepValid) return;
    // Persist before navigating
    if (user?.id) {
      try {
        setSaving(true);
        await saveRaiseStart(buildPayload());
        setLastSavedAt(new Date());
      } catch {
        // proceed even if save fails
      } finally {
        setSaving(false);
      }
    }
    if (step < steps.length - 1) setStep((s) => s + 1);
    else {
      // After finishing step 3, go to /raise_money/:startupName/overview
      try {
        const path = await getRaiseMoneyRedirect({ supabaseId: user.id });
        navigate(path);
      } catch {
        // Fallback if redirect fails
        navigate("/raise_money/start");
      }
    }
  };
  const back = async () => {
    // Persist before going back too
    if (user?.id) {
      try {
        setSaving(true);
        await saveRaiseStart(buildPayload());
        setLastSavedAt(new Date());
      } catch {
        // ignore
      } finally {
        setSaving(false);
      }
    }
    if (step > 0) setStep((s) => s - 1);
  };

  const Current = steps[step];

  return (
    <div className="w-full min-h-screen h-[100svh]">
      <div className="m-0 p-0">
        <div className="grid grid-rows-[1fr_auto] min-h-screen h-[100svh] overflow-hidden shadow-sm">
          {/* Content area (row 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
            {/* Left panel */}
            <div className="bg-black text-white p-8 md:p-12 flex items-center md:h-full">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {Current.title}
              </h2>
            </div>
            {/* Right panel */}
            <div className="bg-white p-6 md:p-10 md:h-full">
              <div className="max-w-xl mx-auto">
                {loading ? (
                  <div className="min-h-[30vh] grid place-items-center text-gray-600 text-sm">
                    Loading...
                  </div>
                ) : (
                  <>
                    {Current.render(formState, setFormState)}
                    {/* Inline validation messages */}
                    {step === 0 && (
                      <div className="mt-4 text-sm text-red-600 space-y-1">
                        {(formState.companyName || "").trim().length < 2 && (
                          <p>Company name is required (min 2 characters).</p>
                        )}
                        {(formState.website || "").trim() !== "" &&
                          !isValidURL(formState.website || "") && (
                            <p>
                              Enter a valid website starting with http:// or
                              https://
                            </p>
                          )}
                        {(formState.location || "").trim().length < 2 && (
                          <p>Location is required.</p>
                        )}
                        {(!Array.isArray(formState.industries) ||
                          formState.industries.length === 0) && (
                          <p>Select at least one industry.</p>
                        )}
                      </div>
                    )}
                    {step === 1 && (
                      <div className="mt-4 text-sm text-red-600">
                        {!(
                          wordCount(formState.oneLiner) >= 3 &&
                          wordCount(formState.oneLiner) <= 7
                        ) && <p>One-liner should be 3 to 7 words.</p>}
                      </div>
                    )}
                    {step === 2 && (
                      <div className="mt-4 text-sm text-red-600 space-y-1">
                        {!isNumber(formState.alreadyRaised) && (
                          <p>
                            Enter how much you have already raised (number).
                          </p>
                        )}
                        {!isNumber(formState.raiseMore) && (
                          <p>Enter how much more you want to raise (number).</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Bottom bar pinned (row 2) */}
          <div className="bg-white">
            <div className="relative px-6 md:px-10 py-4 flex items-center justify-between">
              <button
                onClick={back}
                disabled={step === 0}
                className={`text-sm underline ${
                  step === 0 ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                Back
              </button>
              <span className="text-sm text-gray-600">
                {step + 1} / {steps.length}
              </span>
              <button
                onClick={next}
                disabled={!stepValid || saving}
                className={`rounded-md px-4 py-2 text-white ${
                  stepValid && !saving
                    ? "bg-black"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {step === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
            <div className="px-6 md:px-10 pb-4">
              <div className="h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-black rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-end">
                <span className="text-xs text-gray-500">
                  {saving
                    ? "Saving..."
                    : lastSavedAt
                    ? `Saved ${lastSavedAt.toLocaleTimeString()}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RS_start;
