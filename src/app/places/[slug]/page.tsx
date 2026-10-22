"use client";
import Image from "next/image";
import { use } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  TrainFront,
  Car,
  Info,
  Heart,
  ArrowLeft,
  ExternalLink,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
export default function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const {
    places,
    reviews,
    deals,
    loading,
    demo,
    saved,
    toggleSave,
    user,
    reload,
    setNotice,
  } = useCatalog();
  const place = places.find((p) => p.slug === slug && p.published);
  const [body, setBody] = useState(""),
    [rating, setRating] = useState("5"),
    [busy, setBusy] = useState(false);
  if (loading)
    return (
      <main id="main" className="page">
        <p>Loading place…</p>
      </main>
    );
  if (!place)
    return (
      <main id="main" className="page empty-state">
        <h1>Place not found</h1>
        <Link href="/">Back to discovery</Link>
      </main>
    );
  const placeReviews = reviews.filter((r) => r.place_id === place.id);
  const existing = placeReviews.find((r) => r.user_id === user?.id);
  const offers = deals.filter(
    (d) =>
      d.place_id === place.id &&
      d.expires_at >=
        new Date().toLocaleDateString("en-CA", {
          timeZone: "Africa/Casablanca",
        }),
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user || !place) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("reviews").upsert(
        {
          ...(existing ? { id: existing.id } : {}),
          place_id: place.id,
          user_id: user.id,
          rating: Number(rating),
          body,
        },
        { onConflict: "user_id,place_id" },
      );
      if (error) throw error;
      setBody("");
      await reload();
      setNotice("Your review was published as a community report.");
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Could not publish your review. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function removeReview(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) setNotice(error.message);
    else await reload();
  }
  return (
    <main id="main" className="page detail-page">
      <Link className="back-link" href="/#discover">
        <ArrowLeft size={16} /> All places
      </Link>
      <div className="detail-heading">
        <div>
          <p className="muted">
            {place.category} · {place.neighborhood}
          </p>
          <h1>{place.name}</h1>
        </div>
        <Button variant="outline" onClick={() => void toggleSave(place.id)}>
          <Heart
            size={17}
            fill={saved.includes(place.id) ? "currentColor" : "none"}
          />
          {saved.includes(place.id) ? "Saved" : "Save place"}
        </Button>
      </div>
      {demo && (
        <p className="demo-banner">
          Sample listing with illustrative photos and details. Confirm real
          venue information before planning a visit.
        </p>
      )}
      <Image
        unoptimized
        width={1200}
        height={800}
        className="detail-photo"
        src={place.image || "/placeholder.svg"}
        alt={demo ? "Illustrative scene for this sample outing" : place.name}
      />
      <div className="detail-columns">
        <div>
          <section>
            <h2>A little about the experience</h2>
            <p>{place.description}</p>
            <div className="tags">
              {place.audience.map((a) => (
                <span key={a}>{a}</span>
              ))}
              <span>{place.outdoor ? "Outdoor" : "Indoor"}</span>
              {place.kid_friendly && <span>Kid-friendly</span>}
            </div>
            <h3>What you can do</h3>
            <p>{place.activities || "Activities have not been added yet."}</p>
          </section>
          <section className="practical">
            <h2>Know before you go</h2>
            {[
              [Clock, "Opening hours", place.hours],
              [TrainFront, "Getting there", place.transport],
              [Car, "Parking", place.parking],
              [Info, "A few useful tips", place.tips],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Clock;
              return (
                <div className="practical-row" key={String(title)}>
                  <I size={21} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(text) || "Not yet provided."}</p>
                  </div>
                </div>
              );
            })}
          </section>
          {offers.length > 0 && (
            <section>
              <h2>Good deals here</h2>
              {offers.map((d) => (
                <article key={d.id} className="deal-row">
                  <h3>{d.title}</h3>
                  <p>{d.description}</p>
                  <p>{d.conditions}</p>
                  <small>Valid through {d.expires_at}</small>
                </article>
              ))}
            </section>
          )}
          <section>
            <h2>
              From the community{" "}
              <span className="count">{placeReviews.length}</span>
            </h2>
            <p className="muted">
              Visitor reports are personal experiences and have not been
              verified by LetsGoo.
            </p>
            {placeReviews.map((r) => (
              <article className="review" key={r.id}>
                <div>
                  <strong>
                    <Star size={15} /> {r.rating}/5
                  </strong>
                  <span>
                    {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <p>{r.body}</p>
                {r.user_id === user?.id && (
                  <Button
                    variant="ghost"
                    onClick={() => void removeReview(r.id)}
                  >
                    Delete my review
                  </Button>
                )}
              </article>
            ))}
            {!placeReviews.length && (
              <p>No reviews yet. Be the first to share something useful.</p>
            )}
            {!demo && user ? (
              <form className="stack-form" onSubmit={submit}>
                <h3>
                  {existing ? "Update your review" : "How was your visit?"}
                </h3>
                <label>
                  Rating
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Your experience
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="What should the next visitor know?"
                  />
                </label>
                <Button disabled={busy}>
                  {busy
                    ? "Publishing…"
                    : existing
                      ? "Update review"
                      : "Publish review"}
                </Button>
              </form>
            ) : (
              <p className="muted">
                {demo ? (
                  "Reviews are available on real listings."
                ) : (
                  <Link href="/account">
                    Sign in to share your experience →
                  </Link>
                )}
              </p>
            )}
          </section>
        </div>
        <aside className="visit-summary">
          <h2>Make it a plan</h2>
          <p className="price">
            {place.price === 0 ? "Free" : `${place.price} MAD`}
            <span>{place.price === 0 ? "entry" : "per person"}</span>
          </p>
          <p>
            <MapPin size={17} />
            {place.address || place.neighborhood}
          </p>
          <a
            className="button button-primary"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || place.name + " Casablanca")}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <ExternalLink size={16} />
          </a>
          {/^https?:\/\//.test(place.website) && (
            <a
              className="button button-outline"
              href={place.website}
              target="_blank"
              rel="noreferrer"
            >
              Visit website <ExternalLink size={16} />
            </a>
          )}
          {place.phone && <a href={`tel:${place.phone}`}>{place.phone}</a>}
          <small>
            {place.verified_at
              ? `Information reviewed ${new Date(place.verified_at).toLocaleDateString("en-GB")}`
              : "Information not yet verified."}{" "}
            Prices and hours can change. Confirm with the venue.
          </small>
        </aside>
      </div>
    </main>
  );
}
