"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { supabase } from "@/lib/supabase";
import type { Place } from "@/lib/data";
import { Button } from "@/components/ui/button";
const blank: Omit<Place, "id"> = {
  slug: "",
  name: "",
  category: "",
  neighborhood: "",
  description: "",
  price: 0,
  image: "",
  address: "",
  hours: "",
  transport: "",
  parking: "",
  tips: "",
  audience: [],
  outdoor: false,
  kid_friendly: false,
  verified_at: null,
  website: "",
  phone: "",
  activities: "",
  published: false,
};
export default function Admin() {
  const {
    admin,
    user,
    authLoading,
    accountError,
    retryAccount,
    places,
    deals,
    reviews,
    reload,
    setNotice,
  } = useCatalog();
  const [tab, setTab] = useState("places"),
    [editing, setEditing] = useState(false),
    [id, setId] = useState<string | null>(null),
    [form, setForm] = useState(blank),
    [busy, setBusy] = useState(false),
    [remove, setRemove] = useState<string | null>(null),
    [cats, setCats] = useState<string[]>([]),
    [areas, setAreas] = useState<string[]>([]),
    [taxonomy, setTaxonomy] = useState(""),
    [kind, setKind] = useState("categories");
  const [taxonomyOriginal, setTaxonomyOriginal] = useState<string | null>(null);
  const [taxonomyOwner, setTaxonomyOwner] = useState<string | null>(null),
    [taxonomyError, setTaxonomyError] = useState("");
  const [offer, setOffer] = useState({
      place_id: "",
      title: "",
      description: "",
      conditions: "",
      expires_at: "",
    }),
    [dealId, setDealId] = useState<string | null>(null);
  useEffect(() => {
    if (!admin || !user || !supabase) return;
    let active = true;
    const client = supabase;
    void Promise.all([
      client.from("categories").select("name").order("name"),
      client.from("neighborhoods").select("name").order("name"),
    ])
      .then(([c, n]) => {
        if (!active) return;
        if (c.error || n.error) {
          setTaxonomyError(
            "Could not load categories and neighborhoods. Refresh this page to try again.",
          );
          return;
        }
        setCats(c.data.map((x) => x.name));
        setAreas(n.data.map((x) => x.name));
        setTaxonomyError("");
      })
      .catch(() => {
        if (active)
          setTaxonomyError(
            "Could not load categories and neighborhoods. Refresh this page to try again.",
          );
      })
      .finally(() => {
        if (active) setTaxonomyOwner(user.id);
      });
    return () => {
      active = false;
    };
  }, [admin, user]);
  const taxonomyLoading = taxonomyOwner !== user?.id;
  const canCreatePlace =
    !taxonomyLoading && !taxonomyError && cats.length > 0 && areas.length > 0;
  if (authLoading)
    return (
      <main id="main" className="page empty-state">
        <h1>Catalog administration</h1>
        <p role="status">Checking your administrator access…</p>
      </main>
    );
  if (!user)
    return (
      <main id="main" className="page empty-state">
        <h1>Catalog administration</h1>
        <p>Sign in with an administrator account to continue.</p>
        <Link href="/account" className="button button-primary">
          Sign in
        </Link>
      </main>
    );
  if (!admin && accountError)
    return (
      <main id="main" className="page empty-state">
        <h1>Could not check administrator access</h1>
        <p role="alert">{accountError}</p>
        <Button onClick={() => void retryAccount()}>Try again</Button>
      </main>
    );
  if (!admin)
    return (
      <main id="main" className="page empty-state">
        <h1>Admin access required</h1>
        <p>This account does not have permission to manage the catalog.</p>
        <p>
          See the setup guide for granting access through your Supabase
          dashboard.
        </p>
        <Link href="/">Back to discovery</Link>
      </main>
    );
  const update = (key: keyof typeof blank, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!cats.includes(form.category) || !areas.includes(form.neighborhood)) {
      setNotice("Choose an available category and neighborhood before saving.");
      return;
    }
    setBusy(true);
    try {
      const { error } = id
        ? await supabase.from("places").update(form).eq("id", id)
        : await supabase.from("places").insert(form);
      if (error) throw error;
      await reload();
      setEditing(false);
      setNotice("Place saved.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save this place.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined) {
    if (!file || !supabase) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setNotice("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const path = `${crypto.randomUUID()}.${file.type.split("/")[1]}`;
      const { error } = await supabase.storage
        .from("place-images")
        .upload(path, file);
      if (error) throw error;
      update(
        "image",
        supabase.storage.from("place-images").getPublicUrl(path).data.publicUrl,
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteItem(table: string, item: string) {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq("id", item);
    if (error) setNotice(error.message);
    else {
      setRemove(null);
      await reload();
      setNotice("Deleted.");
    }
  }
  async function saveDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = dealId
      ? await supabase.from("deals").update(offer).eq("id", dealId)
      : await supabase.from("deals").insert(offer);
    setBusy(false);
    if (error) setNotice(error.message);
    else {
      setOffer({
        place_id: "",
        title: "",
        description: "",
        conditions: "",
        expires_at: "",
      });
      setDealId(null);
      await reload();
      setNotice("Deal saved.");
    }
  }
  async function addTaxonomy(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!taxonomy.trim()) return;
    const { error } = taxonomyOriginal
      ? await supabase
          .from(kind)
          .update({ name: taxonomy.trim() })
          .eq("name", taxonomyOriginal)
      : await supabase.from(kind).insert({ name: taxonomy.trim() });
    if (error) setNotice(error.message);
    else {
      const updateNames = (names: string[]) =>
        taxonomyOriginal
          ? names.map((n) => (n === taxonomyOriginal ? taxonomy.trim() : n))
          : [...names, taxonomy.trim()];
      if (kind === "categories") setCats(updateNames(cats));
      else setAreas(updateNames(areas));
      setTaxonomy("");
      setTaxonomyOriginal(null);
      await reload();
    }
  }
  async function removeTaxonomy(name: string) {
    if (!supabase) return;
    const { error } = await supabase.from(kind).delete().eq("name", name);
    if (error) {
      setNotice(
        error.code === "23503"
          ? "This item is used by a place. Reassign those places before deleting it."
          : error.message,
      );
      return;
    }
    if (kind === "categories") setCats(cats.filter((n) => n !== name));
    else setAreas(areas.filter((n) => n !== name));
    setRemove(null);
    setNotice("Catalog item removed.");
  }
  return (
    <main id="main" className="page admin-page">
      <div className="section-heading">
        <div>
          <h1>Keep Casa worth exploring.</h1>
          <p>Manage the details people rely on before they go.</p>
        </div>
      </div>
      <div className="categories">
        {["places", "deals", "reviews", "categories & locations"].map((t) => (
          <button
            className={tab === t ? "category active" : "category"}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "places" && (
        <>
          {!editing ? (
            <>
              <Button
                disabled={!canCreatePlace}
                onClick={() => {
                  setForm({
                    ...blank,
                    category: cats[0],
                    neighborhood: areas[0],
                  });
                  setId(null);
                  setEditing(true);
                }}
              >
                <Plus size={17} /> Add place
              </Button>
              {taxonomyLoading ? (
                <p role="status">Loading categories and neighborhoods…</p>
              ) : taxonomyError ? (
                <p role="alert">{taxonomyError}</p>
              ) : !canCreatePlace ? (
                <p>
                  Add at least one category and one neighborhood in “categories
                  &amp; locations” before creating a place.
                </p>
              ) : null}
              <div className="admin-list">
                {places
                  .filter((p) => !p.id.startsWith("demo"))
                  .map((p) => (
                    <article key={p.id}>
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {p.neighborhood} ·{" "}
                          {p.published ? "Published" : "Draft"} · {p.price} MAD
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={taxonomyLoading || !!taxonomyError}
                        onClick={() => {
                          const { id: placeId, ...fields } = p;
                          setId(placeId);
                          setForm(fields);
                          setEditing(true);
                        }}
                      >
                        <Pencil size={15} /> Edit
                      </Button>
                      {remove === p.id ? (
                        <>
                          <span>Delete this place and its reviews?</span>
                          <Button
                            onClick={() => void deleteItem("places", p.id)}
                          >
                            Confirm delete
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setRemove(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => setRemove(p.id)}
                        >
                          <Trash2 size={17} />
                        </Button>
                      )}
                    </article>
                  ))}
              </div>
            </>
          ) : (
            <form className="admin-form" onSubmit={save}>
              <h2>{id ? "Edit place" : "Add a place"}</h2>
              <div className="form-grid">
                {(
                  [
                    "name",
                    "slug",
                    "address",
                    "activities",
                    "hours",
                    "transport",
                    "parking",
                    "phone",
                    "website",
                  ] as const
                ).map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      required={k === "name" || k === "slug"}
                      type={k === "website" ? "url" : "text"}
                      pattern={
                        k === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined
                      }
                      value={form[k]}
                      onChange={(e) => update(k, e.target.value)}
                    />
                  </label>
                ))}
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                  >
                    {cats.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Neighborhood
                  <select
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                  >
                    {areas.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Price in MAD per person
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update("price", Number(e.target.value))}
                  />
                </label>
                <label>
                  Image URL
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => update("image", e.target.value)}
                  />
                </label>
                <label>
                  <Upload size={16} /> Upload a photo (max 5 MB)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => void upload(e.target.files?.[0])}
                  />
                </label>
              </div>
              {(["description", "tips"] as const).map((k) => (
                <label key={k}>
                  {k}
                  <textarea
                    required
                    value={form[k]}
                    onChange={(e) => update(k, e.target.value)}
                  />
                </label>
              ))}
              <fieldset>
                <legend>Who is it for?</legend>
                {["Solo", "Couple", "Friends", "Family"].map((a) => (
                  <label key={a} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.audience.includes(a)}
                      onChange={(e) =>
                        update(
                          "audience",
                          e.target.checked
                            ? [...form.audience, a]
                            : form.audience.filter((x) => x !== a),
                        )
                      }
                    />
                    {a}
                  </label>
                ))}
              </fieldset>
              <div className="check-row">
                {(["outdoor", "kid_friendly", "published"] as const).map(
                  (k) => (
                    <label key={k} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={(e) => update(k, e.target.checked)}
                      />
                      {k.replace("_", " ")}
                    </label>
                  ),
                )}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!form.verified_at}
                    onChange={(e) =>
                      update(
                        "verified_at",
                        e.target.checked ? new Date().toISOString() : null,
                      )
                    }
                  />{" "}
                  I have verified these details
                </label>
              </div>
              <div className="actions">
                <Button disabled={busy}>
                  {busy ? "Saving…" : "Save place"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </>
      )}
      {tab === "deals" && (
        <>
          <form className="admin-form" onSubmit={saveDeal}>
            <h2>{dealId ? "Edit offer" : "Add an offer"}</h2>
            <div className="form-grid">
              <label>
                Place
                <select
                  required
                  value={offer.place_id}
                  onChange={(e) =>
                    setOffer({ ...offer, place_id: e.target.value })
                  }
                >
                  <option value="">Choose a place</option>
                  {places
                    .filter((p) => !p.id.startsWith("demo"))
                    .map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              {(
                ["title", "description", "conditions", "expires_at"] as const
              ).map((k) => (
                <label key={k}>
                  {k.replace("_", " ")}
                  <input
                    required
                    type={k === "expires_at" ? "date" : "text"}
                    value={offer[k]}
                    onChange={(e) =>
                      setOffer({ ...offer, [k]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <Button disabled={busy}>{busy ? "Saving…" : "Save offer"}</Button>
          </form>
          <div className="admin-list">
            {deals.map((d) => (
              <article key={d.id}>
                <div>
                  <h3>{d.title}</h3>
                  <p>Expires {d.expires_at}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDealId(d.id);
                    setOffer({
                      place_id: d.place_id,
                      title: d.title,
                      description: d.description,
                      conditions: d.conditions,
                      expires_at: d.expires_at,
                    });
                  }}
                >
                  Edit
                </Button>
                {remove === d.id ? (
                  <>
                    <Button onClick={() => void deleteItem("deals", d.id)}>
                      Confirm delete
                    </Button>
                    <Button variant="ghost" onClick={() => setRemove(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => setRemove(d.id)}>
                    Delete
                  </Button>
                )}
              </article>
            ))}
          </div>
        </>
      )}
      {tab === "reviews" && (
        <div className="admin-list">
          {reviews.length === 0 && <p>No reviews to moderate yet.</p>}
          {reviews.map((r) => (
            <article key={r.id}>
              <div>
                <h3>
                  {places.find((p) => p.id === r.place_id)?.name} · {r.rating}/5
                </h3>
                <p>{r.body}</p>
              </div>
              {remove === r.id ? (
                <>
                  <Button onClick={() => void deleteItem("reviews", r.id)}>
                    Confirm removal
                  </Button>
                  <Button variant="ghost" onClick={() => setRemove(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setRemove(r.id)}>
                  Remove review
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
      {tab === "categories & locations" && (
        <>
          <form className="stack-form taxonomy-form" onSubmit={addTaxonomy}>
            <h2>Organize the catalog</h2>
            <label>
              Type
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setTaxonomyOriginal(null);
                  setTaxonomy("");
                  setRemove(null);
                }}
              >
                <option value="categories">Category</option>
                <option value="neighborhoods">Neighborhood</option>
              </select>
            </label>
            <label>
              Name
              <input
                required
                maxLength={80}
                value={taxonomy}
                onChange={(e) => setTaxonomy(e.target.value)}
              />
            </label>
            <Button>
              {taxonomyOriginal ? "Rename" : "Add"}{" "}
              {kind === "categories" ? "category" : "neighborhood"}
            </Button>
            {taxonomyOriginal && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setTaxonomyOriginal(null);
                  setTaxonomy("");
                }}
              >
                Cancel rename
              </Button>
            )}
          </form>
          <div className="admin-list">
            {(kind === "categories" ? cats : areas).map((c) => (
              <article key={c}>
                <div>{c}</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTaxonomyOriginal(c);
                    setTaxonomy(c);
                  }}
                >
                  Rename
                </Button>
                {remove === `taxonomy:${c}` ? (
                  <>
                    <Button onClick={() => void removeTaxonomy(c)}>
                      Confirm delete
                    </Button>
                    <Button variant="ghost" onClick={() => setRemove(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setRemove(`taxonomy:${c}`)}
                  >
                    Delete
                  </Button>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
