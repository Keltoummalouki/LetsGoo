"use client";
import { availableToday, scheduleText } from "@/lib/deal-schedule";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Trash2, Check } from "lucide-react";
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
import type { Review } from "@/lib/data";
import { Button } from "@/components/ui/button";
function ReviewEditor({
  placeId,
  userId,
  existing,
}: {
  placeId: string;
  userId: string;
  existing: Review | undefined;
}) {
  const { reload, setNotice } = useCatalog();
  const [body, setBody] = useState(existing?.body ?? ""),
    [rating, setRating] = useState(String(existing?.rating ?? 5)),
    [busy, setBusy] = useState(false);

  const [name,setName] = useState(existing?.display_name ?? "");
  const [errorText,setErrorText] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    if(body.trim().length < 10) { setErrorText("Describe your visit in at least 10 characters."); return; }
    setErrorText(""); setBusy(true);
    try {
      const { error } = await supabase.from("reviews").upsert(
        {
          ...(existing ? { id: existing.id } : {}),
          place_id: placeId,
          user_id: userId,
          rating: Number(rating),
          body:body.trim(),
          ...(name.trim() || existing?.display_name ? {display_name:name.trim() || null} : {}),
        },
        { onConflict: "user_id,place_id" },
      );
      if (error) throw new Error(error.message);
      await reload();
      setNotice("Your review was published as a community report.");
    } catch (e) {
      setErrorText(
        e instanceof Error
          ? e.message
          : "Could not publish your review. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={submit}>
      <h3>{existing ? "Update your review" : "How was your visit?"}</h3>
      <fieldset><legend>Rating</legend><div className="review-stars">{[1,2,3,4,5].map(n=><label key={n} className="star-choice"><input type="radio" name="rating" aria-label={n+" stars"} checked={Number(rating)===n} onChange={()=>setRating(String(n))}/><Star aria-hidden="true" fill={Number(rating)>=n?"currentColor":"none"}/></label>)}</div></fieldset>
      <label>Public name (optional)<input value={name} maxLength={80} onChange={e=>setName(e.target.value)} placeholder="Leave blank for an anonymous review"/></label>
      <label>
        Your experience
        <textarea
          required
          aria-describedby="review-length"
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What should the next visitor know?"
        />
      </label>
      <small id="review-length">At least 10 characters · {body.trim().length}/2000</small>
      {errorText && <p role="alert">{errorText}</p>}
      <Button disabled={busy}><Check size={16}/>
        {busy ? "Publishing…" : existing ? "Update review" : "Publish review"}
      </Button>
    </form>
  );
}
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
    pendingSaves,
    authLoading,
    savedLoading,
    user,
    reload,
    setNotice,
  } = useCatalog();
  const place = places.find((p) => p.slug === slug && p.published);
  if (loading)
    return (
      <main id="main" className="page">
        <LoadingSkeleton label="Loading place"/>
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
  const address = place.address.trim() || [place.name, place.neighborhood].join(", ");
  const destination = encodeURIComponent(/casablanca/i.test(address) ? address : address + ", Casablanca, Morocco");
  const existing = placeReviews.find((r) => r.user_id === user?.id);
  const offers = deals.filter(d => d.place_id === place.id && availableToday(d));
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
        <Button
          variant="outline"
          onClick={() => void toggleSave(place.id)}
          disabled={
            pendingSaves.includes(place.id) || authLoading || savedLoading
          }
          aria-busy={pendingSaves.includes(place.id)}
        >
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
            {place.activities ? <div className="tags">{place.activities.split(",").map(a=>a.trim()).filter(Boolean).map((a,i)=><span key={i}>{a}</span>)}</div> : <p>Activities have not been added yet.</p>}
            {place.visit?.franchise?.trim() && <div><h3>{place.visit.franchise} branches</h3>
              <p>This location: {place.address || place.neighborhood}</p>
              {places.filter(p=>p.id!==place.id && p.published && p.visit?.franchise?.trim().toLowerCase()===place.visit?.franchise?.trim().toLowerCase()).map(p=><p key={p.id}><Link href={"/places/"+p.slug}>{p.name} · {p.address || p.neighborhood}</Link></p>)}
            </div>}
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
                    <p style={{ whiteSpace: "pre-line" }}>{String(text) || "Not yet provided."}</p>
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
                  <small>{scheduleText(d)}</small>
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
                    <span className="review-stars" aria-label={r.rating+" out of 5 stars"}>{[1,2,3,4,5].map(n=><Star key={n} size={16} fill={n<=r.rating?"currentColor":"none"}/>)}</span> {r.display_name || "Anonymous visitor"}
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
                    <Trash2 size={16}/> Delete my review
                  </Button>
                )}
              </article>
            ))}
            {!placeReviews.length && (
              <p>No reviews yet. Be the first to share something useful.</p>
            )}
            {!demo && user ? (
              <ReviewEditor
                key={`${place.id}:${user.id}:${existing?.id ?? "new"}`}
                placeId={place.id}
                userId={user.id}
                existing={existing}
              />
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
            href={place.visit?.googleMapsUrl?.startsWith("https://") ? place.visit.googleMapsUrl : `https://www.google.com/maps/dir/?api=1&destination=${destination}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <ExternalLink size={16} />
          </a>
          <a className="button button-outline"
            href={place.visit?.wazeUrl?.startsWith("https://") ? place.visit.wazeUrl : `https://www.waze.com/ul?q=${destination}&navigate=yes`}
            target="_blank" rel="noreferrer">Open in Waze <ExternalLink size={16}/></a>
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
