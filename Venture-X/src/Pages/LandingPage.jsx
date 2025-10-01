import { useState } from "react";

// Small helpers
const formatCurrency0 = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const Stat = ({ value, label, accent = false }) => (
  <div className="text-center">
    <div
      className={
        "text-4xl sm:text-5xl font-semibold tracking-tight " +
        (accent ? "text-blue-600" : "text-slate-900")
      }
    >
      {value}
    </div>
    <div className="mt-2 text-slate-500 text-sm sm:text-base">{label}</div>
  </div>
);

const CompanyCard = ({
  name,
  invested,
  investors,
  gradient,
  placeholder = false,
}) => (
  <div className="rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
    <div
      className={`h-32 flex items-center justify-center text-white text-xl font-semibold bg-gradient-to-br ${gradient}`}
    >
      {placeholder ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-slate-500"
        >
          <path d="M7.5 8.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" />
          <path d="M3 20.25a8.25 8.25 0 1 1 16.5 0V21H3v-.75Z" />
        </svg>
      ) : (
        <span className="drop-shadow-sm">{name}</span>
      )}
    </div>
    <div className="p-4 grid grid-cols-2 gap-2 text-sm">
      <div>
        <div className="font-semibold">{formatCurrency0(invested)}</div>
        <div className="text-slate-500">invested</div>
      </div>
      <div>
        <div className="font-semibold">{investors.toLocaleString()}</div>
        <div className="text-slate-500">investors</div>
      </div>
      <div className="col-span-2 text-[11px] text-slate-400">
        a16z co-invested
      </div>
    </div>
  </div>
);

const FAQItem = ({ q, a, isOpen, onClick }) => (
  <div className="border-b border-slate-200">
    <button
      className="w-full flex items-center justify-between py-4 text-left"
      onClick={onClick}
    >
      <span className="text-slate-900 font-medium">{q}</span>
      <svg
        className={`w-5 h-5 text-slate-500 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </button>
    {isOpen && <p className="pb-4 text-slate-600 text-sm leading-6">{a}</p>}
  </div>
);

const LandingPage = () => {
  const [openIdx, setOpenIdx] = useState(-1);

  const companies = [
    {
      name: "≡ substack",
      invested: 7809219,
      investors: 6688,
      gradient: "from-sky-400 to-indigo-500",
    },
    {
      name: "",
      invested: 4999989,
      investors: 1440,
      gradient: "from-slate-100 to-slate-100",
      placeholder: true,
    },
    {
      name: "curlmix",
      invested: 4537310,
      investors: 6948,
      gradient: "from-emerald-300 to-teal-400",
    },
    {
      name: "🏛 MERCURY",
      invested: 4914037,
      investors: 2453,
      gradient: "from-amber-300 to-yellow-400",
    },
  ];

  const faqs = [
    {
      q: "Any tips for a first-time investor on VentureX?",
      a: "Start small, diversify across multiple startups, and invest only what you can afford to hold long term. Read each company’s materials carefully before committing.",
    },
    {
      q: "Where does my money go after I invest?",
      a: "Your funds are held by a registered escrow agent until a campaign closes successfully. If it doesn’t close, your money is returned.",
    },
    {
      q: "How do I know the worth of my investment?",
      a: "Early-stage investments are illiquid and the value can be volatile. We provide periodic updates from founders, but there’s no public market price.",
    },
    {
      q: "How long before I see a return?",
      a: "These are long-term investments. Liquidity events (acquisitions, dividends, or secondary sales) may take years and are not guaranteed.",
    },
  ];

  const ideaChips = [
    "🐕 A cure for cancer in dogs",
    "✏️ Increasing media literacy",
    "🛒 A community-owned supermarket",
    "🧑‍💻 A coding platform for all",
    "🌱 Edible, compostable cups",
    "🍶 Artisanal Korean Rice Wines made in Brooklyn",
    "✍️ Vaccine distribution at scale",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 sm:py-20">
            {/* Left copy */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900">
                Invest in
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                  founders
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-blue-500 to-pink-400 bg-clip-text text-transparent">
                  building the future
                </span>
              </h1>
              <p className="mt-6 text-slate-600 text-base sm:text-lg leading-7 max-w-xl">
                Get equity and front row seats to the startups and small
                businesses you love—for as little as $100.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Join VentureX
                </a>
                <a
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-md px-5 py-3 border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50"
                >
                  Explore Startups
                </a>
              </div>
            </div>

            {/* Right cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {companies.map((c, idx) => (
                <CompanyCard key={idx} {...c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats + chips */}
      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs tracking-widest text-slate-500 font-medium">
            JOIN OVER 1 MILLION INVESTORS
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
            <Stat value="$250" label="median investment" />
            <Stat value="3,774" label="founders funded" />
            <Stat value="$965M" label="raised on VentureX" accent />
          </div>

          {/* Chips */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {ideaChips.map((chip, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 divide-y divide-slate-200 border-y">
            {faqs.map((f, i) => (
              <FAQItem
                key={i}
                q={f.q}
                a={f.a}
                isOpen={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-6 py-3 text-sm font-medium hover:bg-slate-800"
            >
              More Investor FAQs
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            <div>
              <h3 className="text-slate-100 text-sm font-semibold tracking-wide">
                COMPANY
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="hover:text-white" href="#">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Press
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-100 text-sm font-semibold tracking-wide">
                INVESTORS
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="hover:text-white" href="#">
                    Why Invest
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    How It Works
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Risks
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-100 text-sm font-semibold tracking-wide">
                FOUNDERS
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="hover:text-white" href="#">
                    Raise Capital
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Resources
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Apply
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-100 text-sm font-semibold tracking-wide">
                LEGAL
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="hover:text-white" href="#">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Risk Disclosures
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Form CRS
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
