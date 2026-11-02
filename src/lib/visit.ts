export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Shift = { open: string; close: string; pause?: { start: string; end: string } };
export const routes = {
  Tramway: ["Line", "Station"],
  Bus: ["Line", "Stop"],
  Busway: ["Line", "Final station"],
  "Grand taxi": ["Departure point", "Arrival point"],
} as const;
export type Mode = keyof typeof routes;
export type Visit = {
  googleMapsUrl?: string;
  wazeUrl?: string;
  schedule?: Partial<Record<typeof days[number], Shift>>;
  parking?: { kind: "Unknown" | "Unavailable" | "Free" | "Paid"; rate?: string };
  routes?: Partial<Record<Mode, [string, string]>>;
  franchise?: string;
};
export function visitFields(v: Visit) {
  for (const link of [v.googleMapsUrl, v.wazeUrl]) {
    if (link && !/^https:\/\//i.test(link)) throw new Error("Use an HTTPS share link for the map location.");
  }
  const fields: { hours?: string; parking?: string; transport?: string } = {};
  if (v.schedule) fields.hours = days.map(day => {
    const shift = v.schedule?.[day];
    if (!shift) return day + ": Closed";
    if (!(shift.open && shift.close && shift.open < shift.close)) throw new Error(day + ": closing time must follow opening time.");
    if (!shift.pause) return day + ": " + shift.open + "–" + shift.close;
    const {start, end} = shift.pause;
    if (!(shift.open < start && start < end && end < shift.close)) throw new Error(day + ": the midday break must fall inside opening hours.");
    return day + ": " + shift.open + "–" + start + ", " + end + "–" + shift.close;
  }).join("\n");
  if (v.parking) {
    const {kind,rate} = v.parking;
    if (kind === "Paid" && rate !== undefined && !(rate.trim() && Number.isFinite(Number(rate)) && Number(rate) > 0)) throw new Error("Enter the hourly parking rate in MAD.");
    fields.parking = kind === "Paid" ? (rate === undefined ? "Paid parking · hourly rate unknown" : "Paid parking · " + rate + " MAD/hour") : {Unknown:"Parking unconfirmed",Unavailable:"No parking",Free:"Free parking"}[kind];
  }
  if (v.routes) fields.transport = (Object.keys(routes) as Mode[]).flatMap(mode => {
    const pair = v.routes?.[mode];
    if (!pair) return [];
    if (pair.some(value => !value.trim())) throw new Error("Complete both " + mode + " fields.");
    return [mode + " · " + routes[mode].map((label,i) => label + ": " + pair[i].trim()).join(" · ")];
  }).join("\n");
  return fields;
}
