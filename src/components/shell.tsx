"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPin, Heart, ArrowUpRight, X, Menu } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "./catalog-provider";
export function Header() {
  const path = usePathname();
  const { saved, notice, setNotice, admin, catalogError, reload, loading } =
    useCatalog();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="header">
        <Link className="brand" href="/" aria-label="LetsGoo home">
          <Compass size={29} strokeWidth={2.5} />
          LetsGoo<span>.</span>
        </Link>
        <span className="city">
          <MapPin size={15} /> Casablanca <span className="city-dot" />
        </span>
        <button
          className="mobile-menu icon-button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <nav
          className={open ? "nav nav-open" : "nav"}
          aria-label="Main navigation"
        >
          <Link
            onClick={() => setOpen(false)}
            className={path === "/" ? "active" : ""}
            href="/"
          >
            Explore
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className={path === "/deals" ? "active" : ""}
            href="/deals"
          >
            Good deals
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className={path === "/saved" ? "active" : ""}
            href="/saved"
          >
            <Heart size={16} /> Saved{saved.length ? ` (${saved.length})` : ""}
          </Link>
          {admin && <Link href="/admin">Admin</Link>}
          <Link
            onClick={() => setOpen(false)}
            className="account-link"
            href="/account"
          >
            Account <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      {catalogError && (
        <div className="catalog-status" role="status">
          <span>{catalogError}</span>
          <button
            className="button button-ghost"
            disabled={loading}
            onClick={() => void reload()}
          >
            Try again
          </button>
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss message"
            className="icon-button"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <Link className="brand" href="/">
        LetsGoo<span>.</span>
      </Link>
      <span>Less searching. More exploring.</span>
      <span>Made for a little more Casablanca.</span>
    </footer>
  );
}
