"use client";
import Link from "next/link";
import { Ticket, ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
export default function Deals() {
  const { deals, places, loading } = useCatalog();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Casablanca",
  });
  const active = deals.filter(
    (d) =>
      d.expires_at >= today &&
      places.some((p) => p.id === d.place_id && p.published),
  );
  return (
    <main id="main" className="page">
      <h1>Good plans. Better prices.</h1>
      <p className="page-intro">A little extra reason to get out there.</p>
      {loading ? (
        <p>Checking the latest offers…</p>
      ) : active.length ? (
        <div className="deals-list">
          {active.map((d) => {
            const p = places.find((p) => p.id === d.place_id)!;
            return (
              <article className="deal-row" key={d.id}>
                <span className="muted">
                  {p.name} · {p.neighborhood}
                </span>
                <h2>{d.title}</h2>
                <p>{d.description}</p>
                <p>
                  <strong>Conditions:</strong>{" "}
                  {d.conditions || "Ask the venue for full conditions."}
                </p>
                <p>Valid through {d.expires_at}</p>
                <Link href={`/places/${p.slug}`}>
                  See the place <ArrowUpRight size={17} />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Ticket size={38} />
          <h2>Good things are on the way.</h2>
          <p>
            No active offers yet. In the meantime, discover places with free
            entry.
          </p>
          <Link className="button button-primary" href="/#discover">
            Explore places
          </Link>
        </div>
      )}
    </main>
  );
}
