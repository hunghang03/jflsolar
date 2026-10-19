import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingTable } from "@/lib/content/public";
import { PAGE_TEXT_DEFAULTS, TEXT_PAGES, type PageTextKey, type TextPageDef } from "@/lib/page-text";

export const textPage = (slug: string) => TEXT_PAGES.find((p) => p.slug === slug);
export const pageKeys = (page: TextPageDef) => page.groups.flatMap((g) => g.fields.map((f) => f.key));

export type PageTextRows = Map<PageTextKey, string>;
export type LoadedPageTexts = { rows: PageTextRows; version: string } | { missing: true } | { error: string };

/**
 * Stored overrides for one admin page plus its version token (computed in the
 * database, the same way save_page_texts checks it), or `missing` before the
 * migration is applied.
 */
export async function loadPageTexts(db: SupabaseClient, page: TextPageDef): Promise<LoadedPageTexts> {
  // One call = one snapshot: values and version always belong together.
  const { data, error } = await db.rpc("page_texts_load", { p_keys: pageKeys(page) });
  if (error) return isMissingTable(error) ? { missing: true } : { error: error.message };
  const res = data as { version: string; rows: Record<string, string> };
  return { rows: new Map(Object.entries(res.rows ?? {}) as [PageTextKey, string][]), version: String(res.version) };
}

/** Form values: what the public site currently shows for each field. */
export function effectiveValues(page: TextPageDef, rows: PageTextRows) {
  return Object.fromEntries(pageKeys(page).map((k) => [k, rows.get(k) || PAGE_TEXT_DEFAULTS[k]]));
}
