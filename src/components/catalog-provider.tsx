"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { demoPlaces } from "@/lib/data";
import { CatalogStore, type CatalogState } from "@/lib/catalog-store";

type Catalog = CatalogState &
  Pick<CatalogStore, "setNotice" | "toggleSave" | "reload" | "retryAccount">;
const Context = createContext<Catalog | null>(null);
export const useCatalog = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Missing catalog provider");
  return value;
};
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new CatalogStore(supabase, demoPlaces));
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  useEffect(() => store.start(), [store]);
  return (
    <Context.Provider
      value={{
        ...state,
        setNotice: store.setNotice,
        toggleSave: store.toggleSave,
        reload: store.reload,
        retryAccount: store.retryAccount,
      }}
    >
      {children}
    </Context.Provider>
  );
}
