import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createInvestment, getCompany, getInvestments } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

function MediaCarousel({ photo, video, overlayTitle, overlaySubtitle }) {
  const [index, setIndex] = useState(0); // 0=photo, 1=video
  const videoRef = useRef(null);
  const slides = useMemo(() => {
    const arr = [];
    if (photo) arr.push({ type: "photo", src: photo });
    if (video) arr.push({ type: "video", src: video });
    return arr;
  }, [photo, video]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[index]?.type === "video") {
      v.play().catch(() => {
        /* ignore */
      });
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
  }, [index, slides]);

  if (!slides.length)
    return <div className="aspect-video bg-gray-100 rounded-xl" />;

  return (
    <div className="relative">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
        {slides[index].type === "photo" ? (
          <img
            src={slides[index].src}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={slides[index].src}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        )}
        {/* Overlay texts */}
        <div className="absolute inset-x-0 top-0 p-6 sm:p-8 pointer-events-none text-white drop-shadow-lg">
          {overlaySubtitle && (
            <div className="uppercase tracking-[0.15em] text-xs sm:text-sm opacity-90 font-bold bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">
              {overlaySubtitle}
            </div>
          )}
          {overlayTitle && (
            <div className="text-2xl sm:text-3xl font-bold mt-3 leading-tight">
              {overlayTitle}
            </div>
          )}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                i === index ? "bg-blue-600 w-12" : "bg-gray-300 w-8 hover:bg-gray-400"
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyPage() {
  const { companyName } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investments, setInvestments] = useState([]);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  const totalRaised = useMemo(
    () => investments.reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
    [investments]
  );

  // Calculate current user's total investment
  const userInvestment = useMemo(() => {
    if (!user || !investments.length) return 0;
    return investments
      .filter(inv => inv.investorSupaId === user.id || inv.investorEmail === user.email)
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  }, [investments, user]);

  // Get top 5 investors by total amount
  const topInvestors = useMemo(() => {
    if (!investments.length) return [];
    
    // Group by investor
    const investorMap = new Map();
    investments.forEach(inv => {
      const key = inv.investorSupaId || inv.investorEmail || 'anonymous';
      const existing = investorMap.get(key) || { amount: 0, email: inv.investorEmail };
      existing.amount += Number(inv.amount) || 0;
      investorMap.set(key, existing);
    });
    
    // Convert to array and sort
    return Array.from(investorMap.entries())
      .map(([key, data]) => ({
        id: key,
        email: data.email,
        amount: data.amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [investments]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const c = await getCompany({ startupName: companyName });
        if (mounted) setCompany(c);
        const inv = await getInvestments({
          startupName: companyName,
          limit: 500,
        });
        if (mounted) setInvestments(inv);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load company");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [companyName]);

  async function onInvest() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    try {
      await createInvestment({
        startupName: company?.startupName,
        investorSupaId: user?.id,
        investorEmail: user?.email,
        amount: amt,
      });
      const inv = await getInvestments({
        startupName: company?.startupName,
        limit: 500,
      });
      setInvestments(inv);
      setAmount("");
    } catch {
      /* ignore */
    }
  }

  if (loading)
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-600">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="min-h-[60vh] grid place-items-center text-red-600">
        {error}
      </div>
    );
  if (!company) return null;

  return (
    <div className="px-6 sm:px-10 py-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column */}
        <div className="lg:col-span-8">
          <MediaCarousel
            photo={company.mainCoverPhoto}
            video={company.mainCoverVideo}
            overlaySubtitle={`INVEST IN ${company.companyName?.toUpperCase()}`}
            overlayTitle={company.companyOneLiner}
          />

          {/* Social links */}
          <div className="mt-6 flex items-center gap-4 text-blue-600">
            {company.companyWebsite && (
              <a
                href={company.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                Website
              </a>
            )}
            {company.linkedInLink && (
              <a
                href={company.linkedInLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/>
                </svg>
                LinkedIn
              </a>
            )}
            {company.InstagramLink && (
              <a
                href={company.InstagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            )}
            {company.YoutubeLink && (
              <a
                href={company.YoutubeLink}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                YouTube
              </a>
            )}
          </div>

          <hr className="my-6" />

          {/* Tabs */}
          <div className="border-b-2 border-gray-200 flex gap-8 text-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-2 py-4 font-semibold transition-all duration-200 ${
                activeTab === "overview"
                  ? "border-b-4 border-blue-600 text-blue-700 -mb-0.5"
                  : "text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 -mb-0.5"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-2 py-4 font-semibold transition-all duration-200 ${
                activeTab === "team"
                  ? "border-b-4 border-blue-600 text-blue-700 -mb-0.5"
                  : "text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 -mb-0.5"
              }`}
            >
              Team
            </button>
          </div>

          {activeTab === "overview" && (
            <div
              className="prose prose-lg max-w-none mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              dangerouslySetInnerHTML={{
                __html: company.companyDescription || "",
              }}
            />
          )}

          {activeTab === "team" && (
            <div className="mt-6 space-y-6">
              {Array.isArray(company.team) && company.team.length > 0 ? (
                company.team.map((member, idx) => (
                  <div
                    key={`${member.fullName || "member"}-${idx}`}
                    className="bg-white rounded-2xl shadow-md border-2 border-slate-100 p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Picture */}
                      <div className="flex items-start md:w-48">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ring-4 ring-blue-50 shadow-lg">
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={member.fullName || "profile"}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {member.fullName || "Full Name"}
                          </h3>
                          {member.title && (
                            <span className="text-base text-slate-600 font-medium">
                              · {member.title}
                            </span>
                          )}
                          {member.isFounder && (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-2 border-amber-200 font-semibold">
                              ⭐ Founder
                            </span>
                          )}
                        </div>

                        {member.about && (
                          <div className="md:col-span-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                            {member.about}
                          </div>
                        )}

                        {member.linkedInProfile && (
                          <div className="md:col-span-2 mt-2">
                            <a
                              href={member.linkedInProfile}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium text-sm"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/>
                              </svg>
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No team members listed yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Invest panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-6">
            <div className="border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-white shadow-lg">
              <div className="text-4xl font-bold text-blue-600">
                ₹{totalRaised.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-gray-700 mt-2 font-medium">
                raised from <span className="font-bold text-slate-900">{investments.length}+</span> investors
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-xs font-bold tracking-wider uppercase text-gray-500 mb-4">Investment Amount</div>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <span className="text-xl text-gray-700 font-semibold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
              <button
                onClick={onInvest}
                className="mt-5 w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 transition-all duration-200"
              >
                Invest Now
              </button>
            </div>

            {/* Terms placeholder from Investment.js model context */}
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow-lg">
              <div className="font-bold text-lg mb-4 text-slate-900">Investment Terms</div>
              <ul className="text-sm text-gray-700 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-semibold">Round target:</span> {company?.round?.target || "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-semibold">Minimum investment:</span> {company?.round?.minInvest ?? "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-semibold">Round days:</span> {company?.round?.days ?? "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-semibold">Status:</span> <span className={`font-bold ${company?.round?.isLive ? 'text-green-600' : 'text-gray-500'}`}>{company?.round?.isLive ? "🟢 Live" : "Not live"}</span></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
