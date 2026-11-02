import type { Deal } from "./data";
export const week = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export function availableToday(deal: Deal, now = new Date()) {
  const date = now.toLocaleDateString("en-CA",{timeZone:"Africa/Casablanca"});
  const weekday = (new Date(date+"T12:00:00Z").getUTCDay()+6)%7+1;
  return (!deal.starts_on || date >= deal.starts_on) && date <= deal.expires_at && (!deal.weekdays || deal.weekdays.includes(weekday));
}
export function scheduleText(deal: Deal) {
  return [deal.starts_on ? deal.starts_on+" – "+deal.expires_at : "Through "+deal.expires_at,
    deal.weekdays?.map(day => week[day-1]).join(", "), deal.min_members && "Groups of "+deal.min_members+" or more"].filter(Boolean).join(" · ");
}
