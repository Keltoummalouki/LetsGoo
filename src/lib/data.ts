export type Place = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  description: string;
  price: number;
  image: string;
  address: string;
  hours: string;
  transport: string;
  parking: string;
  tips: string;
  audience: string[];
  outdoor: boolean;
  kid_friendly: boolean;
  verified_at: string | null;
  website: string;
  phone: string;
  activities: string;
  published: boolean;
};
export type Deal = {
  id: string;
  place_id: string;
  title: string;
  description: string;
  conditions: string;
  expires_at: string;
};
export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  body: string;
  created_at: string;
};
export const categories = [
  "All places",
  "Outdoors",
  "Culture",
  "Entertainment",
  "Sports & activities",
  "Shopping & leisure",
  "Hidden gems",
];
export const neighborhoods = [
  "Aïn Diab",
  "Anfa",
  "City center",
  "Habous",
  "Bouskoura",
];
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85`;
export const demoPlaces: Place[] = [
  {
    id: "demo-1",
    slug: "an-ocean-afternoon",
    name: "An ocean afternoon",
    category: "Outdoors",
    neighborhood: "Aïn Diab",
    description:
      "A little sea air, a long walk, and no particular rush. An illustrative coastal outing for your Casablanca shortlist.",
    price: 0,
    image: photo("photo-1473116763249-2faaef81ccda"),
    address: "Aïn Diab, Casablanca — sample itinerary",
    hours: "Choose daylight hours; check local access before visiting.",
    transport: "Check the current tram and bus routes to Aïn Diab.",
    parking: "Confirm public parking and charges locally.",
    tips: "Bring sun protection and water. Check sea and weather conditions.",
    audience: ["Solo", "Couple", "Friends", "Family"],
    outdoor: true,
    kid_friendly: true,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Coastal walk, photography, sunset",
    published: true,
  },
  {
    id: "demo-2",
    slug: "a-pause-in-the-city",
    name: "A pause in the city",
    category: "Outdoors",
    neighborhood: "City center",
    description:
      "Swap the busy streets for a slow afternoon under the trees. A sample park outing to help you try the planner.",
    price: 0,
    image: photo("photo-1519331379826-f10be5486c6f"),
    address: "City center, Casablanca — sample outing",
    hours: "Opening hours have not been verified.",
    transport: "Check stops near your chosen park.",
    parking: "Street parking varies.",
    tips: "Bring a picnic and leave the space as you found it.",
    audience: ["Solo", "Couple", "Family"],
    outdoor: true,
    kid_friendly: true,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Picnic, walking, reading",
    published: true,
  },
  {
    id: "demo-3",
    slug: "get-lost-in-the-details",
    name: "Get lost in the details",
    category: "Culture",
    neighborhood: "Habous",
    description:
      "An afternoon of architecture, local craft, and unhurried wandering. This is an illustrative experience, not a verified venue.",
    price: 0,
    image: photo("photo-1539020140153-e479b8c22e70"),
    address: "Habous, Casablanca — sample itinerary",
    hours: "Individual shops and venues set their own hours.",
    transport: "Check current bus routes or arrange a taxi.",
    parking: "Confirm availability locally.",
    tips: "Ask permission before photographing people or private spaces.",
    audience: ["Solo", "Couple", "Friends", "Family"],
    outdoor: true,
    kid_friendly: true,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Architecture, local crafts, photography",
    published: true,
  },
  {
    id: "demo-4",
    slug: "make-it-a-game-night",
    name: "Make it a game night",
    category: "Entertainment",
    neighborhood: "Aïn Diab",
    description:
      "Bring your competitive friends for a few rounds of games. Sample listing with illustrative pricing; no booking is available.",
    price: 120,
    image: photo("photo-1511512578047-dfb367046420"),
    address: "Aïn Diab, Casablanca — sample venue",
    hours: "Example: 14:00–22:00. Not verified.",
    transport: "Confirm the exact venue address before planning your route.",
    parking: "Availability not verified.",
    tips: "Ask about group rates and reserve ahead. Sample price only.",
    audience: ["Couple", "Friends"],
    outdoor: false,
    kid_friendly: false,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Arcade games, group challenges",
    published: true,
  },
  {
    id: "demo-5",
    slug: "a-little-off-the-beaten-path",
    name: "A little off the beaten path",
    category: "Hidden gems",
    neighborhood: "Anfa",
    description:
      "Find a quiet corner, bring a book, and make an afternoon of it. An illustrative café experience for the demo catalog.",
    price: 60,
    image: photo("photo-1501339847302-ac426a4a7cbb"),
    address: "Anfa, Casablanca — sample venue",
    hours: "Confirm hours with your chosen venue.",
    transport: "Choose a café close to your transport route.",
    parking: "Check nearby street parking.",
    tips: "Sample budget includes a drink only. Confirm menu prices.",
    audience: ["Solo", "Couple", "Friends"],
    outdoor: false,
    kid_friendly: false,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Coffee, reading, conversation",
    published: true,
  },
  {
    id: "demo-6",
    slug: "take-the-scenic-route",
    name: "Take the scenic route",
    category: "Sports & activities",
    neighborhood: "Bouskoura",
    description:
      "An easy escape into green space. Try this illustrative outdoor outing as inspiration for your next free afternoon.",
    price: 0,
    image: photo("photo-1441974231531-c6227db76b6e"),
    address: "Bouskoura — sample itinerary",
    hours: "Plan for daylight and verify access.",
    transport: "Plan your return transport in advance.",
    parking: "Confirm designated parking areas.",
    tips: "Wear comfortable shoes. Stay on marked paths.",
    audience: ["Solo", "Friends", "Family"],
    outdoor: true,
    kid_friendly: true,
    verified_at: null,
    website: "",
    phone: "",
    activities: "Walking, light exercise, nature",
    published: true,
  },
];
