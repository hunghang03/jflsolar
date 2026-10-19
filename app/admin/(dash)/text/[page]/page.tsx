import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/admin/auth";
import { effectiveValues, loadPageTexts, textPage } from "@/lib/admin/page-text";
import { TEXT_PAGES } from "@/lib/page-text";
import { PageTitle } from "@/components/admin/PageTitle";
import { PageTextForm } from "@/components/admin/forms/PageTextForm";

export const metadata = { title: "Page text" };

export default function PageTextAdmin({ params }: PageProps<"/admin/text/[page]">) {
  return (
    <>
      <PageTitle
        title="Page text"
        intro="Headings and wording on the Home, Solar Services and About pages. Changes appear on the website as soon as you save. Plain text only."
      />
      <Suspense fallback={<p role="status">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/text/[page]">, "params">) {
  const page = textPage((await params).page);
  if (!page) notFound();
  const { db } = await requireStaffPage();
  const res = await loadPageTexts(db, page);
  return (
    <>
      <nav aria-label="Choose a page" className="mb-4 flex flex-wrap gap-2">
        {TEXT_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/text/${p.slug}`}
            aria-current={p.slug === page.slug ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-steel-300 px-4 text-sm font-semibold text-steel-800 aria-[current=page]:border-steel-900 aria-[current=page]:bg-steel-900 aria-[current=page]:text-white"
          >
            {p.name}
          </Link>
        ))}
      </nav>
      <p className="mb-6 text-sm text-steel-700">
        {page.note && <>{page.note} </>}
        <a href={page.path} target="_blank" rel="noopener" className="font-semibold text-steel-900 underline">
          View the {page.name} page<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
      {"rows" in res ? (
        <PageTextForm key={page.slug} page={page} values={effectiveValues(page, res.rows)} version={res.version} />
      ) : "missing" in res ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-[#f0d39a] bg-warn-50 px-4 py-3 text-warn-800">
          Page text editing is not switched on yet: the database update for it has not been applied. The website shows the original wording meanwhile.
        </p>
      ) : (
        <p role="alert">Could not load the page text.</p>
      )}
    </>
  );
}
