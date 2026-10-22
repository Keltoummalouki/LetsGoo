"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCatalog } from "@/components/catalog-provider";
import { Button } from "@/components/ui/button";
export default function Account() {
  const { user, admin, setNotice } = useCatalog();
  const [mode, setMode] = useState<"signin" | "signup">("signin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/account" },
            });
      if (error) throw error;
      setMessage(
        mode === "signup"
          ? "Account created. Check your email if confirmation is required."
          : "You’re signed in. Your next outing is waiting.",
      );
      setPassword("");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="page account-page">
      <div>
        <h1>
          A little more
          <br />
          to look forward to.
        </h1>
        <p className="page-intro">
          Save the places you love.
          <br />
          Share what’s worth knowing.
        </p>
      </div>
      <section className="account-panel">
        {user ? (
          <>
            <h2>You’re in.</h2>
            <p className="wrap-text">{user.email}</p>
            <Link className="button button-primary" href="/saved">
              See your saved places
            </Link>
            {admin && (
              <Link className="button button-outline" href="/admin">
                Manage the catalog
              </Link>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                const result = await supabase?.auth.signOut();
                if (result?.error) setNotice(result.error.message);
              }}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <h2>
              {mode === "signin" ? "Welcome back." : "Make yourself at home."}
            </h2>
            <p>
              {mode === "signin"
                ? "Sign in to start your next plan."
                : "Create your LetsGoo account."}
            </p>
            {!supabase && (
              <p className="demo-banner">
                Connect Supabase in .env.local to enable accounts.
              </p>
            )}
            <form className="stack-form" onSubmit={submit}>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {mode === "signup" && <small>Use at least 8 characters.</small>}
              <Button disabled={busy || !supabase}>
                {busy
                  ? "One moment…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
            <Button
              variant="ghost"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMessage("");
              }}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </Button>
          </>
        )}
        {message && (
          <p role="status" className="form-message">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
