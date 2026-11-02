"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import "./date-picker.css";

function dateKey(day: Date) {
  return [day.getFullYear(), String(day.getMonth() + 1).padStart(2, "0"), String(day.getDate()).padStart(2, "0")].join("-");
}
function shift(day: Date, days: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);
}
function changeMonth(day: Date, offset: number) {
  const last = new Date(day.getFullYear(), day.getMonth() + offset + 1, 0);
  return new Date(last.getFullYear(), last.getMonth(), Math.min(day.getDate(), last.getDate()));
}
const fullDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export function DatePicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = useRef<HTMLButtonElement>(null);
  const focusDay = useRef(false);
  const id = useId();
  const selected = value ? new Date(value + "T12:00:00") : null;
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  useEffect(() => {
    if (open && focusDay.current) {
      active.current?.focus();
      focusDay.current = false;
    }
  }, [open, cursor]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function close() { setOpen(false); trigger.current?.focus(); }
  function choose(day: Date | null) { onChange(day ? dateKey(day) : ""); close(); }
  return <div className="date-field" ref={root}
    onBlur={e => { if (e.relatedTarget && !root.current?.contains(e.relatedTarget)) setOpen(false); }}
    onKeyDown={e => { if (open && e.key === "Escape") { e.preventDefault(); close(); } }}>
    <label htmlFor={id}>{label}</label>
    <button id={id} ref={trigger} type="button" className="date-trigger" aria-expanded={open} aria-controls={open ? id+"-calendar" : undefined}
      onClick={() => { if (!open) { setCursor(selected || new Date()); focusDay.current = true; } setOpen(!open); }}>
      {selected ? fullDate.format(selected) : "Choose a date"}<CalendarDays size={17}/>
    </button>
    {open && <section className="date-calendar" id={id+"-calendar"} aria-label={label+" calendar"}>
      <header><button type="button" aria-label="Previous month" onClick={() => setCursor(changeMonth(cursor,-1))}><ChevronLeft size={17}/></button>
        <strong aria-live="polite">{monthName.format(cursor)}</strong>
        <button type="button" aria-label="Next month" onClick={() => setCursor(changeMonth(cursor,1))}><ChevronRight size={17}/></button></header>
      <div className="date-grid">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <small key={d}>{d}</small>)}
        {Array.from({length:count}, (_,i) => {
          const day = shift(first,i), key = dateKey(day), current = i+1 === cursor.getDate();
          return <button key={key} type="button" ref={current ? active : undefined} tabIndex={current ? 0 : -1}
            style={i === 0 ? {gridColumnStart:offset+1} : undefined} aria-label={fullDate.format(day)}
            aria-current={key === dateKey(new Date()) ? "date" : undefined} aria-pressed={key === value}
            onClick={() => choose(day)} onKeyDown={e => {
              const moves: Record<string,number> = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
              if (!(e.key in moves) && !["PageUp","PageDown"].includes(e.key)) return;
              e.preventDefault(); focusDay.current = true;
              setCursor(e.key in moves ? shift(day,moves[e.key]) : changeMonth(day,e.key === "PageUp" ? -1 : 1));
            }}>{i+1}</button>;
        })}
      </div>
      <footer><button type="button" onClick={() => choose(null)}>Clear</button><button type="button" onClick={() => choose(new Date())}>Today</button></footer>
    </section>}
  </div>;
}
