import Link from "next/link";
import { Suspense } from "react";
import { requireStaffPage } from "@/lib/admin/auth";
import { isMissingTable } from "@/lib/content/public";
import { manilaDateTime, typeLabel } from "@/lib/admin/inquiries";
import { Notice } from "@/components/admin/Notice";
import { PageTitle } from "@/components/admin/PageTitle";

export const metadata = { title: "Inquiries" };

const VIEWS = { new: "New", handled: "Handled", archived: "Archived" } as const;
type View = keyof typeof VIEWS;
const PAGE_SIZE = 50;

export default function InquiriesAdmin({ searchParams }: PageProps<"/admin/inquiries">) {
  return (
    <>
      <PageTitle title="Inquiries" intro="Quote requests sent through the website. Reply by phone or email, then mark them as handled." />
      <Suspense fallback={null}>
        <Notice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<p role="status">Loading…</p>}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: Pick<PageProps<"/admin/inquiries">, "searchParams">) {
  const sp = await searchParams;
  const view: View = sp.view === "handled" || sp.view === "archived" ? sp.view : "new";
  const pageNo = Math.max(1, Math.min(10000, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1));
  const from = (pageNo - 1) * PAGE_SIZE;
  const { db } = await requireStaffPage();
  const count = (s: View) => db.from("inquiries").select("id", { count: "exact", head: true }).eq("status", s);
  const [rows, ...counts] = await Promise.all([
    db
      .from("inquiries")
      .select("id, created_at, name, inquiry_type, item_label, location, message")
      .eq("status", view)
      // Newest first; id breaks ties so pages never overlap or skip.
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    count("new"),
    count("handled"),
    count("archived"),
  ]);
  if (rows.error) {
    return isMissingTable(rows.error) ? (
      <p role="alert" className="rounded-[var(--radius-control)] border border-[#f0d39a] bg-warn-50 px-4 py-3 text-warn-800">
        Inquiry saving is not switched on yet: the database update for it has not been applied.
      </p>
    ) : (
      <p role="alert">Could not load inquiries.</p>
    );
  }
  const totals = Object.fromEntries((Object.keys(VIEWS) as View[]).map((k, i) => [k, counts[i].count ?? 0]));
  const list = rows.data ?? [];
  return (
    <>
      <nav aria-label="Filter inquiries" className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(VIEWS) as View[]).map((k) => (
          <Link
            key={k}
            href={k === "new" ? "/admin/inquiries" : `/admin/inquiries?view=${k}`}
            aria-current={view === k ? "page" : undefined}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-steel-300 px-4 text-sm font-semibold text-steel-800 aria-[current=page]:border-steel-900 aria-[current=page]:bg-steel-900 aria-[current=page]:text-white"
          >
            {VIEWS[k]} <span className="tabular">({totals[k]})</span>
          </Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <p className="rounded-[var(--radius-panel)] border border-dashed border-steel-300 bg-white p-8 text-center text-steel-700">
          {view === "new" ? "No new inquiries." : "Nothing here."}
        </p>
      ) : (
        <ul className="divide-y divide-steel-200 rounded-[var(--radius-panel)] border border-steel-200 bg-white">
          {list.map((i) => (
            <li key={i.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/admin/inquiries/${i.id}`} className="text-lg font-bold text-steel-950 underline-offset-2 hover:underline">
                  {i.name}
                </Link>
                <span className="text-sm text-steel-600 tabular">{manilaDateTime(i.created_at)}</span>
              </div>
              <p className="text-sm text-steel-700">
                {typeLabel(i.inquiry_type)}
                {i.item_label && <> · {i.item_label}</>}
                {i.location && <> · {i.location}</>}
              </p>
              <p className="mt-1 line-clamp-2 text-steel-700">{i.message}</p>
            </li>
          ))}
        </ul>
      )}
      {totals[view] > PAGE_SIZE && <Pager view={view} page={pageNo} total={totals[view]} />}
    </>
  );
}

function Pager({ view, page, total }: { view: View; page: number; total: number }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const href = (p: number) => {
    const qs = new URLSearchParams({ ...(view === "new" ? {} : { view }), ...(p > 1 ? { page: String(p) } : {}) }).toString();
    return `/admin/inquiries${qs ? `?${qs}` : ""}`;
  };
  const link = "inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-steel-300 bg-white px-4 text-sm font-semibold text-steel-900 hover:border-steel-900";
  return (
    <nav aria-label="Pages" className="mt-4 flex flex-wrap items-center gap-3">
      {page > 1 && (
        <Link href={href(page - 1)} className={link}>
          ← Newer
        </Link>
      )}
      <p className="text-sm text-steel-700">
        Page {Math.min(page, pages)} of {pages} ({total} inquiries)
      </p>
      {page < pages && (
        <Link href={href(page + 1)} className={link}>
          Older →
        </Link>
      )}
    </nav>
  );
}
