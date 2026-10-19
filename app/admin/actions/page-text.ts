"use server";

import { updateTag } from "next/cache";
import { requireStaffAction } from "@/lib/admin/auth";
import { dbErrorMessage, type AdminFormState } from "@/lib/admin/form";
import { effectiveValues, loadPageTexts, pageKeys, textPage } from "@/lib/admin/page-text";
import { CONTENT_TAG, isMissingTable } from "@/lib/content/public";
import { PAGE_TEXT_DEFAULTS, cleanText, type PageTextKey } from "@/lib/page-text";
import { failure, saved } from "./shared";

const NOT_MIGRATED = "Page text cannot be saved yet: the database update for it has not been applied. Ask the developer to run the page_texts migration.";
const STALE = "Someone else changed this page’s text after you opened it. Copy any changes you need, reload the page, and apply them again.";

/**
 * Save one page's wording. Unchanged or emptied fields fall back to the original
 * copy (no row stored). The version check and all writes run in one locked
 * transaction (save_page_texts), so concurrent saves cannot overwrite each other.
 */
export async function savePageText(prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const page = textPage(String(fd.get("page") ?? ""));
  const submitted: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") submitted[k] = v;

  const guard = await requireStaffAction();
  if (!guard.ok) return failure(prev, submitted, guard.message);
  if (!page) return failure(prev, submitted, "Unknown page.");

  const errors: Record<string, string> = {};
  const wanted = new Map<PageTextKey, string | null>(); // null = use the original wording
  for (const field of page.groups.flatMap((g) => g.fields)) {
    const res = cleanText(field, submitted[field.key] ?? "");
    if ("error" in res) {
      errors[field.key] = res.error;
      continue;
    }
    wanted.set(field.key, res.value === "" || res.value === PAGE_TEXT_DEFAULTS[field.key] ? null : res.value);
  }
  if (Object.keys(errors).length) return failure(prev, submitted, "Please fix the highlighted fields. Nothing was saved.", errors);

  const current = await loadPageTexts(guard.db, page);
  if ("missing" in current) return failure(prev, submitted, NOT_MIGRATED);
  if ("error" in current) return failure(prev, submitted, "Could not load the current text. Please try again.");

  const remove = [...wanted].filter(([k, v]) => v === null && current.rows.has(k)).map(([k]) => k);
  const set = Object.fromEntries([...wanted].filter(([k, v]) => v !== null && current.rows.get(k) !== v));
  const changed = remove.length > 0 || Object.keys(set).length > 0;

  const submittedVersion = String(fd.get("version") ?? "");
  if (changed) {
    const { error } = await guard.db.rpc("save_page_texts", { p_keys: pageKeys(page), p_version: submittedVersion, p_set: set, p_delete: remove });
    if (error) {
      if (error.message?.includes("stale_version")) return failure(prev, submitted, STALE);
      if (isMissingTable(error)) return failure(prev, submitted, NOT_MIGRATED);
      return failure(prev, submitted, dbErrorMessage(error).message);
    }
    updateTag(CONTENT_TAG);
  } else if (submittedVersion !== current.version) {
    return failure(prev, submitted, STALE);
  }

  const after = await loadPageTexts(guard.db, page);
  if (!("rows" in after)) return failure(prev, submitted, "Saved, but the page could not be reloaded. Reload it to continue.");
  const message = changed ? `Saved. The ${page.name} page shows the new wording.` : "No changes to save.";
  // Values and version from the same reload, so the next save compares against what the form shows.
  return saved(prev, { ...effectiveValues(page, after.rows), page: page.slug }, message, after.version);
}
