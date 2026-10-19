// Editable page wording (Admin → Page text). Defaults are the original site copy;
// staff edits are stored in public.page_texts as overrides, and an empty field
// restores the default. Only plain text: no HTML, no Markdown.

export const PAGE_TEXT_DEFAULTS = {
  // Home — hero
  "home.hero.eyebrow": "PV System Solutions",
  "home.hero.title": "Solar power, properly engineered and supplied.",
  "home.hero.button1": "Request a Quote",
  "home.hero.button2": "Browse equipment",
  "home.hero.intro":
    "JFL Solar designs and installs solar PV systems for homes and businesses, advises on the right system, and supplies quality equipment to DIY buyers and professional installers.",
  // Home — two pathways
  "home.path1.eyebrow": "For homes and businesses",
  "home.path1.title": "I want solar installed",
  "home.path1.points": "Site assessment and system design\nOn-grid, hybrid or off-grid\nInstallation and commissioning",
  "home.path1.button": "Explore installation",
  "home.path1.link": "Installed packages",
  "home.path2.eyebrow": "For DIY buyers and installers",
  "home.path2.title": "I'm buying equipment",
  "home.path2.points": "Panels, inverters and batteries\nMounting, cables and protection devices\nEquipment-only bundles",
  "home.path2.button": "Browse products",
  "home.path2.link": "Equipment bundles",
  // Home — what we do
  "home.services.eyebrow": "What we do",
  "home.services.title": "Installation, consultancy and equipment supply",
  "home.service1.title": "Solar installation",
  "home.service1.link": "How installation works",
  "home.service1.body": "Supply, installation and commissioning of solar PV systems for homes, commercial buildings and industrial sites.",
  "home.service2.title": "Consultancy",
  "home.service2.link": "About consultancy",
  "home.service2.body": "Advice on system type, sizing and equipment, from a first conversation to a written proposal.",
  "home.service3.title": "Equipment distribution",
  "home.service3.link": "Browse equipment",
  "home.service3.body": "Panels, inverters, batteries, mounting hardware, cabling and protection devices for DIY buyers and professional installers.",
  // Home — sections
  "home.packages.eyebrow": "Packages",
  "home.packages.title": "Start from a package",
  "home.packages.button": "All packages",
  "home.packages.intro": "Installed systems include design, installation and commissioning. Equipment bundles are supply only.",
  "home.equipment.eyebrow": "Equipment",
  "home.equipment.title": "Equipment for every part of the system",
  "home.equipment.intro": "Ask for a product quotation, or browse specifications and datasheets where available.",
  "home.equipment.count": "listed",
  "home.process.eyebrow": "How a project works",
  "home.process.title": "From consultancy to after-sales support",
  "home.process.intro": "Scheduling, site assessment, delivery charges and feasibility are confirmed during quotation.",
  "home.projects.eyebrow": "Projects",
  "home.projects.title": "Project showcase",
  "home.projects.button": "All projects",
  "home.why.eyebrow": "Why JFL Solar",
  "home.why.title": "Support that continues after handover",
  "home.why.link": "About JFL Solar",
  "home.contact.eyebrow": "Talk to us",
  "home.contact.title": "Request a quotation",
  "home.contact.button": "Request a Quote",

  // Solar Services
  "services.header.eyebrow": "Solar services",
  "services.header.title": "Solar PV for homes, businesses and industry",
  "services.header.button1": "Request a Quote",
  "services.header.button2": "View packages",
  "services.header.intro": "Consultancy, assessment, installation and after-sales support — or equipment only, if you have your own installer.",
  "services.who.eyebrow": "Who we work with",
  "services.who.title": "Residential, commercial and industrial",
  "services.audience1.title": "Residential",
  "services.audience1.body":
    "Rooftop systems for houses — focused on reducing electricity bills and, with a battery, keeping essential loads running during outages.",
  "services.audience1.points": "Bill and load review\nOn-grid or hybrid design\nBattery sizing for backup",
  "services.audience2.title": "Commercial",
  "services.audience2.body": "Offices, shops, schools and other establishments with significant daytime consumption.",
  "services.audience2.points": "Load profile review\nRoof and structural check\nEngineered proposal",
  "services.audience3.title": "Industrial",
  "services.audience3.body": "Factories, warehouses and larger sites where system design must account for heavy loads and site constraints.",
  "services.audience3.points": "Site assessment\nSystem design and equipment selection\nCoordinated installation",
  "services.process.eyebrow": "Our process",
  "services.process.title": "Six stages, one accountable team",
  "services.step1.title": "Consultancy",
  "services.step1.body": "We explain on-grid, hybrid and off-grid options and the trade-offs, so the system matches how you use power.",
  "services.step2.title": "Assessment",
  "services.step2.body": "We review your electricity bills, loads and goals, then assess the roof or site to confirm what is feasible.",
  "services.step3.title": "Proposal",
  "services.step3.body": "You receive a written proposal with the system design, equipment list, inclusions, exclusions and price.",
  "services.step4.title": "Installation",
  "services.step4.body": "Mounting, panels, inverter, batteries, cabling and protection devices are installed to the agreed design.",
  "services.step5.title": "Commissioning",
  "services.step5.body": "The system is tested, configured and handed over, with a walkthrough of how to monitor it.",
  "services.step6.title": "After-sales support",
  "services.step6.body": "Help with settings, troubleshooting and warranty coordination after handover. Terms are stated in your quotation.",
  "services.types.eyebrow": "System types",
  "services.types.title": "On-grid, hybrid or off-grid?",
  "services.types.intro":
    "The right choice depends on your loads, your grid reliability and whether you need backup power. We confirm suitability during assessment.",
  "services.type1.lead": "Lower daytime bills",
  "services.type1.title": "On-grid",
  "services.type1.body":
    "Solar power is used first and the grid covers the rest. No battery, so it does not provide power during an outage. Usually the simplest system.",
  "services.type1.suits": "Homes and businesses with high daytime use and a reliable grid.",
  "services.type2.lead": "Savings plus backup",
  "services.type2.title": "Hybrid",
  "services.type2.body": "Solar with a battery and a grid connection. Stored energy can run essential loads at night or during outages.",
  "services.type2.suits": "Homes and businesses that want backup power for outages.",
  "services.type3.lead": "Independent power",
  "services.type3.title": "Off-grid",
  "services.type3.body": "Solar and batteries with no grid connection. The system must be sized for every load and season, so assessment is essential.",
  "services.type3.suits": "Sites without a grid connection, or where a connection is impractical.",
  "services.types.suits_label": "Often suits:",
  "services.types.note":
    "Savings, backup duration and payback depend on your consumption, tariff, roof and equipment. We do not quote guaranteed savings; your proposal will explain the assumptions behind any estimate.",
  "services.cta.title": "Ready for an assessment?",
  "services.cta.text": "Tell us about your property and electricity use.",
  "services.cta.call": "Prefer to talk? Call",
  "services.cta.button": "Request a Quote",
  "services.cta.equipment": "Only need equipment?",
  "services.cta.equipment_link": "Browse products",

  // About
  "about.header.eyebrow": "About us",
  "about.founder.eyebrow": "Founder",
  "about.why.eyebrow": "Why choose us",
  "about.why.title": "Quality, warranty assistance and support",
  "about.warranty.eyebrow": "Warranty",
  "about.warranty.title": "Warranty information",
  "about.location.title": "Where to find us",
  "about.contact.button": "Request a Quote",
} as const;

export type PageTextKey = keyof typeof PAGE_TEXT_DEFAULTS;
export type PageTexts = Partial<Record<PageTextKey, string>>;

export const PAGE_TEXT_KEYS = Object.keys(PAGE_TEXT_DEFAULTS) as PageTextKey[];
export const isPageTextKey = (k: string): k is PageTextKey => Object.hasOwn(PAGE_TEXT_DEFAULTS, k);

/** Lookup with fallback to the original wording. */
export function textGetter(overrides: PageTexts) {
  return (key: PageTextKey): string => overrides[key] || PAGE_TEXT_DEFAULTS[key];
}

/** "One item per line" fields → list items. */
export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Admin layout: which fields appear on which page, in plain language.
// ---------------------------------------------------------------------------

export type FieldKind = "line" | "paragraph" | "list";
export const FIELD_MAX: Record<FieldKind, number> = { line: 160, paragraph: 1200, list: 600 };
export const LIST_MAX_ITEMS = 8;

export interface TextFieldDef {
  key: PageTextKey;
  label: string;
  kind: FieldKind;
}
export interface TextGroupDef {
  title: string;
  note?: string;
  fields: TextFieldDef[];
}
export interface TextPageDef {
  slug: "home" | "services" | "about";
  name: string;
  path: string;
  note?: string;
  groups: TextGroupDef[];
}

const line = (key: PageTextKey, label: string): TextFieldDef => ({ key, label, kind: "line" });
const para = (key: PageTextKey, label: string): TextFieldDef => ({ key, label, kind: "paragraph" });
const list = (key: PageTextKey, label: string): TextFieldDef => ({ key, label, kind: "list" });
const heading = (prefix: string, intro = false): TextFieldDef[] => [
  line(`${prefix}.eyebrow` as PageTextKey, "Small label above the heading"),
  line(`${prefix}.title` as PageTextKey, "Heading"),
  ...(intro ? [para(`${prefix}.intro` as PageTextKey, "Introduction")] : []),
];

export const TEXT_PAGES: TextPageDef[] = [
  {
    slug: "home",
    name: "Home",
    path: "/",
    note: "Packages, products, projects and “Why choose us” items are managed in their own sections; this page covers the wording around them.",
    groups: [
      {
        title: "Top of the page (hero)",
        fields: [
          line("home.hero.eyebrow", "Small label above the headline"),
          line("home.hero.title", "Headline"),
          para("home.hero.intro", "Introduction"),
          line("home.hero.button1", "Main button"),
          line("home.hero.button2", "Second button"),
        ],
      },
      {
        title: "Two pathways",
        fields: [
          line("home.path1.eyebrow", "Left panel — small label"),
          line("home.path1.title", "Left panel — heading"),
          list("home.path1.points", "Left panel — ticked points"),
          line("home.path1.button", "Left panel — button"),
          line("home.path1.link", "Left panel — link"),
          line("home.path2.eyebrow", "Right panel — small label"),
          line("home.path2.title", "Right panel — heading"),
          list("home.path2.points", "Right panel — ticked points"),
          line("home.path2.button", "Right panel — button"),
          line("home.path2.link", "Right panel — link"),
        ],
      },
      {
        title: "What we do",
        fields: [
          ...heading("home.services"),
          ...[1, 2, 3].flatMap((n) => [
            line(`home.service${n}.title` as PageTextKey, `Card ${n} — title`),
            para(`home.service${n}.body` as PageTextKey, `Card ${n} — text`),
            line(`home.service${n}.link` as PageTextKey, `Card ${n} — link`),
          ]),
        ],
      },
      { title: "Packages", fields: [...heading("home.packages", true), line("home.packages.button", "Button")] },
      { title: "Equipment", fields: [...heading("home.equipment", true), line("home.equipment.count", "Word after each category’s product count (e.g. “4 listed”)")] },
      { title: "How a project works", note: "The six steps are edited on the Solar Services tab — they appear on both pages.", fields: heading("home.process", true) },
      { title: "Project showcase", fields: [...heading("home.projects"), line("home.projects.button", "Button")] },
      { title: "Why JFL Solar", note: "The items in this section are edited under Site content.", fields: [...heading("home.why"), line("home.why.link", "Link under the section")] },
      { title: "Request a quotation", note: "The text under this heading is the service-area note in Contact & settings.", fields: [...heading("home.contact"), line("home.contact.button", "Button")] },
    ],
  },
  {
    slug: "services",
    name: "Solar Services",
    path: "/services",
    groups: [
      {
        title: "Top of the page",
        fields: [...heading("services.header", true), line("services.header.button1", "Main button"), line("services.header.button2", "Second button")],
      },
      {
        title: "Who we work with",
        fields: [
          ...heading("services.who"),
          ...[1, 2, 3].flatMap((n) => [
            line(`services.audience${n}.title` as PageTextKey, `Card ${n} — title`),
            para(`services.audience${n}.body` as PageTextKey, `Card ${n} — text`),
            list(`services.audience${n}.points` as PageTextKey, `Card ${n} — ticked points`),
          ]),
        ],
      },
      {
        title: "Our process",
        note: "The six steps also appear on the home page. The text under the heading is the service-area note in Contact & settings.",
        fields: [
          ...heading("services.process"),
          ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
            line(`services.step${n}.title` as PageTextKey, `Step ${n} — title`),
            para(`services.step${n}.body` as PageTextKey, `Step ${n} — text`),
          ]),
        ],
      },
      {
        title: "System types",
        fields: [
          ...heading("services.types", true),
          ...[1, 2, 3].flatMap((n) => [
            line(`services.type${n}.lead` as PageTextKey, `Type ${n} — small label`),
            line(`services.type${n}.title` as PageTextKey, `Type ${n} — name`),
            para(`services.type${n}.body` as PageTextKey, `Type ${n} — text`),
            line(`services.type${n}.suits` as PageTextKey, `Type ${n} — “Often suits”`),
          ]),
          line("services.types.suits_label", "Label before each “Often suits” text"),
          para("services.types.note", "Note under the system types"),
        ],
      },
      {
        title: "Closing call to action",
        note: "The phone number after “Prefer to talk? Call” comes from Contact & settings.",
        fields: [
          line("services.cta.title", "Heading"),
          para("services.cta.text", "Text"),
          line("services.cta.call", "Words before the phone number"),
          line("services.cta.button", "Button"),
          line("services.cta.equipment", "Equipment line — question"),
          line("services.cta.equipment_link", "Equipment line — link"),
        ],
      },
    ],
  },
  {
    slug: "about",
    name: "About",
    path: "/about",
    note: "The introduction, story, mission, vision, founder profile and “Why choose us” items are edited under Site content. The warranty text is in Contact & settings.",
    groups: [
      { title: "Top of the page", fields: [line("about.header.eyebrow", "Small label above the heading")] },
      { title: "Founder", note: "The founder’s name, role, text and photo are edited under Site content.", fields: [line("about.founder.eyebrow", "Small label above the founder’s name")] },
      { title: "Why choose us", fields: heading("about.why") },
      { title: "Warranty and location", fields: [...heading("about.warranty"), line("about.location.title", "“Where to find us” heading"), line("about.contact.button", "Button")] },
    ],
  },
];

/** Validate and normalise one submitted value. Returns the cleaned text or an error. */
export function cleanText(field: TextFieldDef, raw: string): { value: string } | { error: string } {
  // Headings and paragraphs are shown as a single line/paragraph, so line breaks become spaces.
  let v = raw.replace(/\r\n?/g, "\n");
  v = field.kind === "list" ? lines(v).join("\n") : v.replace(/\s*\n\s*/g, " ");
  v = v.trim();
  const max = FIELD_MAX[field.kind];
  if (v.length > max) return { error: `${field.label}: use ${max} characters or fewer.` };
  if (field.kind === "list" && lines(v).length > LIST_MAX_ITEMS) return { error: `${field.label}: use ${LIST_MAX_ITEMS} points or fewer.` };
  return { value: v };
}
