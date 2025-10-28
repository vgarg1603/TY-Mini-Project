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
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
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
        <div className="absolute inset-x-0 top-0 p-4 sm:p-6 pointer-events-none text-white drop-shadow-md">
          {overlaySubtitle && (
            <div className="uppercase tracking-wide text-sm opacity-90">
              {overlaySubtitle}
            </div>
          )}
          {overlayTitle && (
            <div className="text-xl sm:text-2xl font-semibold">
              {overlayTitle}
            </div>
          )}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`h-2 w-10 rounded-full ${
                i === index ? "bg-blue-600" : "bg-gray-300"
              }`}
              onClick={() => setIndex(i)}
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
  const totalRaised = useMemo(
    () => investments.reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
    [investments]
  );

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
    <div className="px-6 sm:px-10 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8">
          <MediaCarousel
            photo={company.mainCoverPhoto}
            video={company.mainCoverVideo}
            overlaySubtitle={`INVEST IN ${company.companyName?.toUpperCase()}`}
            overlayTitle={company.companyOneLiner}
          />

          {/* Social links */}
          <div className="mt-4 flex items-center gap-3 text-blue-600">
            {company.companyWebsite && (
              <a
                href={company.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Website
              </a>
            )}
            {company.linkedInLink && (
              <a
                href={company.linkedInLink}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                LinkedIn
              </a>
            )}
            {company.InstagramLink && (
              <a
                href={company.InstagramLink}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
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

          {/* Overview tab (single for now) */}
          <div className="border-b flex gap-6 text-sm">
            <button className="px-1 py-3 border-b-2 border-blue-600 text-blue-700 font-medium">
              Overview
            </button>
          </div>
          <div
            className="prose max-w-none mt-4"
            dangerouslySetInnerHTML={{
              __html: company.companyDescription || "",
            }}
          />
        </div>

        {/* Right column - Invest panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="text-3xl font-semibold">
                ₹{totalRaised.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-gray-600">
                raised from {investments.length}+ investors
              </div>
            </div>

            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-700 mb-2">INVEST</div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                  placeholder="0"
                  min="0"
                />
              </div>
              <button
                onClick={onInvest}
                className="mt-3 w-full bg-rose-600 hover:bg-rose-700 text-white rounded py-2 font-medium"
              >
                Invest
              </button>
            </div>

            {/* Terms placeholder from Investment.js model context */}
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="font-medium mb-2">Investment Terms</div>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Round target: {company?.round?.target || "—"}</li>
                <li>Minimum investment: {company?.round?.minInvest ?? "—"}</li>
                <li>Round days: {company?.round?.days ?? "—"}</li>
                <li>Status: {company?.round?.isLive ? "Live" : "Not live"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
