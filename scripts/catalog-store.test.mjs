import assert from "node:assert/strict";
import test from "node:test";
import { CatalogStore } from "../src/lib/catalog-store.ts";

const settle = () => new Promise((resolve) => setImmediate(resolve));
const accountA = { id: "account-a", email: "a@example.test" };
const accountB = { id: "account-b", email: "b@example.test" };
const samples = [{ id: "sample-place", name: "Sample place" }];
const place = (id, published = true) => ({ id, name: id, published });
const ok = (data) => ({ data, error: null });
const failed = () => ({ data: null, error: { message: "Request failed" } });

// A fluent thenable models Supabase requests while letting each test choose
// completion order. Only explicit calls resolve; there is no network or timer.
function fakeSupabase() {
  const requests = [];
  let authCallback;
  let unsubscribed = false;
  const client = {
    auth: {
      onAuthStateChange(callback) {
        authCallback = callback;
        unsubscribed = false;
        return {
          data: {
            subscription: {
              unsubscribe() {
                unsubscribed = true;
                authCallback = undefined;
              },
            },
          },
        };
      },
    },
    from(table) {
      let resolveRequest;
      let rejectRequest;
      const promise = new Promise((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
      });
      const request = {
        table,
        operation: "select",
        filters: [],
        claimed: false,
        resolve: resolveRequest,
        reject: rejectRequest,
        select(columns) {
          this.columns = columns;
          return this;
        },
        order() {
          return this;
        },
        eq(column, value) {
          this.filters.push([column, value]);
          return this;
        },
        maybeSingle() {
          return this;
        },
        insert(payload) {
          this.operation = "insert";
          this.payload = payload;
          return this;
        },
        delete() {
          this.operation = "delete";
          return this;
        },
        then(onFulfilled, onRejected) {
          return promise.then(onFulfilled, onRejected);
        },
      };
      requests.push(request);
      return request;
    },
  };
  function take(table, operation = "select", userId) {
    const request = requests.find(
      (candidate) =>
        !candidate.claimed &&
        candidate.table === table &&
        candidate.operation === operation &&
        (!userId ||
          candidate.filters.some(
            ([column, value]) => column === "user_id" && value === userId,
          )),
    );
    assert.ok(
      request,
      `Expected ${operation} request for ${table}${userId ? ` / ${userId}` : ""}`,
    );
    request.claimed = true;
    return request;
  }
  return {
    client,
    requests,
    take,
    get unsubscribed() {
      return unsubscribed;
    },
    emit(user) {
      authCallback?.(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { user } : null);
    },
  };
}

function setup(t) {
  const fake = fakeSupabase();
  const store = new CatalogStore(fake.client, samples);
  const stop = store.start();
  t.after(stop);
  return { fake, store, stop };
}

async function session(fake, user) {
  fake.emit(user);
  await settle();
  return {
    places: fake.take("places"),
    deals: fake.take("deals"),
    reviews: fake.take("reviews"),
    ...(user && {
      admins: fake.take("admins", "select", user.id),
      favorites: fake.take("favorites", "select", user.id),
    }),
  };
}

function resolveCatalog(batch, places = [place("public-place")]) {
  batch.places.resolve(ok(places));
  batch.deals.resolve(ok([]));
  batch.reviews.resolve(ok([]));
}

function resolveAccount(batch, { admin = false, saved = [] } = {}) {
  batch.admins.resolve(ok(admin ? { user_id: "admin-user" } : null));
  batch.favorites.resolve(ok(saved.map((place_id) => ({ place_id }))));
}

test("late account A and signed-out responses cannot replace account B", async (t) => {
  const { fake, store } = setup(t);
  const first = await session(fake, accountA);
  const signedOut = await session(fake, null);
  const second = await session(fake, accountB);
  resolveCatalog(second, [place("b-place")]);
  resolveAccount(second, { saved: ["b-place"] });
  await settle();
  const current = store.getSnapshot();

  resolveAccount(first, { admin: true, saved: ["a-secret"] });
  resolveCatalog(first, [place("a-draft", false)]);
  resolveCatalog(signedOut, [place("anonymous-place")]);
  await settle();

  assert.equal(
    store.getSnapshot(),
    current,
    "stale results must not publish a new snapshot",
  );
  assert.equal(current.user.id, accountB.id);
  assert.equal(current.admin, false);
  assert.deepEqual(current.saved, ["b-place"]);
  assert.deepEqual(
    current.places.map(({ id }) => id),
    ["b-place"],
  );
});

test("sign-out immediately clears privileged catalog and account data", async (t) => {
  const { fake, store } = setup(t);
  const first = await session(fake, accountA);
  resolveCatalog(first, [place("draft", false)]);
  resolveAccount(first, { admin: true, saved: ["draft"] });
  await settle();
  assert.equal(store.getSnapshot().admin, true);

  fake.emit(null);
  const signedOut = store.getSnapshot();
  assert.equal(signedOut.user, null);
  assert.equal(signedOut.admin, false);
  assert.deepEqual(signedOut.places, []);
  assert.deepEqual(signedOut.deals, []);
  assert.deepEqual(signedOut.reviews, []);
  assert.deepEqual(signedOut.saved, []);
  assert.deepEqual(signedOut.pendingSaves, []);
  assert.equal(signedOut.loading, true);
  assert.equal(signedOut.authLoading, false);
  assert.equal(signedOut.savedLoading, false);
  await settle();
  resolveCatalog({
    places: fake.take("places"),
    deals: fake.take("deals"),
    reviews: fake.take("reviews"),
  });
  await settle();
  assert.deepEqual(
    store.getSnapshot().places.map(({ id }) => id),
    ["public-place"],
  );
});

test("rapid duplicate saves issue one write, then a later toggle deletes the saved place", async (t) => {
  const { fake, store } = setup(t);
  const batch = await session(fake, accountA);
  resolveCatalog(batch);
  resolveAccount(batch);
  await settle();

  const firstSave = store.toggleSave("public-place");
  await store.toggleSave("public-place");
  const insert = fake.take("favorites", "insert");
  assert.deepEqual(insert.payload, {
    user_id: accountA.id,
    place_id: "public-place",
  });
  assert.equal(
    fake.requests.filter(({ operation }) => operation === "insert").length,
    1,
  );
  assert.deepEqual(store.getSnapshot().pendingSaves, ["public-place"]);
  insert.resolve(ok(null));
  await firstSave;
  assert.deepEqual(store.getSnapshot().saved, ["public-place"]);
  assert.deepEqual(store.getSnapshot().pendingSaves, []);

  const remove = store.toggleSave("public-place");
  const deletion = fake.take("favorites", "delete", accountA.id);
  assert.ok(
    deletion.filters.some(
      ([column, value]) => column === "place_id" && value === "public-place",
    ),
  );
  deletion.resolve(ok(null));
  await remove;
  assert.deepEqual(store.getSnapshot().saved, []);
});

test("an old-session save cannot mutate account B or clear its pending save", async (t) => {
  const { fake, store } = setup(t);
  const first = await session(fake, accountA);
  resolveCatalog(first);
  resolveAccount(first);
  await settle();
  const oldSave = store.toggleSave("public-place");
  const oldWrite = fake.take("favorites", "insert");

  const second = await session(fake, accountB);
  resolveCatalog(second);
  resolveAccount(second);
  await settle();
  const newSave = store.toggleSave("public-place");
  const newWrite = fake.take("favorites", "insert");
  assert.equal(newWrite.payload.user_id, accountB.id);
  const current = store.getSnapshot();

  oldWrite.resolve(failed());
  await oldSave;
  assert.equal(store.getSnapshot(), current);
  assert.deepEqual(store.getSnapshot().pendingSaves, ["public-place"]);
  assert.deepEqual(store.getSnapshot().saved, []);
  assert.equal(store.getSnapshot().notice, "");

  newWrite.resolve(ok(null));
  await newSave;
  assert.deepEqual(store.getSnapshot().saved, ["public-place"]);
  assert.deepEqual(store.getSnapshot().pendingSaves, []);
});

test("partial catalog failures remain visible while successful live data is retained", async (t) => {
  const { fake, store } = setup(t);
  const batch = await session(fake, null);
  const reviews = [{ id: "review-1", place_id: "live-place", rating: 5 }];
  batch.places.resolve(ok([place("live-place")]));
  batch.deals.resolve(failed());
  batch.reviews.resolve(ok(reviews));
  await settle();

  const state = store.getSnapshot();
  assert.equal(state.demo, false);
  assert.equal(state.loading, false);
  assert.deepEqual(
    state.places.map(({ id }) => id),
    ["live-place"],
  );
  assert.deepEqual(state.reviews, reviews);
  assert.deepEqual(state.deals, []);
  assert.match(state.catalogError, /offers/);
});

test("a real empty catalog remains empty rather than switching to sample mode", async (t) => {
  const { fake, store } = setup(t);
  const batch = await session(fake, null);
  resolveCatalog(batch, []);
  await settle();
  assert.deepEqual(store.getSnapshot().places, []);
  assert.equal(store.getSnapshot().demo, false);
  assert.equal(store.getSnapshot().loading, false);
  assert.equal(store.getSnapshot().catalogError, "");
});

test("account loading lasts until both reads settle and failed access blocks saves", async (t) => {
  const { fake, store } = setup(t);
  const batch = await session(fake, accountA);
  resolveCatalog(batch);
  batch.admins.resolve(failed());
  await settle();
  assert.equal(store.getSnapshot().authLoading, true);
  assert.equal(store.getSnapshot().savedLoading, true);
  await store.toggleSave("public-place");
  assert.equal(
    fake.requests.filter(({ operation }) => operation === "insert").length,
    0,
  );

  batch.favorites.resolve(ok([{ place_id: "existing-favorite" }]));
  await settle();
  assert.equal(store.getSnapshot().authLoading, false);
  assert.equal(store.getSnapshot().savedLoading, false);
  assert.equal(store.getSnapshot().admin, false);
  assert.deepEqual(store.getSnapshot().saved, ["existing-favorite"]);
  assert.match(
    store.getSnapshot().accountError,
    /account access or saved places/,
  );
  await store.toggleSave("public-place");
  assert.equal(
    fake.requests.filter(({ operation }) => operation === "insert").length,
    0,
  );
});

test("cleanup unsubscribes and ignores in-flight catalog and account results", async (t) => {
  const { fake, store, stop } = setup(t);
  const batch = await session(fake, accountA);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications += 1;
  });
  t.after(unsubscribe);
  stop();
  assert.equal(fake.unsubscribed, true);
  const stopped = store.getSnapshot();
  resolveCatalog(batch, [place("late-private", false)]);
  resolveAccount(batch, { admin: true, saved: ["late-private"] });
  fake.emit(accountB);
  await settle();
  assert.equal(store.getSnapshot(), stopped);
  assert.equal(notifications, 0);
});
