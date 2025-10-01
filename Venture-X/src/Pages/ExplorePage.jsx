import { useMemo } from "react";
import { Link } from "react-router-dom";

const Badge = ({ children, color = "sky" }) => {
  const variants = {
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
  };
  const v = variants[color] || variants.sky;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${v}`}
    >
      {children}
    </span>
  );
};

const Chip = ({ children, icon }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm">
    {icon}
    {children}
  </span>
);

const Segmented = () => (
  <div
    role="tablist"
    aria-label="View mode"
    className="flex items-center rounded-lg border border-slate-300 overflow-hidden shadow-sm"
  >
    <button
      role="tab"
      aria-selected="true"
      className="px-3.5 py-2 text-sm font-medium bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      ▤ Carousel
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      ▦ Grid
    </button>
    <button
      role="tab"
      aria-selected="false"
      className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      ◉ Map
    </button>
  </div>
);

const FilterButtons = () => (
  <div className="flex items-center gap-3">
    <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
      Filters
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-slate-500"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
      Popular Searches
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-slate-500"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>
);

const Card = ({ title, subtitle, tag, price, theme }) => (
  <Link to={'/company/FarmEazy'} className="rounded-xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
    <div className={`relative bg-gradient-to-br ${theme} aspect-[3/2]`}>
      {tag && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-red-500 text-white text-xs font-medium px-2.5 py-1">
          ⚠️ {tag}
        </span>
      )}
      {price && (
        <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white text-slate-900 text-xs font-semibold px-2.5 py-1 shadow-sm">
          {price}
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="text-slate-900 font-semibold">{title}</h3>
      <p className="mt-1 text-slate-600 text-sm leading-6">{subtitle}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-slate-200 inline-block" />
          <span className="text-slate-500 text-sm">Founder</span>
        </div>
        <button
          className="text-slate-400 hover:text-pink-500"
          aria-label="like"
        >
          ♥
        </button>
      </div>
    </div>
  </Link>
);

const ExplorePage = () => {
  const categories = useMemo(
    () => [
      {
        label: "Technology",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        ),
      },
      {
        label: "Marketplace",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <path d="M3 9h18l-1 9H4L3 9Z" />
            <path d="M3 9l2-5h14l2 5" />
          </svg>
        ),
      },
      {
        label: "Fintech & Finance",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <path d="M3 7h18v10H3z" />
            <path d="M6 12h12" />
          </svg>
        ),
      },
      {
        label: "Blockchain & Web3",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <path d="M6 12l6-9 6 9-6 9-6-9z" />
          </svg>
        ),
      },
      {
        label: "B2C",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <circle cx="8" cy="8" r="3" />
            <path d="M2 22c0-3.314 2.686-6 6-6" />
            <circle cx="18" cy="8" r="3" />
            <path d="M22 22c0-3.314-2.686-6-6-6" />
          </svg>
        ),
      },
      {
        label: "B2B",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <rect x="3" y="8" width="7" height="10" />
            <rect x="14" y="6" width="7" height="12" />
          </svg>
        ),
      },
      {
        label: "Hardware",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400"
          >
            <rect x="4" y="4" width="16" height="10" />
            <path d="M8 18h8" />
          </svg>
        ),
      },
    ],
    []
  );

  const cards = [
    {
      title: "Firesale",
      subtitle:
        "Revolutionizing the way musicians sell and buy used instruments",
      tag: "Almost Fully Funded",
      price: "$210",
      theme: "from-rose-300 via-orange-200 to-amber-200",
    },
    {
      title: "SkinBit",
      subtitle:
        "AI-powered dermatology platform for early skin cancer detection",
      tag: "4 Days Left",
      price: null,
      theme: "from-teal-300 via-sky-200 to-indigo-200",
    },
    {
      title: "TMA Precision Health",
      subtitle: "Personalized health solutions using advanced genetic testing",
      tag: "Almost Fully Funded",
      price: null,
      theme: "from-sky-200 via-blue-200 to-indigo-300",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-3">
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm">
              Founders
            </button>
            <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Venture Funds <Badge color="blue">Accredited-Only</Badge>
            </button>
            <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Top Investors
            </button>
            <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Research & Reviews <Badge color="amber">New</Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Heading + chips + controls (from image 2) */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Invest in founders building the future
          </h1>

          {/* Filters Row */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-nowrap lg:flex-wrap gap-3 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-1">
              {categories.map((c) => (
                <Chip key={c.label} icon={c.icon}>
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Segmented />
              <FilterButtons />
            </div>
          </div>
        </div>
      </section>

      {/* Featured list */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              VC & Notable Angel Backed
            </h2>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              See all (38) →
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <Card key={c.title} {...c} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
