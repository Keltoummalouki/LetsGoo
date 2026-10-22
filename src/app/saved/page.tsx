"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { PlaceCard } from "@/components/place-card";
export default function Saved() {
  const { places, saved, user, loading } = useCatalog();
  const list = places.filter((p) => saved.includes(p.id) && p.published);
  return (
    <main id="main" className="page">
      <h1>Your next good days.</h1>
      <p className="page-intro">
        A little shortlist of places you’d love to go.
      </p>
      {loading ? (
        <p>Loading your shortlist…</p>
      ) : list.length ? (
        <div className="place-grid">
          {list.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={35} />
          <h2>
            {user
              ? "Your shortlist is waiting."
              : "Keep a good idea for later."}
          </h2>
          <p>
            {user
              ? "Tap the heart on a place to save it here."
              : "Sign in to keep your favorite places together across devices."}
          </p>
          <Link
            className="button button-primary"
            href={user ? "/#discover" : "/account"}
          >
            {user ? "Discover places" : "Sign in to save places"}
          </Link>
        </div>
      )}
    </main>
  );
}
