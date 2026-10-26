import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Deal, Place, Review } from "./data";

export type CatalogState = {
  places: Place[];
  deals: Deal[];
  reviews: Review[];
  saved: string[];
  user: User | null;
  admin: boolean;
  demo: boolean;
  loading: boolean;
  authLoading: boolean;
  savedLoading: boolean;
  pendingSaves: string[];
  catalogError: string;
  accountError: string;
  notice: string;
};

// Discard responses from previous sessions, including late requests after sign-out.
export class CatalogStore {
  private state: CatalogState;
  private initial: CatalogState;
  private listeners = new Set<() => void>();
  private pending = new Set<string>();
  private generation = 0;
  private catalogRequest = 0;
  private accountRequest = 0;
  private active = false;
  private identity: string | null | undefined;
  private client: SupabaseClient | null;
  private samples: Place[];

  constructor(client: SupabaseClient | null, samples: Place[]) {
    this.client = client;
    this.samples = samples;
    this.state = this.initial = {
      places: client ? [] : samples,
      deals: [],
      reviews: [],
      saved: [],
      user: null,
      admin: false,
      demo: !client,
      loading: !!client,
      authLoading: !!client,
      savedLoading: !!client,
      pendingSaves: [],
      catalogError: "",
      accountError: "",
      notice: "",
    };
  }

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.initial;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(patch: Partial<CatalogState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  setNotice = (notice: string) => this.update({ notice });

  start = () => {
    this.active = true;
    this.identity = undefined;
    if (!this.client)
      return () => {
        this.active = false;
      };
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((_event, session) => {
      if (!this.active) return;
      const user = session?.user ?? null;
      const identity = user?.id ?? null;
      if (this.identity === identity) {
        this.update({ user });
        return;
      }
      this.identity = identity;
      const generation = ++this.generation;
      ++this.catalogRequest;
      ++this.accountRequest;
      this.pending.clear();
      this.update({
        user,
        admin: false,
        saved: [],
        pendingSaves: [],
        accountError: "",
        authLoading: !!user,
        savedLoading: !!user,
        places: [],
        deals: [],
        reviews: [],
        loading: true,
        catalogError: "",
      });
      // Keep auth callbacks synchronous; query after Supabase releases its lock.
      queueMicrotask(() => {
        if (!this.active || generation !== this.generation) return;
        void this.reload();
        if (user) void this.retryAccount();
      });
    });
    return () => {
      this.active = false;
      ++this.generation;
      subscription.unsubscribe();
    };
  };

  reload = async () => {
    if (!this.client || !this.active) return;
    const generation = this.generation;
    const request = ++this.catalogRequest;
    const current = () =>
      this.active &&
      generation === this.generation &&
      request === this.catalogRequest;
    this.update({ loading: true, catalogError: "" });
    try {
      const [places, deals, reviews] = await Promise.all([
        this.client.from("places").select("*").order("name"),
        this.client.from("deals").select("*"),
        this.client
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (!current()) return;
      const failed = [
        deals.error && "offers",
        reviews.error && "reviews",
      ].filter(Boolean);
      this.update({
        places: places.error ? this.samples : (places.data ?? []),
        demo: !!places.error,
        deals: places.error || deals.error ? [] : (deals.data ?? []),
        reviews: places.error || reviews.error ? [] : (reviews.data ?? []),
        catalogError: places.error
          ? "Live places are unavailable right now. You can still explore the sample ideas."
          : failed.length
            ? `We couldn’t load ${failed.join(" and ")}. Please try again.`
            : "",
      });
    } catch {
      if (!current()) return;
      this.update({
        places: this.samples,
        deals: [],
        reviews: [],
        demo: true,
        catalogError:
          "Live places are unavailable right now. You can still explore the sample ideas.",
      });
    } finally {
      if (current()) this.update({ loading: false });
    }
  };

  retryAccount = async () => {
    const user = this.state.user;
    if (!this.client || !user || !this.active) return;
    const generation = this.generation;
    const request = ++this.accountRequest;
    const current = () =>
      this.active &&
      generation === this.generation &&
      request === this.accountRequest;
    this.update({ authLoading: true, savedLoading: true, accountError: "" });
    try {
      const [membership, favorites] = await Promise.all([
        this.client
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        this.client.from("favorites").select("place_id").eq("user_id", user.id),
      ]);
      if (!current()) return;
      this.update({
        admin: !membership.error && !!membership.data,
        saved: favorites.error
          ? []
          : (favorites.data ?? []).map((row) => row.place_id),
        accountError:
          membership.error || favorites.error
            ? "We couldn’t load your account access or saved places. Please try again."
            : "",
      });
    } catch {
      if (current())
        this.update({
          admin: false,
          saved: [],
          accountError:
            "We couldn’t load your account access or saved places. Please try again.",
        });
    } finally {
      if (current()) this.update({ authLoading: false, savedLoading: false });
    }
  };

  toggleSave = async (id: string) => {
    const { user, demo, saved, authLoading, savedLoading, accountError } =
      this.state;
    if (demo) {
      this.setNotice(
        "Sample places cannot be saved. Try a live listing when the catalog is available.",
      );
      return;
    }
    if (!user || !this.client) {
      this.setNotice("Sign in from Account to save places to your shortlist.");
      return;
    }
    if (authLoading || savedLoading || accountError) {
      this.setNotice(
        "Your saved places aren’t ready yet. Open Account to retry.",
      );
      return;
    }
    if (this.pending.has(id)) return;
    this.pending.add(id);
    this.update({ pendingSaves: [...this.pending] });
    const generation = this.generation;
    const current = () => this.active && generation === this.generation;
    const exists = saved.includes(id);
    try {
      const { error } = exists
        ? await this.client
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("place_id", id)
        : await this.client
            .from("favorites")
            .insert({ user_id: user.id, place_id: id });
      if (!current()) return;
      if (error) throw error;
      this.update({
        saved: exists
          ? this.state.saved.filter((value) => value !== id)
          : [...new Set([...this.state.saved, id])],
      });
    } catch {
      if (current())
        this.setNotice("Couldn’t update your saved places. Please try again.");
    } finally {
      if (current()) {
        this.pending.delete(id);
        this.update({ pendingSaves: [...this.pending] });
      }
    }
  };
}
