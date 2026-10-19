import Image from "next/image";
import Link from "next/link";
import { getPublicSnapshot } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo";
import { brand, quoteHref } from "@/lib/site";
import { lines, textGetter } from "@/lib/page-text";
import { processSteps, services } from "@/lib/services";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { PackageCard } from "@/components/catalog/PackageCard";
import { ProjectCard } from "@/components/catalog/ProjectCard";
import { ClaimMarker, Paragraphs } from "@/components/content/Blocks";
import { Addresses, ContactRoutes } from "@/components/contact/ContactRoutes";
import heroPhoto from "@/public/images/hero-rooftop.jpg";

export const metadata = pageMetadata({
  title: brand.name,
  description:
    "Solar PV installation, consultancy and equipment distribution for homes, businesses and installers across the Philippines. Request a quote from JFL Solar.",
  path: "/",
});

export default async function HomePage() {
  const { packages, products, projects, categories, blocks, settings, texts } = await getPublicSnapshot();
  const t = textGetter(texts);
  const featuredPackages = (packages.filter((p) => p.featured).length ? packages.filter((p) => p.featured) : packages).slice(0, 3);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const why = blocks.filter((b) => b.section === "why");
  const productCount = (categoryId: string) => products.filter((p) => p.category_id === categoryId).length;

  return (
    <>
      {/* Hero — owner-supplied rooftop photo (docs/reference/hero-source.jpg, enhanced by scripts/process-hero.mjs) */}
      <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-steel-950 text-white">
        {/* Mobile/tablet: photo band above the text. Desktop: full-bleed background. */}
        <div className="relative h-56 sm:h-80 lg:absolute lg:inset-y-0 lg:left-0 lg:-z-20 lg:h-auto lg:w-[62%]">
          <Image
            src={heroPhoto}
            alt="Two technicians in hard hats and safety vests checking a rooftop solar array"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[35%_60%] lg:object-[40%_60%]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-steel-950 to-transparent lg:hidden" />
          {/* Desktop: fade the photo into the slate text panel. */}
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-transparent from-55% to-steel-950 lg:block" />
        </div>
        <Container className="relative pt-4 pb-14 sm:pb-16 lg:py-28">
          <div className="max-w-xl lg:ml-auto lg:max-w-[33rem]">
            <p className="mb-5 flex items-center gap-3 text-sm font-semibold tracking-wide text-gold-400 uppercase">
              <span className="rule-gold" aria-hidden="true" />
              {t("home.hero.eyebrow")}
            </p>
            <h1 id="hero-title" className="text-[2.35rem] leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.15rem]">
              {t("home.hero.title")}
            </h1>
            <p className="mt-6 text-lg text-steel-100">{t("home.hero.intro")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={quoteHref} size="lg">
                {t("home.hero.button1")}
                <Icon name="arrow" className="size-4" />
              </ButtonLink>
              <ButtonLink href="/products" variant="light" size="lg">
                {t("home.hero.button2")}
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm font-semibold text-steel-100">{settings.service_area}</p>
          </div>
        </Container>
      </section>

      {/* Two pathways */}
      <section aria-labelledby="paths-title" className="border-b border-steel-200 bg-white">
        <Container className="py-14 sm:py-16">
          <h2 id="paths-title" className="sr-only">
            Choose your path
          </h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PathPanel
              eyebrow={t("home.path1.eyebrow")}
              title={t("home.path1.title")}
              points={lines(t("home.path1.points"))}
              primary={{ href: "/services", label: t("home.path1.button") }}
              secondary={{ href: "/packages?type=installed", label: t("home.path1.link") }}
            />
            <PathPanel
              accent
              eyebrow={t("home.path2.eyebrow")}
              title={t("home.path2.title")}
              points={lines(t("home.path2.points"))}
              primary={{ href: "/products", label: t("home.path2.button") }}
              secondary={{ href: "/packages?type=equipment", label: t("home.path2.link") }}
            />
          </div>
        </Container>
      </section>

      {/* Services */}
      <Section labelledBy="services-title">
        <SectionHeading id="services-title" eyebrow={t("home.services.eyebrow")} title={t("home.services.title")} />
        <ul className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-steel-200 bg-steel-200 md:grid-cols-3">
          {services(t).map((s) => (
            <li key={s.key} className="flex flex-col bg-white p-6 sm:p-8">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-gold-500 text-steel-950">
                <Icon name={s.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-steel-950">{s.title}</h3>
              <p className="mt-2 flex-1 text-steel-600">{s.body}</p>
              <Link href={s.href} className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-steel-900 hover:underline">
                {s.cta}
                <Icon name="arrow" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Featured packages */}
      {featuredPackages.length > 0 && (
        <Section tone="muted" labelledBy="packages-title">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="packages-title"
              eyebrow={t("home.packages.eyebrow")}
              title={t("home.packages.title")}
              intro={t("home.packages.intro")}
            />
            <ButtonLink href="/packages" variant="secondary" className="self-start md:self-auto">
              {t("home.packages.button")}
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </Section>
      )}

      {/* Product categories */}
      <Section labelledBy="categories-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            id="categories-title"
            eyebrow={t("home.equipment.eyebrow")}
            title={t("home.equipment.title")}
            intro={t("home.equipment.intro")}
          />
          <ul className="divide-y divide-steel-200 border-y border-steel-200">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="group flex min-h-16 items-center justify-between gap-4 py-3 hover:bg-steel-50 sm:px-2"
                >
                  <span>
                    <span className="block text-lg font-bold text-steel-950 group-hover:underline">{c.name}</span>
                    {c.description && <span className="block text-sm text-steel-600">{c.description}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-sm text-steel-600">
                    <span className="tabular">{productCount(c.id)} {t("home.equipment.count")}</span>
                    <Icon name="arrow" className="size-4 text-steel-900" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Process */}
      <Section tone="dark" labelledBy="process-title">
        <SectionHeading
          dark
          id="process-title"
          eyebrow={t("home.process.eyebrow")}
          title={t("home.process.title")}
          intro={t("home.process.intro")}
        />
        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {processSteps(t).map((step, i) => (
            <li key={i} className="relative border-t border-white/15 pt-5">
              <span className="font-display text-sm font-bold text-gold-400 tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-steel-300">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Projects */}
      {featuredProjects.length > 0 && (
        <Section labelledBy="projects-title">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading id="projects-title" eyebrow={t("home.projects.eyebrow")} title={t("home.projects.title")} />
            <ButtonLink href="/projects" variant="secondary" className="self-start md:self-auto">
              {t("home.projects.button")}
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Why JFL */}
      {why.length > 0 && (
        <Section tone="muted" labelledBy="why-title">
          <SectionHeading id="why-title" eyebrow={t("home.why.eyebrow")} title={t("home.why.title")} />
          <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {why.map((b) => (
              <div key={b.key} className="border-l-4 border-gold-500 pl-5">
                <dt className="text-lg font-bold text-steel-950">{b.title}</dt>
                <dd className="mt-1.5 text-steel-700">
                  <ClaimMarker block={b} className="mb-1.5" />
                  <Paragraphs text={b.body} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10">
            <Link href="/about" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-steel-900 hover:underline">
              {t("home.why.link")} <Icon name="arrow" className="size-4" />
            </Link>
          </p>
        </Section>
      )}

      {/* Contact band */}
      <Section labelledBy="contact-title">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              id="contact-title"
              eyebrow={t("home.contact.eyebrow")}
              title={t("home.contact.title")}
              intro={settings.service_area_note ?? undefined}
            />
            <div className="mt-8">
              <ButtonLink href={quoteHref} size="lg">
                {t("home.contact.button")} <Icon name="arrow" className="size-4" />
              </ButtonLink>
            </div>
          </div>
          <div className="space-y-6">
            <ContactRoutes settings={settings} />
            <Addresses settings={settings} />
          </div>
        </div>
      </Section>
    </>
  );
}

function PathPanel({
  eyebrow,
  title,
  points,
  primary,
  secondary,
  accent = false,
}: {
  eyebrow: string;
  title: string;
  points: string[];
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  accent?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-[var(--radius-panel)] border p-6 sm:p-8 ${accent ? "border-gold-200 bg-gold-50" : "border-steel-200 bg-steel-50"}`}>
      <p className="text-sm font-semibold tracking-wide text-steel-600 uppercase">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-extrabold text-steel-950 sm:text-3xl">{title}</h3>
      <ul className="mt-5 flex-1 space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5 text-steel-800">
            <Icon name="check" className="mt-1 size-4 text-gold-800" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <ButtonLink href={primary.href} variant={accent ? "dark" : "primary"}>
          {primary.label}
        </ButtonLink>
        <Link href={secondary.href} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-steel-900 hover:underline">
          {secondary.label} <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </div>
  );
}
