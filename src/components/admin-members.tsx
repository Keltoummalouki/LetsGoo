"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingSkeleton } from "./loading-skeleton";
import { Ban, Check, UserCheck } from "lucide-react";
import { Button } from "./ui/button";

type Member = { id: string; email: string | null; joined_at: string; suspended: boolean; protected: boolean };

export function AdminMembers() {
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Member[] | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.resolve(supabase!.rpc("admin_accounts", { page_index: page })).then(({ data, error }) => {
      if (!active) return;
      setError(error ? (error.code === "PGRST202" ? "Account management requires the account moderation database migration." : error.message) : "");
      setRows(error ? null : data);
    }).catch(()=>{if(active){setRows(null);setError("Could not reach the member directory. Try again.");}});
    return () => { active = false; };
  }, [page, refresh]);
  function load(next: number) {
    setRows(null); setConfirm(null); setError(""); setPage(next); setRefresh(n => n + 1);
  }
  async function change(member: Member) {
    setSaving(true);
    try {
      const { error } = await supabase!.rpc("admin_set_suspension", { account_id: member.id, suspend: !member.suspended });
      if (error) setError(error.message);
      else load(page);
    } catch { setError("Could not update the account. Reload the directory and try again."); } finally { setSaving(false); }
  }
  return <section aria-label="Member directory">
    <h2>Member directory</h2>
    {error && <p role="alert">{error} <Button onClick={() => load(page)}>Retry</Button></p>}
    {!error && !rows && <LoadingSkeleton label="Loading accounts"/>}
    <div className="admin-list">{rows?.slice(0,50).map(member => <article key={member.id}>
      <div><h3>{member.email || member.id}</h3><p>{member.protected ? "Administrator · " : ""}{member.suspended ? "Suspended" : "Active"} · Joined {new Date(member.joined_at).toLocaleDateString()}</p></div>
      {!member.protected && (confirm === member.id ? <>
        <Button disabled={saving} onClick={() => void change(member)}><Check size={16}/> Confirm {member.suspended ? "reactivation" : "suspension"}</Button>
        <Button variant="ghost" disabled={saving} onClick={() => setConfirm(null)}>Cancel</Button>
      </> : <Button disabled={saving} variant="outline" onClick={() => setConfirm(member.id)}>
        {member.suspended ? <UserCheck size={16} aria-hidden="true"/> : <Ban size={16} aria-hidden="true"/>}
        {member.suspended ? "Reactivate" : "Suspend"}
      </Button>)}
    </article>)}</div>
    {rows?.length === 0 && <p>No accounts on this page.</p>}
    {(page > 0 || (rows?.length ?? 0) > 50) && <div><Button disabled={saving || !page} onClick={() => load(page-1)}>Previous</Button> <Button disabled={saving || (rows?.length ?? 0) <= 50} onClick={() => load(page+1)}>Next</Button></div>}
  </section>;
}
