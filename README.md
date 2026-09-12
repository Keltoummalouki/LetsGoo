# Casablanca Project

A web platform to discover **places, activities, experiences, and good deals in Casablanca**.

The goal of Casablanca Project is to help people answer a simple question:

> **What can I do in Casablanca?**

Instead of searching across Google Maps, Instagram, TikTok, and different websites, users can find the practical information they need in one place.

---

## About the Project

Casablanca is a large city with many things to discover:

* Malls
* Cinemas
* Parks
* Games
* Sports
* Entertainment centers
* Cultural places
* Outdoor activities
* Indoor activities
* Hidden places
* Events
* And more

The problem is that discovering a place is not enough.

Before going somewhere for the first time, people usually want to know:

* How much does it cost?
* Is it free or paid?
* What can I do there?
* Is it good for going alone?
* Is it good for couples or friends?
* What are the opening hours?
* How can I get there?
* Is public transport available?
* Is parking available?
* What should I know before going?
* What do other visitors think?
* Are there any discounts or good deals?

**Casablanca Project brings all of this information together in one platform.**

---

## Main Goal

Help people discover Casablanca and make better decisions before visiting a place.

The platform is designed for:

* People living in Casablanca
* Students
* Solo visitors
* Couples
* Groups of friends
* Families
* Moroccan tourists
* International tourists
* People who recently moved to Casablanca

---

## Main Features

### Discover Places

Browse places and activities available around Casablanca.

Examples:

* Malls
* Cinemas
* Parks
* Gaming centers
* Karting
* Bowling
* Escape rooms
* Sports
* Beaches
* Museums
* Workshops
* Cultural places

---

### Search & Filters

Find places based on your needs.

Filters can include:

* Category
* Neighborhood
* Free / Paid
* Price range
* Solo
* Duo
* Friends
* Family
* Kids
* Indoor / Outdoor
* Rating

Example:

> Find activities in Ain Diab for 4 friends under 150 MAD per person.

---

### Place Information

Each place can provide useful information such as:

* Photos
* Description
* Address
* Neighborhood
* Price
* Opening hours
* Phone number
* Website
* Social media
* Google Maps location
* Available activities

---

### Transportation

Help users understand how they can reach a place.

Information can include:

* Tramway
* Bus
* Taxi
* Car
* Parking
* Walking distance

---

### Things to Know Before You Go

Practical information that can improve the visitor's experience.

Examples:

* Reservation is recommended.
* Parking is difficult after 8 PM.
* The place gets crowded during weekends.
* Cash only.
* ID card required.
* Children must be accompanied by an adult.
* Bring socks for the activity.

---

### Reviews & Comments

Users can share their experience after visiting a place.

Reviews can include:

* Rating
* Experience
* Recommendations
* Useful tips

Comments can also provide recent information such as:

> The price changed to 120 MAD.

or:

> I went there yesterday and the parking was full.

---

### Good Deals

Discover offers and benefits available around Casablanca.

Examples:

* Student discounts
* Group discounts
* Birthday offers
* Happy hours
* Free entrance days
* Bank card offers
* Promotional codes
* Buy 1 Get 1 Free

---

### Favorites

Registered users can save places they want to visit later.

---

## Admin Dashboard

The platform includes an administration area where places and content can be managed.

The administrator can:

* Add places
* Edit places
* Delete places
* Manage categories
* Manage locations
* Add prices
* Add opening hours
* Add transportation information
* Add useful tips
* Add good deals
* Manage reviews
* Manage comments

The first places available on the platform will be manually added and verified by the administrator.

---

## Example User Journey

A user wants to do something with three friends.

They choose:

* **Category:** Games
* **Location:** Ain Diab
* **Budget:** Maximum 150 MAD/person
* **Group:** Friends

Casablanca Project shows matching activities.

The user opens a place and can see:

* Photos
* Price
* Opening hours
* Location
* Transportation
* Parking information
* Reviews
* Things to know before going
* Available deals

The user now has enough information to decide whether the place is a good choice.

---

## What Makes Casablanca Project Different?

Casablanca Project is not intended to replace Google Maps.

Google Maps mainly answers:

> **Where is this place?**

Casablanca Project aims to answer:

> **Should I go there?**

> **What can I do there?**

> **How much should I prepare?**

> **Who can I go with?**

> **How do I get there?**

> **What should I know before going?**

The focus is on the **complete experience before visiting a place**.

---

## MVP

The first version of the project will focus on the essential features:

* Homepage
* Places listing
* Categories
* Search
* Filters
* Place details
* Prices
* Opening hours
* Transportation information
* Things to know before going
* Reviews
* Comments
* Good deals
* Favorites
* Authentication
* Admin dashboard
* Responsive design

---

## Future Ideas

Possible future features include:

* Interactive map
* Personalized recommendations
* **Surprise Me** random activity
* **What Should We Do?** activity generator
* Day planner
* Community lists
* User photos
* Events
* Notifications
* AI recommendations

---

## Languages

The platform is planned to support:

* Arabic
* French
* English

---

## Project Scope

The first version focuses exclusively on:

**📍 Casablanca, Morocco**

Other Moroccan cities may be added in future versions.

---

## Vision

The long-term vision is to create a trusted platform for discovering what to do in Casablanca based on:

**Place + Activity + Budget + People + Transport + Experience + Good Deals**

Making it easier to explore the city without going somewhere unprepared.

---

## Getting Started

The app is built with Next.js, TypeScript, Tailwind CSS and shadcn/ui, and uses Supabase for the database, authentication and image storage.

Requirements: Node.js 20.9 or later and a Supabase project.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key.

3. In the Supabase SQL editor, run `supabase/migrations/20260912180000_initial_schema.sql`, then `supabase/seed.sql` for the starter categories and neighborhoods.

4. Start the app and open http://localhost:3000:

   ```bash
   npm run dev
   ```

5. To manage content, create a user (Supabase dashboard → Authentication → Users) and make it an admin from the SQL editor:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

Other commands: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run db:types` to regenerate the database types after linking the project with `npx supabase link`.
