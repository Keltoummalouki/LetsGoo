# Development status

The first MVP implementation includes discovery/search/filtering, dedicated place routes, transport/pricing/tips, email/password accounts, persisted favorites, reviews, active offers, and an RLS-protected admin editor with image uploads.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local` if it does not already exist. Set the Supabase URL and public publishable key. Never put a service-role key in a `NEXT_PUBLIC_` variable.
3. Run `supabase/migrations/20260912180000_initial_schema.sql` and then `supabase/seed.sql` in the Supabase SQL editor. The migration is intended to run once on a fresh project.
4. In Supabase Authentication URL Configuration, set Site URL to `http://localhost:3000` and allow `http://localhost:3000/account` as a redirect URL (replace with your production origin for deployment).
5. Enable email/password sign-in. Configure email confirmation and an email provider for production delivery.
6. `npm run dev`
7. Create an account, confirm its email if required, and grant admin access using the SQL in README.md. Then refresh the page and open `/admin`.
8. Add real places as drafts, upload photos, verify facts, and publish. Add offers with conditions and expiration dates.

## Honest demo behavior

Without a reachable, initialized Supabase catalog, the app shows clearly labeled sample itineraries. They are not real venue listings and cannot receive saved favorites or reviews. A successfully connected empty database shows an empty catalog so an admin can populate it. Stock photos are illustrative; administrators should provide appropriate venue photos before publishing.

## Verification

`npm run typecheck`, `npm run lint`, and `npm run build`.

Manual connected smoke test: register two users; grant one admin access; add draft and published places; confirm anonymous visitors only see published entries; save and review as the regular user; confirm a second regular user cannot modify those favorites/reviews; add an active and an expired offer; verify only the active offer is public; upload an allowed image; confirm a non-admin cannot manage the catalog.

Database migrations are supplied, not automatically applied. Running the app does not initialize or mutate the remote schema. Browser UI guards are only convenience; Supabase Row Level Security is the authorization boundary.

## Remaining launch work

- Apply and verify the schema against your Supabase project; test real email delivery and admin assignment.
- Populate a verified Casablanca catalog, including accurate hours, pricing, addresses, and original/licensed photos.
- Add French/Arabic translations and RTL support in a subsequent phase, as allowed by the brief.
- Set production deployment, domain, email delivery, privacy policy, monitoring, and backups before public launch.

## Assets

DM Sans is self-hosted from Google Fonts (SIL Open Font License). Sample photos are served from Unsplash, with source URLs in `src/lib/data.ts` and `src/app/page.tsx`. They are not evidence of venue appearance or location.

## Dependency audit
The initial npm audit reports five high-severity entries in the development-only eslint-config-next → fast-glob → micromatch → braces chain (GHSA-vfj7-8cjw-p6xm). npm proposes an incompatible framework lint-config downgrade; it has not been applied. Runtime dependencies should be checked separately with npm audit --omit=dev before deployment.

The production dependency audit completed with zero vulnerabilities. Dependency versions are pinned to the successfully tested installation.
