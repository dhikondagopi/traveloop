// Smart rule-based trip generator. Pure functions — no side effects.
// Used by the AI Trip Planner, the Smart Checklist Generator, and the
// Trip Readiness scoring on the trip overview.

export type TravelStyle = "budget" | "comfort" | "luxury";
export type Interest =
  | "food"
  | "adventure"
  | "nature"
  | "shopping"
  | "culture"
  | "relaxation";

export type TripType = "beach" | "mountain" | "city" | "international" | "adventure" | "family";

export interface GenerateInput {
  destination: string;
  days: number;
  budget: number;
  style: TravelStyle;
  travelers: number;
  interests: Interest[];
  startDate?: string;
  tripType?: TripType;
}

interface CityData {
  name: string;
  country: string;
  region: string;
  cover: string;
  vibes: Interest[];
  costIndex: number; // 1 cheap → 5 lux
}

const CITY_BANK: CityData[] = [
  // Europe
  { name: "Paris", country: "France", region: "europe", vibes: ["food", "culture", "shopping"], costIndex: 4, cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600" },
  { name: "Rome", country: "Italy", region: "europe", vibes: ["food", "culture"], costIndex: 3, cover: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600" },
  { name: "Florence", country: "Italy", region: "europe", vibes: ["culture", "food"], costIndex: 3, cover: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1600" },
  { name: "Venice", country: "Italy", region: "europe", vibes: ["culture", "relaxation"], costIndex: 3, cover: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1600" },
  { name: "Barcelona", country: "Spain", region: "europe", vibes: ["food", "culture", "relaxation"], costIndex: 3, cover: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600" },
  { name: "Lisbon", country: "Portugal", region: "europe", vibes: ["food", "culture"], costIndex: 2, cover: "https://images.unsplash.com/photo-1513735492246-483525079686?w=1600" },
  { name: "Amsterdam", country: "Netherlands", region: "europe", vibes: ["culture", "shopping"], costIndex: 4, cover: "https://images.unsplash.com/photo-1534351590666-13e3e96c5017?w=1600" },
  { name: "Interlaken", country: "Switzerland", region: "europe", vibes: ["nature", "adventure"], costIndex: 5, cover: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1600" },
  // Asia
  { name: "Tokyo", country: "Japan", region: "asia", vibes: ["food", "culture", "shopping"], costIndex: 4, cover: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600" },
  { name: "Kyoto", country: "Japan", region: "asia", vibes: ["culture", "nature", "relaxation"], costIndex: 3, cover: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600" },
  { name: "Bangkok", country: "Thailand", region: "asia", vibes: ["food", "shopping", "culture"], costIndex: 1, cover: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600" },
  { name: "Phuket", country: "Thailand", region: "asia", vibes: ["relaxation", "nature"], costIndex: 2, cover: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1600" },
  { name: "Bali", country: "Indonesia", region: "asia", vibes: ["relaxation", "nature", "adventure"], costIndex: 2, cover: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600" },
  { name: "Singapore", country: "Singapore", region: "asia", vibes: ["food", "shopping", "culture"], costIndex: 4, cover: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600" },
  // India
  { name: "Goa", country: "India", region: "india", vibes: ["relaxation", "food"], costIndex: 1, cover: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600" },
  { name: "Jaipur", country: "India", region: "india", vibes: ["culture", "shopping"], costIndex: 1, cover: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600" },
  { name: "Manali", country: "India", region: "india", vibes: ["nature", "adventure"], costIndex: 1, cover: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600" },
  { name: "Udaipur", country: "India", region: "india", vibes: ["culture", "relaxation"], costIndex: 1, cover: "https://images.unsplash.com/photo-1568871391758-bc26f6c0bdaf?w=1600" },
  // Americas
  { name: "New York", country: "USA", region: "americas", vibes: ["food", "shopping", "culture"], costIndex: 5, cover: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600" },
  { name: "San Francisco", country: "USA", region: "americas", vibes: ["food", "culture"], costIndex: 5, cover: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600" },
  { name: "Cusco", country: "Peru", region: "americas", vibes: ["adventure", "culture", "nature"], costIndex: 2, cover: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600" },
  { name: "Rio de Janeiro", country: "Brazil", region: "americas", vibes: ["relaxation", "nature", "culture"], costIndex: 3, cover: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600" },
  // Middle East / Africa
  { name: "Dubai", country: "UAE", region: "middle-east", vibes: ["shopping", "adventure", "relaxation"], costIndex: 5, cover: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600" },
  { name: "Cape Town", country: "South Africa", region: "africa", vibes: ["nature", "adventure", "food"], costIndex: 2, cover: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600" },
  { name: "Marrakech", country: "Morocco", region: "africa", vibes: ["culture", "shopping", "food"], costIndex: 2, cover: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1600" },
];

interface ActivityTemplate {
  title: string;
  description: string;
  category: "food" | "adventure" | "nature" | "shopping" | "culture" | "relaxation" | "transport";
  cost: number; // base, scales with style
  duration: string;
  start_time: string;
}

const ACTIVITY_BANK: ActivityTemplate[] = [
  { title: "Local food walking tour", description: "Sample street food and hidden gems with a local guide.", category: "food", cost: 35, duration: "3h", start_time: "11:00" },
  { title: "Sunset dinner experience", description: "Dine at a top-rated spot with a view.", category: "food", cost: 60, duration: "2h", start_time: "19:30" },
  { title: "Cooking class with locals", description: "Learn to cook the region's signature dish.", category: "food", cost: 70, duration: "3h", start_time: "16:00" },

  { title: "Old town walking tour", description: "Explore the historic center with an expert guide.", category: "culture", cost: 25, duration: "2h", start_time: "10:00" },
  { title: "Museum & art gallery visit", description: "Spend the afternoon at the city's flagship museum.", category: "culture", cost: 20, duration: "3h", start_time: "14:00" },
  { title: "Live music & local nightlife", description: "Catch live performances at a beloved venue.", category: "culture", cost: 30, duration: "3h", start_time: "21:00" },

  { title: "Day hike with panoramic views", description: "A guided trek to a stunning viewpoint.", category: "adventure", cost: 45, duration: "5h", start_time: "08:00" },
  { title: "Kayak / paddleboard session", description: "Get on the water for a few unforgettable hours.", category: "adventure", cost: 55, duration: "3h", start_time: "09:00" },
  { title: "Sunrise hot-air balloon", description: "Float above the landscape at golden hour.", category: "adventure", cost: 180, duration: "3h", start_time: "05:30" },

  { title: "National park day trip", description: "Wildlife, waterfalls, and trails just outside the city.", category: "nature", cost: 50, duration: "6h", start_time: "08:30" },
  { title: "Botanical gardens stroll", description: "A relaxed walk through curated green spaces.", category: "nature", cost: 8, duration: "2h", start_time: "10:00" },
  { title: "Scenic viewpoint sunset", description: "Watch the sun dip from the city's best vantage.", category: "nature", cost: 0, duration: "1h", start_time: "18:30" },

  { title: "Local market & shopping run", description: "Hunt for souvenirs and handmade gifts.", category: "shopping", cost: 40, duration: "2h", start_time: "11:00" },
  { title: "Boutique district stroll", description: "Browse independent shops and design stores.", category: "shopping", cost: 50, duration: "2h", start_time: "15:00" },

  { title: "Spa & wellness afternoon", description: "Unwind with a signature treatment.", category: "relaxation", cost: 90, duration: "2h", start_time: "15:00" },
  { title: "Beach / pool day", description: "A slow day soaking in the sun.", category: "relaxation", cost: 15, duration: "5h", start_time: "11:00" },
  { title: "Sunset cruise", description: "A chilled-out boat ride at golden hour.", category: "relaxation", cost: 65, duration: "2h", start_time: "18:00" },
];

const STYLE_MULT: Record<TravelStyle, number> = { budget: 0.7, comfort: 1, luxury: 1.7 };
const STAY_PER_NIGHT: Record<TravelStyle, number> = { budget: 35, comfort: 95, luxury: 240 };
const FOOD_PER_DAY: Record<TravelStyle, number> = { budget: 20, comfort: 45, luxury: 120 };
const TRANSPORT_INTRA: Record<TravelStyle, number> = { budget: 8, comfort: 20, luxury: 50 };

function pickCities(input: GenerateInput): CityData[] {
  const q = input.destination.trim().toLowerCase();
  // Direct match by name or country
  const direct = CITY_BANK.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  );
  let pool = direct.length ? direct : CITY_BANK.filter((c) => c.region === q || q.includes(c.region));
  if (!pool.length) {
    // Score by interest match
    pool = [...CITY_BANK].sort((a, b) => {
      const sa = a.vibes.filter((v) => input.interests.includes(v)).length;
      const sb = b.vibes.filter((v) => input.interests.includes(v)).length;
      return sb - sa;
    });
  }
  // Style ↔ cost filter (relaxed)
  if (input.style === "budget") pool = pool.filter((c) => c.costIndex <= 3).concat(pool);
  if (input.style === "luxury") pool = pool.filter((c) => c.costIndex >= 3).concat(pool);

  const stops = Math.min(Math.max(1, Math.ceil(input.days / 4)), 4);
  const seen = new Set<string>();
  const out: CityData[] = [];
  for (const c of pool) {
    if (seen.has(c.name)) continue;
    seen.add(c.name);
    out.push(c);
    if (out.length >= stops) break;
  }
  if (!out.length) out.push(CITY_BANK[0]);
  return out;
}

function pickActivities(city: CityData, perDay: number, interests: Interest[], style: TravelStyle): ActivityTemplate[] {
  // Score activities: matches interest +3, matches city vibe +1
  const scored = ACTIVITY_BANK.map((a) => {
    let s = 0;
    if (interests.includes(a.category as Interest)) s += 3;
    if (city.vibes.includes(a.category as Interest)) s += 1;
    return { a, s };
  }).sort((x, y) => y.s - x.s);

  const total = perDay;
  const picked: ActivityTemplate[] = [];
  let i = 0;
  while (picked.length < total && i < scored.length * 3) {
    const cand = scored[i % scored.length].a;
    if (!picked.find((p) => p.title === cand.title)) {
      picked.push({ ...cand, cost: Math.round(cand.cost * STYLE_MULT[style]) });
    }
    i++;
  }
  return picked;
}

export interface GeneratedPlan {
  trip: {
    name: string;
    description: string;
    cover_image: string;
    start_date: string | null;
    end_date: string | null;
    planned_budget: number;
    estimated_cost: number;
  };
  stops: {
    city: string;
    country: string;
    start_date: string | null;
    end_date: string | null;
    notes: string;
    activities: { title: string; description: string; category: string; cost: number; duration: string; start_time: string; }[];
  }[];
  budget: { category: string; title: string; amount: number; note: string }[];
  checklist: { title: string; category: string }[];
  notes: { title: string; content: string }[];
  tripType: TripType;
}

function detectTripType(input: GenerateInput, cities: CityData[]): TripType {
  const dest = input.destination.toLowerCase();
  if (input.travelers >= 3) return "family";
  if (input.interests.includes("adventure")) return "adventure";
  if (input.interests.includes("relaxation") && (dest.includes("beach") || cities.some((c) => c.vibes.includes("relaxation")))) return "beach";
  if (cities.some((c) => /interlaken|manali|cusco/i.test(c.name))) return "mountain";
  // International if cities are not all in same country and not domestic
  const sameCountry = cities.every((c) => c.country === cities[0].country);
  if (!sameCountry) return "international";
  return "city";
}

export function generateChecklist(tripType: TripType): { title: string; category: string }[] {
  const base = [
    { title: "Passport / ID", category: "Documents" },
    { title: "Travel insurance", category: "Documents" },
    { title: "Phone charger & adapter", category: "Tech" },
    { title: "Toiletries kit", category: "Toiletries" },
    { title: "Reusable water bottle", category: "Essentials" },
    { title: "Power bank", category: "Tech" },
    { title: "Comfortable walking shoes", category: "Clothing" },
  ];
  const extra: Record<TripType, { title: string; category: string }[]> = {
    beach: [
      { title: "Swimwear (x2)", category: "Clothing" },
      { title: "Sunscreen SPF 50+", category: "Toiletries" },
      { title: "Beach towel & flip-flops", category: "Essentials" },
      { title: "Sunglasses & hat", category: "Essentials" },
      { title: "Snorkel mask", category: "Gear" },
    ],
    mountain: [
      { title: "Insulated jacket", category: "Clothing" },
      { title: "Hiking boots", category: "Clothing" },
      { title: "Thermal layers", category: "Clothing" },
      { title: "Trekking poles", category: "Gear" },
      { title: "First-aid kit", category: "Health" },
      { title: "Headlamp", category: "Gear" },
    ],
    city: [
      { title: "Day backpack", category: "Essentials" },
      { title: "Smart casual outfit", category: "Clothing" },
      { title: "Public transit card / app", category: "Tech" },
      { title: "Foldable umbrella", category: "Essentials" },
    ],
    international: [
      { title: "Visa documents", category: "Documents" },
      { title: "Local currency / forex card", category: "Money" },
      { title: "International SIM / eSIM", category: "Tech" },
      { title: "Vaccination certificate", category: "Health" },
      { title: "Plug adapter (region-specific)", category: "Tech" },
    ],
    adventure: [
      { title: "Quick-dry clothing", category: "Clothing" },
      { title: "Energy bars / snacks", category: "Essentials" },
      { title: "Action camera", category: "Gear" },
      { title: "Personal first-aid kit", category: "Health" },
      { title: "Dry bag", category: "Gear" },
    ],
    family: [
      { title: "Snacks for kids", category: "Family" },
      { title: "Entertainment (books / tablet)", category: "Family" },
      { title: "Extra clothes per person", category: "Clothing" },
      { title: "Kids medication", category: "Health" },
      { title: "Stroller / baby carrier", category: "Family" },
    ],
  };
  return [...base, ...extra[tripType]];
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function generatePlan(input: GenerateInput): GeneratedPlan {
  const cities = pickCities(input);
  const days = Math.max(1, Math.floor(input.days));
  const stopsCount = cities.length;
  const baseDays = Math.floor(days / stopsCount);
  const remainder = days % stopsCount;
  const tripType = input.tripType ?? detectTripType(input, cities);

  let cursor = input.startDate || null;
  const perDayActivities = input.style === "luxury" ? 3 : input.style === "budget" ? 2 : 2;

  const stops = cities.map((c, idx) => {
    const stopDays = baseDays + (idx < remainder ? 1 : 0);
    const start = cursor;
    const end = start ? addDays(start, Math.max(0, stopDays - 1)) : null;
    if (cursor) cursor = addDays(cursor, stopDays);

    const activities: GeneratedPlan["stops"][number]["activities"] = [];
    for (let d = 0; d < stopDays; d++) {
      const picks = pickActivities(c, perDayActivities, input.interests, input.style);
      picks.forEach((a) => activities.push(a));
    }
    return {
      city: c.name,
      country: c.country,
      start_date: start,
      end_date: end,
      notes: `Explore ${c.name} — ${stopDays} day${stopDays > 1 ? "s" : ""} of ${input.interests.slice(0, 2).join(" & ") || "discovery"}.`,
      activities,
    };
  });

  // Budget items
  const t = input.travelers;
  const flightPerPerson = tripType === "international" ? 600 : 200;
  const stayTotal = STAY_PER_NIGHT[input.style] * days * Math.ceil(t / 2);
  const foodTotal = FOOD_PER_DAY[input.style] * days * t;
  const transportTotal = TRANSPORT_INTRA[input.style] * days * t + 40 * Math.max(0, stopsCount - 1) * t;
  const activityTotal = stops.reduce((s, st) => s + st.activities.reduce((a, x) => a + x.cost, 0), 0) * t;
  const shoppingTotal = input.interests.includes("shopping") ? 50 * days * (input.style === "luxury" ? 3 : 1) : 30 * Math.ceil(days / 2);

  const budget = [
    { category: "Transport", title: `Flights (${t}× pax)`, amount: flightPerPerson * t, note: "Round-trip estimate" },
    { category: "Stay", title: `${input.style} accommodation (${days} nights)`, amount: stayTotal, note: "" },
    { category: "Meals", title: "Food & drinks", amount: foodTotal, note: "" },
    { category: "Transport", title: "Local transport", amount: transportTotal, note: "" },
    { category: "Activities", title: "Tours & experiences", amount: activityTotal, note: "" },
    { category: "Shopping", title: "Shopping & souvenirs", amount: shoppingTotal, note: "" },
  ];

  const estimatedCost = budget.reduce((s, b) => s + b.amount, 0);

  const checklist = generateChecklist(tripType);

  const notes = [
    {
      title: "AI-generated trip overview",
      content: `${days}-day ${tripType} trip for ${t} traveler${t > 1 ? "s" : ""} with a ${input.style} style. Focus: ${input.interests.join(", ") || "general"}. Estimated cost: $${estimatedCost.toLocaleString()}. Adjust the itinerary, swap activities, or move stops as needed.`,
    },
    {
      title: "Booking checklist",
      content: "1. Lock in flights early for the best price.\n2. Book accommodation with free cancellation when possible.\n3. Pre-book signature experiences (cooking class, cruises, popular tours).\n4. Confirm visa, insurance and vaccination requirements 6+ weeks out.",
    },
  ];

  const heroCity = cities[0];
  const tripName =
    cities.length === 1
      ? `${days} days in ${heroCity.name}`
      : `${cities.map((c) => c.name).join(" → ")}`;

  return {
    trip: {
      name: tripName,
      description: `A ${days}-day ${input.style} trip across ${cities.map((c) => c.name).join(", ")}.`,
      cover_image: heroCity.cover,
      start_date: input.startDate || null,
      end_date: input.startDate ? addDays(input.startDate, days - 1) : null,
      planned_budget: input.budget,
      estimated_cost: estimatedCost,
    },
    stops,
    budget,
    checklist,
    notes,
    tripType,
  };
}

// ----- Budget Optimizer -----

export interface BudgetInsights {
  planned: number;
  spent: number;
  remaining: number;
  perDay: number;
  healthScore: number; // 0-100
  health: "excellent" | "good" | "warning" | "over";
  byCategory: { category: string; amount: number; pct: number }[];
  suggestions: string[];
}

export function analyzeBudget(opts: {
  planned: number;
  items: { category: string; amount: number }[];
  days: number;
}): BudgetInsights {
  const spent = opts.items.reduce((s, i) => s + Number(i.amount), 0);
  const planned = Math.max(0, opts.planned);
  const remaining = planned - spent;
  const perDay = spent / Math.max(1, opts.days);

  let healthScore = 100;
  if (planned > 0) {
    const ratio = spent / planned;
    if (ratio <= 0.6) healthScore = 100;
    else if (ratio <= 0.85) healthScore = 85;
    else if (ratio <= 1) healthScore = 65;
    else if (ratio <= 1.15) healthScore = 35;
    else healthScore = 10;
  } else {
    healthScore = 50;
  }
  const health: BudgetInsights["health"] =
    healthScore >= 85 ? "excellent" : healthScore >= 60 ? "good" : healthScore >= 30 ? "warning" : "over";

  const cats = new Map<string, number>();
  for (const i of opts.items) {
    cats.set(i.category, (cats.get(i.category) || 0) + Number(i.amount));
  }
  const byCategory = Array.from(cats.entries())
    .map(([category, amount]) => ({ category, amount, pct: spent ? (amount / spent) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const suggestions: string[] = [];
  if (planned && spent > planned) {
    suggestions.push(`You're $${(spent - planned).toLocaleString()} over budget — trim discretionary categories first.`);
  }
  const top = byCategory[0];
  if (top && top.pct > 45) {
    suggestions.push(`${top.category} is ${top.pct.toFixed(0)}% of spend. Consider switching to a lower-cost option.`);
  }
  const stay = byCategory.find((c) => c.category === "Stay");
  if (stay && stay.pct > 35) suggestions.push("Use a budget stay (hostel / Airbnb private room) to save up to 40% on accommodation.");
  const transport = byCategory.find((c) => c.category === "Transport");
  if (transport && transport.pct > 30) suggestions.push("Choose public transport instead of private cabs to cut transport costs in half.");
  const shopping = byCategory.find((c) => c.category === "Shopping");
  if (shopping && shopping.pct > 15) suggestions.push("Reduce the shopping budget — set a hard cap per stop.");
  const meals = byCategory.find((c) => c.category === "Meals");
  if (meals && meals.pct > 35) suggestions.push("Mix in local street food and supermarket breakfasts to lower meal spend.");
  if (perDay > 250 && opts.days > 0) suggestions.push("Average daily spend is high — consider a free-activity day to balance the trip.");
  if (!suggestions.length) suggestions.push("Budget looks healthy. Keep tracking — small daily entries prevent end-of-trip surprises.");

  return { planned, spent, remaining, perDay, healthScore, health, byCategory, suggestions };
}

// ----- Trip Readiness -----

export interface ReadinessInput {
  hasDates: boolean;
  hasStops: boolean;
  hasActivities: boolean;
  hasBudget: boolean;
  hasChecklist: boolean;
  hasNotes: boolean;
  hasShareLink: boolean;
}

export function calcReadiness(r: ReadinessInput) {
  const checks: { key: keyof ReadinessInput; label: string; ok: boolean }[] = [
    { key: "hasDates", label: "Trip dates", ok: r.hasDates },
    { key: "hasStops", label: "City stops", ok: r.hasStops },
    { key: "hasActivities", label: "Activities", ok: r.hasActivities },
    { key: "hasBudget", label: "Budget items", ok: r.hasBudget },
    { key: "hasChecklist", label: "Packing checklist", ok: r.hasChecklist },
    { key: "hasNotes", label: "Trip notes", ok: r.hasNotes },
    { key: "hasShareLink", label: "Public share link", ok: r.hasShareLink },
  ];
  const completed = checks.filter((c) => c.ok);
  const missing = checks.filter((c) => !c.ok);
  const score = Math.round((completed.length / checks.length) * 100);
  return { score, completed, missing };
}
