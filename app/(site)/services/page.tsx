import Link from "next/link";
import { getPublicSnapshot } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { quoteHref } from "@/lib/site";
import { audiences, processSteps, systemTypes } from "@/lib/services";
import { lines, textGetter } from "@/lib/page-text";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PageHeader, Section, SectionHeading } from "@/components/ui/Section";

export const metadata = pageMetadata({
  title: "Solar Services",
  description:
    "Solar PV assessment, consultancy, proposal, installation, commissioning and after-sales support for residential, commercial and industrial customers in the Philippines.",
  path: "/services",
});


export default async function ServicesPage() {
  const { settings, texts } = await getPublicSnapshot();
  const t = textGetter(texts);
  return (
    <>
      <PageHeader
        eyebrow={t("services.header.eyebrow")}
        title={t("services.header.title")}
        intro={t("services.header.intro")}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={quoteHref}>{t("services.header.button1")}</ButtonLink>
          <ButtonLink href="/packages" variant="secondary">
            {t("services.header.button2")}
          </ButtonLink>
        </div>
      </PageHeader>

      <Section labelledBy="who-title" id="installation">
        <SectionHeading id="who-title" eyebrow={t("services.who.eyebrow")} title={t("services.who.title")} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {audiences(t).map((a) => (
            <section key={a.id} id={a.id} aria-labelledby={`${a.id}-title`} className="rounded-[var(--radius-panel)] border border-steel-200 p-6">
              <h3 id={`${a.id}-title`} className="text-xl font-bold text-steel-950">
                {a.title}
              </h3>
              <p className="mt-2 text-steel-600">{a.body}</p>
              <ul className="mt-4 space-y-1.5">
                {lines(a.points).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-steel-800">
                    <Icon name="check" className="mt-1 size-4 text-gold-800" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section tone="muted" labelledBy="process-title" id="consultancy">
        <SectionHeading
          id="process-title"
          eyebrow={t("services.process.eyebrow")}
          title={t("services.process.title")}
          intro={settings.service_area_note ?? undefined}
        />
        <ol className="mt-10 space-y-0 border-l-2 border-steel-300">
          {processSteps(t).map((step, i) => (
            <li key={i} className="relative pb-8 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-0 -left-[1.05rem] inline-flex size-8 items-center justify-center rounded-full bg-steel-900 font-display text-sm font-bold text-gold-400 tabular"
              >
                {i + 1}
              </span>
              <h3 className="text-xl font-bold text-steel-950">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-1 max-w-2xl text-steel-700">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="types-title" id="system-types">
        <SectionHeading
          id="types-title"
          eyebrow={t("services.types.eyebrow")}
          title={t("services.types.title")}
          intro={t("services.types.intro")}
        />
        <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-steel-200 bg-steel-200 lg:grid-cols-3">
          {systemTypes(t).map((st) => (
            <section key={st.key} aria-labelledby={`type-${st.key}`} className="bg-white p-6 sm:p-8">
              <p className="text-sm font-semibold tracking-wide text-gold-800 uppercase">{st.lead}</p>
              <h3 id={`type-${st.key}`} className="mt-1 text-2xl font-extrabold text-steel-950">
                {st.title}
              </h3>
              <p className="mt-3 text-steel-700">{st.body}</p>
              <p className="mt-4 border-t border-steel-200 pt-4 text-sm text-steel-600">
                <strong className="text-steel-900">{t("services.types.suits_label")} </strong>
                {st.suits}
              </p>
            </section>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-steel-600">{t("services.types.note")}</p>
      </Section>

      <Section tone="dark" labelledBy="cta-title">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 id="cta-title" className="text-3xl font-extrabold text-white">
              {t("services.cta.title")}
            </h2>
            <p className="mt-2 text-steel-300">
              {t("services.cta.text")} {t("services.cta.call")}{" "}
              <a href={`tel:${settings.phone_e164}`} className="font-semibold text-white underline">
                {settings.phone_display}
              </a>
              .
            </p>
          </div>
          <ButtonLink href={quoteHref} size="lg">
            {t("services.cta.button")}
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-steel-400">
          {t("services.cta.equipment")}{" "}
          <Link href="/products" className="font-semibold text-white underline">
            {t("services.cta.equipment_link")}
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
