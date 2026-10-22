"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  Sun,
  Trees,
  Landmark,
  Gamepad2,
  Shapes,
  Dumbbell,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { PlaceCard } from "@/components/place-card";
import { categories, neighborhoods } from "@/lib/data";
import { Button } from "@/components/ui/button";
const icons = [
  Shapes,
  Trees,
  Landmark,
  Gamepad2,
  Dumbbell,
  ShoppingBag,
  Sparkles,
];
export default function Home() {
  const { places, reviews, demo, loading } = useCatalog();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All places"),
    [area, setArea] = useState(""),
    [group, setGroup] = useState(""),
    [budget, setBudget] = useState(""),
    [entry, setEntry] = useState(""),
    [setting, setSetting] = useState(""),
    [kids, setKids] = useState(false),
    [rating, setRating] = useState(""),
    [filters, setFilters] = useState(false),
    [sort, setSort] = useState("recommended");
  const filtered = useMemo(() => {
    const result = places.filter(
      (p) =>
        p.published &&
        (category === "All places" || p.category === category) &&
        (!query ||
          `${p.name} ${p.description} ${p.activities} ${p.neighborhood}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!area || p.neighborhood === area) &&
        (!group || p.audience.includes(group)) &&
        (!budget || p.price <= Number(budget)) &&
        (!entry || (entry === "free" ? p.price === 0 : p.price > 0)) &&
        (!setting || (setting === "outdoor") === p.outdoor) &&
        (!kids || p.kid_friendly) &&
        (!rating ||
          (() => {
            const rs = reviews.filter((r) => r.place_id === p.id);
            return (
              rs.length > 0 &&
              rs.reduce((s, r) => s + r.rating, 0) / rs.length >= Number(rating)
            );
          })()),
    );
    return sort === "price"
      ? result.sort((a, b) => a.price - b.price)
      : sort === "name"
        ? result.sort((a, b) => a.name.localeCompare(b.name))
        : result;
  }, [
    places,
    category,
    query,
    area,
    group,
    budget,
    entry,
    setting,
    kids,
    rating,
    reviews,
    sort,
  ]);
  const clear = () => {
    setQuery("");
    setCategory("All places");
    setArea("");
    setGroup("");
    setBudget("");
    setEntry("");
    setSetting("");
    setKids(false);
    setRating("");
  };
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Your city.
            <br />A little more
            <br />
            <em>possibility.</em>
          </h1>
          <p>
            New corners. Good company. Plans worth making.
            <br className="desktop-break" /> Find your next thing to do in
            Casablanca.
          </p>
          <a className="hero-cta" href="#discover">
            Let’s find your next outing <ArrowUpRight size={20} />
          </a>
          <div className="hero-note">
            <Sun size={18} />
            <span>Big plans or no plans. There’s a place for you.</span>
          </div>
        </div>
        <div className="hero-photo">
          <Image
            unoptimized
            width={1200}
            height={800}
            src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1400&q=85"
            alt="Sunlit Moroccan architecture and courtyard"
            fetchPriority="high"
          />
          <div className="photo-caption">
            <span>
              <MapPin size={15} /> A little Moroccan inspiration
            </span>
            <span>
              Start in Casablanca <ArrowUpRight size={17} />
            </span>
          </div>
          <div className="photo-stamp">
            Less scrolling.
            <br />
            <strong>More going.</strong>
            <ArrowUpRight size={27} />
          </div>
        </div>
      </section>
      <section id="discover" className="discover">
        <div className="section-heading">
          <div>
            <h2>What sounds good today?</h2>
            <p>A little adventure is closer than you think.</p>
          </div>
          <span className="launch-city">
            <MapPin size={16} /> Exploring Casablanca
          </span>
        </div>
        <div className="search-panel">
          <div className="search-field">
            <Search size={21} />
            <input
              aria-label="Search places and activities"
              placeholder="A place, an activity, a new idea…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="search-select">
            <span>Neighborhood</span>
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Anywhere in Casa</option>
              {Array.from(
                new Set([
                  ...neighborhoods,
                  ...places.map((p) => p.neighborhood),
                ]),
              ).map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="search-select">
            <span>Who’s coming?</span>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">Everyone’s welcome</option>
              {["Solo", "Couple", "Friends", "Family"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <button
            className={`filter-button ${filters ? "selected" : ""}`}
            aria-expanded={filters}
            onClick={() => setFilters(!filters)}
          >
            <SlidersHorizontal size={19} /> Filters
          </button>
        </div>
        {filters && (
          <div className="extra-filters">
            <label>
              Entry
              <select value={entry} onChange={(e) => setEntry(e.target.value)}>
                <option value="">Free & paid</option>
                <option value="free">Free entry</option>
                <option value="paid">Paid entry</option>
              </select>
            </label>
            <label>
              Budget per person
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="">Any budget</option>
                <option value="0">Free entry</option>
                <option value="50">Up to 50 MAD</option>
                <option value="150">Up to 150 MAD</option>
                <option value="300">Up to 300 MAD</option>
              </select>
            </label>
            <label>
              Setting
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
              >
                <option value="">Indoor & outdoor</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </label>
            <label>
              Visitor rating
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">All ratings</option>
                <option value="4">4 stars and up</option>
                <option value="3">3 stars and up</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={kids}
                onChange={(e) => setKids(e.target.checked)}
              />{" "}
              Kid-friendly
            </label>
            <Button variant="ghost" onClick={clear}>
              Reset filters
            </Button>
          </div>
        )}
        <div className="categories" aria-label="Place categories">
          {Array.from(
            new Set([
              ...categories,
              ...places.filter((p) => p.published).map((p) => p.category),
            ]),
          ).map((c, i) => {
            const Icon = icons[i] || Shapes;
            return (
              <button
                key={c}
                className={category === c ? "category active" : "category"}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                <Icon size={18} />
                {c}
              </button>
            );
          })}
        </div>
        <div className="results-heading">
          <h3>
            {category === "All places" ? "Find your kind of day" : category}
            <span>
              {filtered.length} {filtered.length === 1 ? "place" : "places"}
            </span>
          </h3>
          <label>
            Sort by{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Discovery order</option>
              <option value="price">Price: low to high</option>
              <option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
        {demo && (
          <p className="demo-banner">
            You’re exploring the sample catalog. Places, prices, and photos are
            illustrative—not verified venue information.
          </p>
        )}
        {loading ? (
          <div className="empty-state" role="status">
            Finding your next outing…
          </div>
        ) : filtered.length ? (
          <div className="place-grid">
            {filtered.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={32} />
            <h3>
              {places.length
                ? "No places match just yet."
                : "Your Casablanca catalog starts here."}
            </h3>
            <p>
              {places.length
                ? "Try a different neighborhood or a little more room in your budget."
                : "An administrator can add the first verified places."}
            </p>
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
          </div>
        )}
      </section>
      <section className="outing-banner">
        <div>
          <h2>
            A good day doesn’t
            <br />
            need a big budget.
          </h2>
          <p>More experiences. A little less spending.</p>
          <Link href="/deals">
            Explore good deals <ArrowRight size={18} />
          </Link>
        </div>
        <div className="banner-side">
          <span>Make room for</span>
          <strong>“let’s go.”</strong>
          <span>Student offers · Group deals · Little extras</span>
        </div>
      </section>
    </main>
  );
}
