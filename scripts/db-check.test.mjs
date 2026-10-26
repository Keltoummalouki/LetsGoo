import assert from "node:assert/strict";
import { mkdtemp, rmdir, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  checkDatabase,
  classifyFailure,
  loadEnvironment,
  validateConfig,
} from "./db-check.mjs";

const publicKey = "sb_publishable_test_key_not_a_real_credential";
const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
};
const jwt = (role) =>
  `${Buffer.from('{"alg":"HS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;

test("accepts a project origin, local development, and a legacy anonymous key", () => {
  assert.equal(validateConfig(env).url, "https://example.supabase.co");
  assert.equal(
    validateConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    }).error,
    undefined,
  );
  assert.equal(
    validateConfig({
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon"),
    }).legacyJwt,
    true,
  );
});

test("rejects unsafe URL forms without reflecting supplied credentials", () => {
  for (const url of [
    "not a URL",
    "http://example.com",
    "https://user:password@example.com",
    "https://example.com/rest/v1",
    "https://example.com?key=private",
    "https://example.com#token",
    "file:///tmp/project",
  ]) {
    const result = validateConfig({ ...env, NEXT_PUBLIC_SUPABASE_URL: url });
    assert.ok(result.error, url);
    assert.equal(result.error.includes(url), false);
  }
});

test("requires an anonymous key and rejects privileged or user credentials", () => {
  assert.ok(validateConfig({}).error);
  for (const key of [
    "sb_secret_test_secret",
    jwt("service_role"),
    jwt("authenticated"),
    "broken.jwt.key",
  ]) {
    const result = validateConfig({
      ...env,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    });
    assert.ok(result.error);
    assert.equal(result.error.includes(key), false);
  }
});

test("environment variables override local configuration and a missing file is allowed", async () => {
  const root = await mkdtemp(join(tmpdir(), "letsgoo-db-check-"));
  try {
    assert.deepEqual(await loadEnvironment({ CI: "true" }, root), {
      CI: "true",
    });
    await writeFile(
      join(root, ".env.local"),
      'NEXT_PUBLIC_SUPABASE_URL="https://local.example"\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=local-value\n',
    );
    const loaded = await loadEnvironment(
      { NEXT_PUBLIC_SUPABASE_URL: "https://ci.example" },
      root,
    );
    assert.equal(loaded.NEXT_PUBLIC_SUPABASE_URL, "https://ci.example");
    assert.equal(loaded.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "local-value");
  } finally {
    await unlink(join(root, ".env.local")).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    await rmdir(root);
  }
});

test("classifies missing schema, denied access, rate limits, and service failures", () => {
  assert.match(classifyFailure(404, "PGRST205"), /schema/);
  assert.match(classifyFailure(400, "42703"), /schema/);
  assert.match(classifyFailure(401), /anonymous access/);
  assert.match(classifyFailure(403, "42501"), /anonymous access/);
  assert.match(classifyFailure(429), /rate limit/);
  assert.match(classifyFailure(503), /unavailable/);
});

test("only makes bounded anonymous GET requests and detects leaked restricted rows", async () => {
  const config = validateConfig(env);
  const results = await checkDatabase(config, {
    now: new Date("2026-10-26T10:00:00Z"),
    fetchImpl: async (url, options) => {
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "error");
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(url.searchParams.get("limit"), "1");
      let rows = [];
      if (
        url.pathname.endsWith("categories") ||
        url.pathname.endsWith("neighborhoods")
      )
        rows = [{ name: "Starter" }];
      if (url.searchParams.has("published")) rows = [{ id: "hidden-draft" }];
      if (url.searchParams.has("expires_at")) {
        assert.equal(url.searchParams.get("expires_at"), "lt.2026-10-26");
        rows = [{ id: "expired-deal" }];
      }
      return Response.json(rows);
    },
  });
  assert.equal(results.length, 7);
  assert.equal(results.filter((result) => !result.ok).length, 2);
  assert.match(
    results.find((result) => result.label === "Draft place visibility").detail,
    /publicly readable/,
  );
});

test("empty taxonomy and network failures fail safely without revealing raw errors", async () => {
  const config = validateConfig(env);
  const empty = await checkDatabase(config, {
    fetchImpl: async () => Response.json([]),
  });
  assert.equal(empty.filter((result) => !result.ok).length, 2);
  const failed = await checkDatabase(config, {
    fetchImpl: async () => {
      throw new Error("private URL and credential");
    },
  });
  assert.ok(
    failed.every((result) => !result.ok && !result.detail.includes("private")),
  );
});
