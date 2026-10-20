import { billRanges, inquiryTypes } from "@/lib/labels";

export const typeLabel = (v: string) => inquiryTypes.find((t) => t.value === v)?.label ?? v;
export const billLabel = (v: string) => billRanges.find((b) => b.value === v)?.label ?? v;

/** Date and time in the Philippines, e.g. "Oct 20, 2026, 9:05 AM". */
export const manilaDateTime = (iso: string, long = false) =>
  new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: long ? "long" : "medium", timeStyle: "short" }).format(new Date(iso));
