"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { demoPlaces, type Place, type Deal, type Review } from "@/lib/data";
type Catalog = {
  places: Place[];
  deals: Deal[];
  reviews: Review[];
  saved: string[];
  user: User | null;
  admin: boolean;
  demo: boolean;
  loading: boolean;
  notice: string;
  setNotice: (v: string) => void;
  toggleSave: (id: string) => Promise<void>;
  reload: () => Promise<void>;
};
const Context = createContext<Catalog | null>(null);
export const useCatalog = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Missing catalog provider");
  return value;
};
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>(supabase ? [] : demoPlaces),
    [deals, setDeals] = useState<Deal[]>([]),
    [reviews, setReviews] = useState<Review[]>([]),
    [saved, setSaved] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null),
    [admin, setAdmin] = useState(false),
    [demo, setDemo] = useState(!supabase),
    [loading, setLoading] = useState(!!supabase),
    [notice, setNotice] = useState("");
  const reload = useCallback(async () => {
    if (!supabase) return;
    try {
      const [p, d, r] = await Promise.all([
        supabase.from("places").select("*").order("name"),
        supabase.from("deals").select("*"),
        supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (p.error) {
        setPlaces(demoPlaces);
        setDemo(true);
      } else {
        setPlaces(p.data || []);
        setDemo(false);
      }
      setDeals(d.data || []);
      setReviews(r.data || []);
    } catch {
      setPlaces(demoPlaces);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // The effect initializes an external Supabase query; state updates follow its response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    if (!supabase) return;
    const client = supabase;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        setAdmin(false);
        setSaved([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [reload]);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user || !supabase) return;
      const [a, f] = await Promise.all([
        supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("favorites").select("place_id").eq("user_id", user.id),
      ]);
      if (active) {
        setAdmin(Boolean(a.data));
        setSaved(f.data?.map((x) => x.place_id) || []);
        void reload();
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [user, reload]);
  const toggleSave = async (id: string) => {
    if (demo) {
      setNotice(
        "Sample places cannot be saved. Add a real place in the admin area first.",
      );
      return;
    }
    if (!user || !supabase) {
      setNotice("Sign in from Account to save places to your shortlist.");
      return;
    }
    const exists = saved.includes(id);
    const { error } = exists
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", id)
      : await supabase
          .from("favorites")
          .insert({ user_id: user.id, place_id: id });
    if (error) {
      setNotice(error.message);
      return;
    }
    setSaved((previous) =>
      exists ? previous.filter((x) => x !== id) : [...previous, id],
    );
  };
  return (
    <Context.Provider
      value={{
        places,
        deals,
        reviews,
        saved,
        user,
        admin,
        demo,
        loading,
        notice,
        setNotice,
        toggleSave,
        reload,
      }}
    >
      {children}
    </Context.Provider>
  );
}
