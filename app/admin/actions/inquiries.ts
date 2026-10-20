"use server";

import { redirect } from "next/navigation";
import { requireStaffAction } from "@/lib/admin/auth";
import { UUID_RE } from "./shared";

const STATUSES = ["new", "handled", "archived"] as const;
type InquiryStatus = (typeof STATUSES)[number];

function to(id: string, params: Record<string, string>): never {
  redirect(`/admin/inquiries/${id}?${new URLSearchParams(params)}`);
}

export async function setInquiryStatus(id: string, status: InquiryStatus) {
  if (!UUID_RE.test(id) || !STATUSES.includes(status)) redirect("/admin/inquiries?error=invalid");
  const guard = await requireStaffAction();
  if (!guard.ok) to(id, { error: "auth" });
  const { data, error } = await guard.db.from("inquiries").update({ status }).eq("id", id).select("id");
  if (error || !data?.length) to(id, { error: error ? "save_failed" : "missing" });
  to(id, { notice: `inquiry_${status}` });
}

export async function saveInquiryNotes(id: string, fd: FormData) {
  if (!UUID_RE.test(id)) redirect("/admin/inquiries?error=invalid");
  const guard = await requireStaffAction();
  if (!guard.ok) to(id, { error: "auth" });
  const notes = String(fd.get("staff_notes") ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 4000);
  const { data, error } = await guard.db.from("inquiries").update({ staff_notes: notes || null }).eq("id", id).select("id");
  if (error || !data?.length) to(id, { error: error ? "save_failed" : "missing" });
  to(id, { notice: "notes_saved" });
}

/** Permanent deletion; the database only allows it for archived inquiries. */
export async function deleteInquiry(id: string) {
  if (!UUID_RE.test(id)) redirect("/admin/inquiries?error=invalid");
  const guard = await requireStaffAction();
  if (!guard.ok) to(id, { error: "auth" });
  const { data, error } = await guard.db.from("inquiries").delete().eq("id", id).select("id");
  if (error) to(id, { error: "save_failed" });
  if (!data?.length) to(id, { error: "not_archived" });
  redirect("/admin/inquiries?view=archived&notice=deleted");
}
