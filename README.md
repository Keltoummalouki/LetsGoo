# LetsGoo

**Discover places. Find experiences. Make plans.**

LetsGoo is a web platform that helps people discover **places, activities, experiences, and good deals** — and get the practical information they need **before they go**.

> **What should we do today? Where should we go? Is it worth it?**

Instead of switching between Google Maps, Instagram, TikTok, and multiple websites, visitors can explore options, compare them, and plan an outing in one place.

**Launch city:** Casablanca, Morocco  
**Long-term vision:** Expand to other Moroccan cities and, eventually, destinations beyond Morocco.

---

## Why LetsGoo?

Finding a place is only part of the decision. Before visiting, people want to know:

- **What can I do there?** What activities and experiences are available?
- **How much will it cost?** Is it free, paid, or discounted? What is the price per person?
- **Who is it for?** Is it suitable for solo visitors, couples, friends, families, or children?
- **When can I go?** What are the opening hours? Is a reservation required?
- **How do I get there?** Is public transport available? Is there parking?
- **What should I know first?** Are there special requirements or useful visitor tips?
- **Is it worth visiting?** What do other visitors say?

**LetsGoo brings these answers together so people can spend less time searching and more time exploring.**

## Who It's For

- Locals looking for something new to do
- Students searching for affordable outings
- Solo visitors, couples, and groups of friends
- Families and people planning activities with children
- Domestic and international tourists
- People who have recently moved to a city

## Discover What To Do

LetsGoo is designed to cover different types of places and experiences, including:

| Explore | Examples |
| --- | --- |
| Entertainment | Cinemas, gaming centers, bowling, escape rooms, karting |
| Outdoors | Parks, beaches, nature spots, outdoor activities |
| Sports & activities | Sports venues, recreational activities, workshops |
| Culture | Museums, galleries, cultural spaces, local experiences |
| Shopping & leisure | Malls, leisure centers, family destinations |
| Hidden gems | Interesting and lesser-known spots |
| Deals | Student discounts, group offers, birthday benefits, promotions |

Events and additional experience types may be introduced as the platform grows.

---

## MVP Features

The first version focuses on the essentials needed to discover and evaluate places. The following describes the **MVP scope**, not a guarantee that every feature is already released.

### 1. Discover Places

Browse places by category and explore available activities. Each place has a dedicated page with the information visitors need to make a decision.

### 2. Search & Filters

Find options based on your plans:

- Category and neighborhood
- Free or paid entry
- Budget and price range
- Solo, couple, friends, or family
- Kid-friendly options
- Indoor or outdoor activities
- Ratings

**Example:** Find games and activities in Aïn Diab for four friends, with a maximum budget of **150 MAD per person**.

### 3. Detailed Place Pages

Place pages can include:

- Name, description, and photos
- Address, neighborhood, and map location
- Available activities
- Entry fees, activity prices, and pricing details
- Opening hours and contact information
- Website and social media links
- Suitability for different types of visitors

### 4. Transportation & Accessibility Information

Help visitors understand how to reach a place, including available information about:

- Tramway and bus access
- Taxi or car access
- Parking availability
- Walking distance from nearby transport stops

### 5. Things to Know Before You Go

Practical tips can make a visit smoother. Examples include:

- Reservations are recommended
- Parking is difficult during busy hours
- Weekends are usually crowded
- Cash-only payment
- Identification is required
- Children must be accompanied by an adult
- Specific equipment or clothing is needed

### 6. Reviews & Comments

Registered users can share ratings, experiences, recommendations, and useful advice.

Comments can also highlight recent changes, for example:

> The price has changed to 120 MAD.

> Parking was full when I visited yesterday.

Visitor-submitted details should be treated as community reports until verified.

### 7. Good Deals

Find offers that make outings more affordable, such as:

- Student and group discounts
- Birthday offers
- Happy hours and free-entry days
- Bank-card promotions
- Promotional codes
- Buy-one-get-one-free offers

Offer conditions and validity dates should be clearly displayed when available.

### 8. Favorites & Authentication

Users can create an account and save places they want to visit later.

### 9. Admin Dashboard

The admin area supports managing and maintaining platform content:

- Places, categories, and locations
- Prices and opening hours
- Transportation and parking details
- Visitor tips and practical information
- Good deals and promotional details
- Reviews and comments

**Initial content strategy:** Places will be added and verified manually by the administrator to establish a trustworthy starting catalog.

### 10. Responsive Experience

The product is designed for mobile, tablet, and desktop, with particular attention to browsing and making decisions on a phone.

---

## Example User Journey

Someone wants to go out with three friends in Casablanca:

| Preference | Selection |
| --- | --- |
| Activity | Games |
| Area | Aïn Diab |
| Group | 4 friends |
| Budget | Up to 150 MAD per person |

LetsGoo displays matching options. After opening a place, the user can review photos, prices, hours, transport options, parking information, reviews, practical tips, and available deals.

The goal is simple: **help the group make a confident choice before leaving home**.

## How LetsGoo Is Different

LetsGoo is **not a replacement for Google Maps**. Maps services are great for locating a place and navigating to it. LetsGoo focuses on the decisions that come **before the visit**:

- What can I actually do there?
- Is it right for my budget and the people I'm going with?
- What's the easiest way to get there?
- What should I prepare or know in advance?
- Are there any offers worth using?

**Our focus: place + activity + budget + people + transport + experience + deals.**

---

## Locations & Languages

### Geographic Scope

**Phase 1 — Casablanca:** Launch with carefully curated neighborhoods, places, activities, and deals in Casablanca, Morocco.

**Future phases — More cities:** Extend the catalog to additional Moroccan cities, with a longer-term possibility of international destinations.

The **LetsGoo brand is city-independent**. Casablanca is the first launch market, not the limit of the product. The initial starter data and available listings are Casablanca-focused.

### Languages

The platform is planned to support:

- **Arabic**
- **French**
- **English**

Language availability may vary by development phase.

---

## Roadmap

### MVP — Foundation

- [ ] Homepage and place discovery
- [ ] Categories, search, and filters
- [ ] Detailed place pages
- [ ] Pricing, opening hours, and transport information
- [ ] Visitor tips and things to know before going
- [ ] Reviews and comments
- [ ] Good deals
- [ ] Authentication and favorites
- [ ] Admin content management
- [ ] Responsive UI

> This checklist represents the target scope; update the checkboxes as features are completed.

### Future Ideas

- Interactive map and location-based discovery
- Personalized recommendations
- **Surprise Me:** Suggest a random activity
- **What Should We Do?:** Generate outing ideas based on budget, group, and preferences
- Day planner and multi-stop itineraries
- Community-created lists and user photos
- Event discovery
- Notifications for relevant deals and activities
- AI-assisted recommendations
- Expansion to more cities

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Authentication | Supabase Auth |
| Image storage | Supabase Storage |

## Getting Started

### Prerequisites

- **Node.js 20.9 or later**
- npm
- A [Supabase](https://supabase.com/) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the Supabase project URL and publishable key using the variable names defined in `.env.example`.

> Never commit `.env.local`, secret keys, or service-role credentials to version control.

### 3. Initialize the database

In the **Supabase SQL Editor**, run these files in order:

1. `supabase/migrations/20260912180000_initial_schema.sql`
2. `supabase/seed.sql`

The seed script provides the starter categories and Casablanca neighborhoods.

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000**.

### 5. Set up an administrator

Create a user in **Supabase Dashboard → Authentication → Users**.

Then, in the **Supabase SQL Editor**, grant that existing user admin access:

```sql
insert into public.admins (user_id)
select id
from auth.users
where email = 'you@example.com';
```

Replace `you@example.com` with the intended administrator's email address. Run this only from the trusted Supabase administration environment, not in client-side application code.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the development server |
| `npm run lint` | Run lint checks |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Create a production build |
| `npm run db:types` | Regenerate database types after linking Supabase |

To link the local project to Supabase before regenerating types:

```bash
npx supabase link
```

## Content Quality & Trust

Practical information can change. LetsGoo aims to make it clear what users can rely on:

- Prioritize manually verified information for the initial catalog.
- Distinguish platform-managed information from user-submitted reviews and comments.
- Display deal conditions and expiration dates where available.
- Keep prices, opening hours, and visitor tips up to date as content is reviewed.
- Use appropriate authorization and Supabase Row Level Security policies for protected data and admin operations.

These are product and engineering principles; information should still be confirmed with a venue when a visit depends on it.

---

## Vision

**LetsGoo helps people turn “What should we do?” into a plan.**

Start with trusted local discovery in Casablanca. Grow into a platform that helps people explore new cities through practical information about **places, activities, budgets, companions, transport, experiences, and good deals**.

**Less searching. More exploring.**
