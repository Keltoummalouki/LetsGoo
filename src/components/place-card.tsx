"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ArrowUpRight, Star } from "lucide-react";
import type { Place } from "@/lib/data";
import { useCatalog } from "./catalog-provider";
export function PlaceCard({ place }: { place: Place }) {
  const {
    saved,
    toggleSave,
    reviews,
    demo,
    pendingSaves,
    authLoading,
    savedLoading,
  } = useCatalog();
  const ratings = reviews.filter((r) => r.place_id === place.id);
  return (
    <article className="place-card">
      <div className="card-photo">
        <Link href={`/places/${place.slug}`} tabIndex={-1} aria-hidden="true">
          <Image
            unoptimized
            width={1200}
            height={800}
            src={place.image || "/placeholder.svg"}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>
        <span className="photo-label">{place.category}</span>
        <button
          className={`save-button ${saved.includes(place.id) ? "is-saved" : ""}`}
          aria-label={`${saved.includes(place.id) ? "Unsave" : "Save"} ${place.name}`}
          aria-pressed={saved.includes(place.id)}
          disabled={
            pendingSaves.includes(place.id) || authLoading || savedLoading
          }
          aria-busy={pendingSaves.includes(place.id)}
          onClick={() => void toggleSave(place.id)}
        >
          <Heart
            size={18}
            fill={saved.includes(place.id) ? "currentColor" : "none"}
          />
        </button>
        {demo && <span className="sample-photo">Illustrative photo</span>}
      </div>
      <div className="place-meta">
        <span>
          <MapPin size={13} />
          {place.neighborhood}
        </span>
        {ratings.length > 0 && (
          <span>
            <Star size={13} />
            {(
              ratings.reduce((a, r) => a + r.rating, 0) / ratings.length
            ).toFixed(1)}{" "}
            ({ratings.length})
          </span>
        )}
      </div>
      <h3>
        <Link href={`/places/${place.slug}`}>
          {place.name}
          <ArrowUpRight size={19} />
        </Link>
      </h3>
      <p className="card-activities">{place.activities}</p>
      <div className="card-bottom">
        <span>
          {place.price === 0 ? (
            <strong>Free entry</strong>
          ) : (
            <>
              <strong>{place.price} MAD</strong> / person
            </>
          )}
        </span>
        <span>{place.outdoor ? "Outdoor" : "Indoor"}</span>
      </div>
    </article>
  );
}
