import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/admin/auth";
import { billLabel, manilaDateTime, typeLabel } from "@/lib/admin/inquiries";
import { deleteInquiry, saveInquiryNotes, setInquiryStatus } from "@/app/admin/actions/inquiries";
import { UUID_RE } from "@/app/admin/actions/shared";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";
import { PageTitle } from "@/components/admin/PageTitle";

export const metadata = { title: "Inquiry" };

const btn = "inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-4 text-sm font-semibold";
const STATUS_ACTIONS = [
  { status: "handled", label: "Mark handled", primary: true },
  { status: "new", label: "Mark as new", primary: false },
  { status: "archived", label: "Archive", primary: false },
] as const;

export default function InquiryDetail({ params, searchParams }: PageProps<"/admin/inquiries/[id]">) {
  return (
    <>
      <Suspense fallback={null}>
        <Notice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<p role="status">Loading…</p>}>
        <Detail params={params} />
      </Suspense>
    </>
  );
}

async function Detail({ params }: Pick<PageProps<"/admin/inquiries/[id]">, "params">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { db } = await requireStaffPage();
  const { data: i } = await db.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (!i) notFound();
  const statusName = i.status === "new" ? "New" : i.status === "handled" ? "Handled" : "Archived";

  return (
    <>
      <PageTitle title={i.name} back={{ href: "/admin/inquiries", label: "All inquiries" }} intro={`Received ${manilaDateTime(i.created_at, true)} · ${statusName}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section aria-label="Inquiry" className="rounded-[var(--radius-panel)] border border-steel-200 bg-white p-6">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[max-content_1fr]">
            <dt className="font-semibold">Phone</dt>
            <dd>
              {i.phone ? (
                <a href={`tel:${String(i.phone).replace(/[^0-9+]/g, "")}`} className="underline tabular">
                  {i.phone}
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt className="font-semibold">Email</dt>
            <dd>
              {i.email ? (
                <a href={`mailto:${i.email}`} className="break-all underline">
                  {i.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt className="font-semibold">About</dt>
            <dd>{typeLabel(i.inquiry_type)}</dd>
            {i.item_label && (
              <>
                <dt className="font-semibold">Selected item</dt>
                <dd>{i.item_label}</dd>
              </>
            )}
            <dt className="font-semibold">Location</dt>
            <dd>{i.location || "—"}</dd>
            {i.bill_range && (
              <>
                <dt className="font-semibold">Monthly bill</dt>
                <dd>{billLabel(i.bill_range)}</dd>
              </>
            )}
          </dl>
          <h2 className="mt-6 text-lg font-bold text-steel-950">Message</h2>
          <p className="mt-2 whitespace-pre-line text-steel-800">{i.message}</p>
        </section>

        <aside className="space-y-4">
          <section aria-labelledby="status-title" className="rounded-[var(--radius-panel)] border border-steel-200 bg-white p-4">
            <h2 id="status-title" className="font-bold text-steel-950">
              Status
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_ACTIONS.filter((a) => a.status !== i.status).map((a) => (
                <form key={a.status} action={setInquiryStatus.bind(null, id, a.status)}>
                  <button
                    type="submit"
                    className={`${btn} ${a.primary ? "bg-steel-900 text-white hover:bg-steel-800" : "border border-steel-300 bg-white text-steel-900 hover:border-steel-900"}`}
                  >
                    {a.label}
                  </button>
                </form>
              ))}
            </div>
          </section>
          <form action={saveInquiryNotes.bind(null, id)} className="rounded-[var(--radius-panel)] border border-steel-200 bg-white p-4">
            <label htmlFor="notes" className="font-bold text-steel-950">
              Staff notes
            </label>
            <p id="notes-hint" className="text-sm text-steel-600">
              For your team only — e.g. who replied and when.
            </p>
            <textarea
              id="notes"
              name="staff_notes"
              rows={5}
              maxLength={4000}
              aria-describedby="notes-hint"
              defaultValue={i.staff_notes ?? ""}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-steel-500 px-3 py-2"
            />
            <button type="submit" className={`${btn} mt-2 border border-steel-300 bg-white text-steel-900 hover:border-steel-900`}>
              Save notes
            </button>
          </form>
          {i.status === "archived" && (
            <ConfirmSubmit
              action={deleteInquiry.bind(null, id)}
              label="Delete permanently"
              title="Delete this inquiry permanently?"
              body={<p>The customer’s details and message are removed. Do this when you no longer need them (for example, after the quotation is closed).</p>}
              confirmLabel="Delete permanently"
            />
          )}
        </aside>
      </div>
    </>
  );
}
