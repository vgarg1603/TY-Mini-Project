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
        "text-5xl sm:text-6xl font-bold tracking-tight " +
        (accent ? "text-blue-600" : "text-slate-900")
      }
    >
      {value}
    </div>
    <div className="mt-3 text-slate-600 text-sm sm:text-base font-medium uppercase tracking-wide">{label}</div>
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
  <div className="border-b border-slate-200 last:border-b-0">
    <button
      className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-slate-50 transition-colors duration-150"
      onClick={onClick}
    >
      <span className="text-slate-900 font-semibold text-base pr-4">{q}</span>
      <svg
        className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
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
    {isOpen && <p className="pb-6 px-6 text-slate-600 text-sm leading-7">{a}</p>}
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
  // Restored idea chips (was previously removed by edits)
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
    <div className="min-h-screen ">
      {/* Hero */}
      <section className="relative bg-landing-hero overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center pb-20 sm:pb-24">
            {/* Left copy */}
            <div className="font-sans font-light pt-20 sm:pt-24">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 leading-tight">
                Invest in{" "}
                <span className="bg-gradient-to-r from-[#68BBF1] to-[#88AEF0] bg-clip-text text-transparent">
                  founders
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#C5D4F5] via-[#CAA1BF] to-[#F69B79] bg-clip-text text-transparent">
                  building the future
                </span>
              </h1>
              <p className="mt-8 text-slate-600 text-lg sm:text-xl leading-relaxed max-w-xl">
                Get equity and front row seats to the startups and small
                businesses you love—for as little as ₹100.
              </p>

              <div className="mt-10 flex items-center gap-4 flex-wrap">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Join VentureX
                </a>
                <a
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-xl px-8 py-4 border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Explore Startups
                </a>
              </div>
            </div>

            {/* Right animated marquee */}
            <AnimatedCompanyMarquee companies={companies} />
          </div>
        </div>
      </section>

      {/* Stats + chips */}
      <section className="bg-slate-50 py-16 sm:py-20 text-5xl bg-landing-subHero">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <p className="text-center text-xs tracking-[0.2em] text-slate-500 font-semibold uppercase">
            Join Over 1 Million Investors
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-12">
            <Stat value="$250" label="median investment" />
            <Stat value="3,774" label="founders funded" />
            <Stat value="$965M" label="raised on VentureX" accent />
          </div>

          {/* Chips */}
          <div className="mt-16 flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {ideaChips.map((chip, i) => (
              <span
                key={i}
                className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <h2 className="text-center text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200 bg-white rounded-xl shadow-sm">
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

          <div className="mt-12 flex justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-8 py-4 text-sm font-semibold hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              More Investor FAQs
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-landing-subHero text-black pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            <div>
              <h3 className="text-black text-sm font-semibold tracking-wide">
                COMPANY
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="" href="#">
                    About
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Press
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-black text-sm font-semibold tracking-wide">
                INVESTORS
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="" href="#">
                    Why Invest
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    How It Works
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Risks
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-black text-sm font-semibold tracking-wide">
                FOUNDERS
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="" href="#">
                    Raise Capital
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Resources
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Apply
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-black text-sm font-semibold tracking-wide">
                LEGAL
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="" href="#">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="" href="#">
                    Risk Disclosures
                  </a>
                </li>
                <li>
                  <a className="" href="#">
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

// Animated marquee component: two vertical lanes moving in opposite directions with tilt & fade
function AnimatedCompanyMarquee({ companies = [] }) {
  // Duplicate list so animation loops seamlessly (translate 0 -> -50%)
  const loop = [...companies, ...companies];

  const CardMini = ({ c }) => (
    <div className="rounded-2xl  vx-card-glow ring-1 ring-black/5 w-72 md:w-80 lg:w-[24rem] mb-6 shadow-sm">
      <div
        className={`h-56 md:h-60 flex items-center justify-center text-white text-base font-semibold bg-gradient-to-br ${c.gradient} mb-2`}
      >
      </div>
      <div className="px-4 bg-white pb-4 pt-3 text-[12px] text-slate-600 space-y-1 rounded-2xl">

      </div>
    </div>
  );

  return (
    <div
      className="h-[560px] sm:flex hidden justify-center gap-10"
      aria-hidden="true"
    >
      {/* Lane 1 (scroll up) */}
      <div className="vx-lane-viewport vx-fade-vertical w-72 md:w-80 lg:w-[24rem] vx-marquee-paused">
        <div className="px-2">
          <div className="vx-tilt will-change-transform">
            <div className="vx-marquee-up">
              {loop.map((c, i) => (
                <CardMini key={"up-" + i} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Lane 2 (scroll down) */}
      <div className="vx-lane-viewport vx-fade-vertical w-72 md:w-80 lg:w-[24rem] vx-marquee-paused">
        <div className="px-2">
          <div className="vx-tilt-alt will-change-transform">
            <div className="vx-marquee-down">
              {loop.map((c, i) => (
                <CardMini key={"down-" + i} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
