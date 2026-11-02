"use client";
import { useState } from "react";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { Dropdown } from "./dropdown";
import { days, routes, type Mode, type Shift, type Visit } from "@/lib/visit";
import type { Place } from "@/lib/data";

type Form = Omit<Place,"id">;
export function VisitEditor({ form, update, brands }: {
  form: Form; update: (key: keyof Form, value: unknown) => void; brands: string[];
}) {
  const visit = form.visit || {};
  const change = (part: Partial<Visit>) => update("visit", {...visit,...part});
  const [draft,setDraft] = useState("");
  const [country,setCountry] = useState<CountryCode>(() => parsePhoneNumberFromString(form.phone,"MA")?.country || "MA");
  const tags = form.activities.split(",").map(t=>t.trim()).filter(Boolean);
  const parsed = parsePhoneNumberFromString(form.phone,country);
  const national = form.phone.startsWith("+") && parsed?.country === country && parsed.isValid() ? parsed.formatNational() : form.phone;
  function commit() {
    const combined = [...tags];
    for (const tag of draft.split(",").map(t=>t.trim()).filter(Boolean)) {
      if (!combined.some(t => t.toLowerCase() === tag.toLowerCase())) combined.push(tag);
    }
    update("activities",combined.join(", ")); setDraft("");
  }
  function dayChange(day: typeof days[number], shift?: Shift) {
    const schedule = {...visit.schedule};
    if (shift) schedule[day] = shift; else delete schedule[day];
    change({schedule});
  }
  return <div className="visit-editor">
    <fieldset><legend>Activities</legend>
      <div className="tags">{tags.map(tag => <button type="button" key={tag} aria-label={"Remove "+tag} onClick={() => update("activities",tags.filter(t=>t!==tag).join(", "))}>{tag} ×</button>)}</div>
      <label>Add an activity<input value={draft} placeholder="Type an activity and press Enter" onChange={e=>setDraft(e.target.value)} onBlur={commit}
        onKeyDown={e=>{if (!e.nativeEvent.isComposing && (e.key==="Enter" || e.key===",")){e.preventDefault();commit();}}}/></label>
    </fieldset>
    <fieldset><legend>Weekly opening hours</legend>
      {!visit.schedule && form.hours && <p>Current hours: {form.hours}</p>}
      {!visit.schedule ? <button type="button" onClick={()=>change({schedule:{}})}>Set weekly schedule</button> :
        days.map(day => {
          const s = visit.schedule?.[day];
          return <div className="visit-row" key={day}>
            <label className="checkbox-label"><input type="checkbox" checked={!!s} onChange={e=>dayChange(day,e.target.checked ? {open:"09:00",close:"18:00"} : undefined)}/>{day}</label>
            {!s ? <small>Closed</small> : <>
              {(["open","close"] as const).map(key=><label key={key}>{key === "open" ? "Opens" : "Closes"}<input aria-label={day+" "+key} type="time" required value={s[key]} onChange={e=>dayChange(day,{...s,[key]:e.target.value})}/></label>)}
              <label className="checkbox-label"><input type="checkbox" checked={!!s.pause} onChange={e=>dayChange(day,{...s,pause:e.target.checked ? {start:"12:00",end:"14:00"} : undefined})}/>Midday break</label>
              {s.pause && (["start","end"] as const).map(key=><label key={key}>Break {key}<input type="time" required value={s.pause![key]} onChange={e=>dayChange(day,{...s,pause:{...s.pause!,[key]:e.target.value}})}/></label>)}
            </>}
          </div>;
        })}
    </fieldset>
    <fieldset><legend>Parking</legend>
      {!visit.parking && form.parking && <p>Current details: {form.parking}</p>}
      <label>Availability<Dropdown value={visit.parking?.kind || ""} onChange={e=>change({parking:{kind:e.target.value as NonNullable<Visit["parking"]>["kind"]}})}>
        <option disabled value="">Choose availability</option>{["Unknown","Unavailable","Free","Paid"].map(k=><option key={k}>{k}</option>)}</Dropdown></label>
      {visit.parking?.kind === "Paid" && <>
        <label className="checkbox-label"><input type="checkbox" checked={visit.parking.rate !== undefined} onChange={e=>change({parking:{kind:"Paid",rate:e.target.checked ? "" : undefined}})}/>Hourly price known</label>
        {visit.parking.rate !== undefined && <label>Price per hour (MAD)<input required type="number" min="0.01" step="0.01" value={visit.parking.rate} onChange={e=>change({parking:{kind:"Paid",rate:e.target.value}})}/></label>}
      </>}
    </fieldset>
    <fieldset><legend>Getting there</legend>
      {!visit.routes && form.transport && <p>Current directions: {form.transport}</p>}
      {(Object.keys(routes) as Mode[]).map(mode=>{
        const pair = visit.routes?.[mode];
        return <div className="visit-row" key={mode}><label className="checkbox-label"><input type="checkbox" checked={!!pair} onChange={e=>{
          const next = {...visit.routes}; if (e.target.checked) next[mode]=["",""]; else delete next[mode]; change({routes:next});
        }}/>{mode}</label>
        {pair && routes[mode].map((label,i)=><label key={label}>{label}<input required value={pair[i]} placeholder={mode==="Tramway" && i===0 ? "e.g. T1" : undefined} onChange={e=>{
          const next: [string,string] = [...pair]; next[i]=e.target.value; change({routes:{...visit.routes,[mode]:next}});
        }}/></label>)}</div>;
      })}
    </fieldset>
    <fieldset><legend>Branch & contact</legend>
      <label>Franchise name (optional)<input list="place-franchises" value={visit.franchise || ""} onChange={e=>change({franchise:e.target.value})}/></label>
      <datalist id="place-franchises">{brands.map(b=><option key={b} value={b}/>)}</datalist>
      <p>Use the same franchise name for each branch. Give each location its own listing, address and hours.</p>
      <label htmlFor="branch-phone">Phone number</label>
      <div className="branch-phone"><Dropdown aria-label="Country calling code" name="phoneCountry" value={country} onChange={e=>{update("phone",national);setCountry(e.target.value as CountryCode);}}>{getCountries().map(c=><option key={c} value={c}>{c} (+{getCountryCallingCode(c)})</option>)}</Dropdown>
      <input id="branch-phone" type="tel" autoComplete="tel-national" value={national} onChange={e=>update("phone",e.target.value)} onBlur={()=>{
        const p=parsePhoneNumberFromString(form.phone,country); if(p?.isValid()) {update("phone",p.number); if(p.country) setCountry(p.country);}
      }}/></div>
      {form.phone && !parsePhoneNumberFromString(form.phone,country)?.isValid() && <small>Check the number and country calling code.</small>}
      <label>Google Maps share link (optional)<input type="url" value={visit.googleMapsUrl || ""} onChange={e=>change({googleMapsUrl:e.target.value.trim()})}/></label>
      <label>Waze share link (optional)<input type="url" value={visit.wazeUrl || ""} onChange={e=>change({wazeUrl:e.target.value.trim()})}/></label>
      <small>Paste a branch’s map pin for exact directions, or leave blank to use its street address.</small>
    </fieldset>
  </div>;
}
