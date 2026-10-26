import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Exported helpers keep configuration and error handling testable without a network.
export function validateConfig(env) {
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  if (!rawUrl || !key) {
    return {
      error:
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local or the environment.",
    };
  }

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { error: "NEXT_PUBLIC_SUPABASE_URL must be a valid project URL." };
  }
  if (
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" && localHosts.has(url.hostname))
    ) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    return {
      error:
        "Use the project origin with HTTPS (HTTP is allowed only for local Supabase), without credentials, a path, query, or fragment.",
    };
  }

  if (
    key.startsWith("sb_publishable_") &&
    /^[A-Za-z0-9_-]+$/.test(key) &&
    key.length > 20
  ) {
    return { url: url.origin, key, legacyJwt: false };
  }
  try {
    const parts = key.split(".");
    if (
      parts.length !== 3 ||
      !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))
    ) {
      throw new Error("Invalid key format");
    }
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
    if (payload.role === "anon")
      return { url: url.origin, key, legacyJwt: true };
  } catch {
    // Deliberately omit the supplied key and decoder details from diagnostics.
  }
  return {
    error:
      "Use a public publishable key or legacy anon key. Secret, service-role, and signed-in user keys cannot test anonymous access.",
  };
}

export function classifyFailure(status, code) {
  if (["PGRST205", "PGRST204", "42P01", "42703"].includes(code)) {
    return "schema missing or out of date; apply the project migrations";
  }
  if (
    status === 401 ||
    status === 403 ||
    ["42501", "PGRST301", "PGRST302", "PGRST303"].includes(code)
  ) {
    return "anonymous access rejected; check the public key, grants, and RLS policies";
  }
  if (status === 429) return "API rate limit reached; retry later";
  if (status >= 500)
    return "database or API unavailable; retry after checking project health";
  return "unexpected API response; check the project URL and schema";
}

export async function loadEnvironment(env = process.env, root = projectRoot) {
  try {
    const local = parseEnv(await readFile(resolve(root, ".env.local"), "utf8"));
    // Explicit CI / shell variables take precedence over local values.
    return { ...local, ...env };
  } catch (error) {
    if (error.code === "ENOENT") return { ...env };
    throw new Error("Unable to read .env.local; check file access and format.");
  }
}

export async function checkDatabase(
  config,
  { fetchImpl = fetch, now = new Date() } = {},
) {
  const today = now.toISOString().slice(0, 10);
  const checks = [
    {
      table: "categories",
      label: "Categories",
      query: { select: "name" },
      requireRows: true,
    },
    {
      table: "neighborhoods",
      label: "Neighborhoods",
      query: { select: "name" },
      requireRows: true,
    },
    { table: "places", label: "Places", query: { select: "id,published" } },
    { table: "reviews", label: "Reviews", query: { select: "id,place_id" } },
    { table: "deals", label: "Deals", query: { select: "id,expires_at" } },
    {
      table: "places",
      label: "Draft place visibility",
      query: { select: "id", published: "eq.false" },
      mustBeEmpty: true,
    },
    {
      table: "deals",
      label: "Expired deal visibility",
      query: { select: "id", expires_at: `lt.${today}` },
      mustBeEmpty: true,
    },
  ];
  const headers = { apikey: config.key, Accept: "application/json" };
  if (config.legacyJwt) headers.Authorization = `Bearer ${config.key}`;

  return Promise.all(
    checks.map(async (check) => {
      const url = new URL(`/rest/v1/${check.table}`, config.url);
      url.search = new URLSearchParams({
        ...check.query,
        limit: "1",
      }).toString();
      try {
        const response = await fetchImpl(url, {
          method: "GET",
          headers,
          redirect: "error",
          signal: AbortSignal.timeout(15000),
        });
        let body;
        try {
          body = await response.json();
        } catch {
          return {
            label: check.label,
            ok: false,
            detail: classifyFailure(response.status),
          };
        }
        if (!response.ok) {
          return {
            label: check.label,
            ok: false,
            detail: classifyFailure(response.status, body?.code),
          };
        }
        if (!Array.isArray(body)) {
          return {
            label: check.label,
            ok: false,
            detail: "API did not return a catalog result",
          };
        }
        if (check.mustBeEmpty && body.length) {
          return {
            label: check.label,
            ok: false,
            detail:
              "restricted rows are publicly readable; review RLS before launch",
          };
        }
        if (
          check.requireRows &&
          !body.some((row) => typeof row.name === "string" && row.name.trim())
        ) {
          return {
            label: check.label,
            ok: false,
            detail:
              "no starter taxonomy is readable; apply the seed and check select policies",
          };
        }
        return {
          label: check.label,
          ok: true,
          detail: check.mustBeEmpty
            ? "no restricted rows returned"
            : check.requireRows
              ? "readable and populated"
              : "readable",
        };
      } catch (error) {
        return {
          label: check.label,
          ok: false,
          detail:
            error.name === "TimeoutError" || error.name === "AbortError"
              ? "request timed out; check connectivity and project health"
              : "cannot connect; check network access, DNS, TLS, and the project URL",
        };
      }
    }),
  );
}

async function main() {
  console.log("LetsGoo database readiness (anonymous, read-only)");
  let config;
  try {
    config = validateConfig(await loadEnvironment());
  } catch (error) {
    console.error(`FAIL Configuration: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (config.error) {
    console.error(`FAIL Configuration: ${config.error}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    "PASS Configuration: project origin and public key format validated",
  );
  const results = await checkDatabase(config);
  for (const result of results) {
    console.log(
      `${result.ok ? "PASS" : "FAIL"} ${result.label}: ${result.detail}`,
    );
  }
  const failures = results.filter((result) => !result.ok).length;
  console.log(
    failures
      ? `Not ready: ${failures} check(s) failed.`
      : "Catalog readiness checks passed.",
  );
  console.log(
    "These reads do not prove all RLS policies. Authenticated ownership, admin access, and write policies need separate verification.",
  );
  if (failures) process.exitCode = 1;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
