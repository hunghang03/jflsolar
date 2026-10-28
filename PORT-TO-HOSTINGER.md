# Changes to replicate in the Hostinger (PHP) edition

From 2026-10-19 changes are made here first (Vercel + Supabase), then copied to
the Laravel edition in `hunghang03/jflsolar-php`. Each entry lists what changed,
where, and the PHP equivalent. Tick an entry when it is ported, tested and
released to Hostinger.

---

## 2026-10-19 — Header phone, package photos, editable page text

### 1. Header: phone number removed  ☑ ported 2026-10-28
- **Next.js:** `components/layout/SiteHeader.tsx` — removed the phone link (icon +
  `0969 471 2098`) between the navigation and “Request a Quote”. The mobile menu
  contacts, footer, Contact page and Services call-to-action still show the number.
- **PHP:** `resources/views/partials/site-header.blade.php` — remove the `tel:` link
  (phone icon + `phone_display`) next to the desktop nav.

### 2. Package cards show the cover photo on the Solar Packages page  ☑ ported 2026-10-28
- **Next.js:** `components/catalog/PackageCard.tsx` gets `showImage` (+ `mediaScope`).
  Cover image (or first image) at the top of the card in a fixed 16:10 frame,
  image absolutely positioned with `object-contain` on white; no photo →
  “Package photo pending” placeholder. Card spans 7 subgrid rows instead of 6
  when the image is shown. Used on `/packages` and in the admin card preview;
  the home page “Start from a package” cards are unchanged.
- `components/ui/Media.tsx`: `MediaImage` gets `fit="cover" | "contain"` (no more
  conflicting `object-cover` + `object-contain` classes).
- **PHP:** `components/package-card.blade.php` — add a `showImage` prop with the same
  frame (`relative aspect-[16/10] -mx-5 -mt-5 mb-5 border-b … sm:-mx-6 sm:-mt-6`,
  `x-media-image fit="contain" class="absolute inset-0"`, placeholder label
  “Package photo pending”), `row-span-7` when shown, `overflow-hidden` on the card;
  pass `show-image` from `pages/packages.blade.php` and the admin package preview.
  `$pkg->images` is already loaded by `PublicContent`.

### 3. Page text editable in the admin (Home, Solar Services, About)  ☑ ported 2026-10-28
- **New table** `page_texts (key text PK, value text 1–1200 chars, updated_at, updated_by)`
  — `supabase/migrations/20261019000100_page_texts.sql`. Public read; staff
  insert/update/delete (RLS). A missing row = original wording. Functions
  `page_texts_version(keys)` (md5 of the page's `key@updated_at` pairs, `none` when
  empty) and `save_page_texts(keys, version, set jsonb, delete[])` — staff only,
  keys limited to the page, version re-checked under `pg_advisory_xact_lock`, then
  delete + upsert in the same transaction (Codex: no lost concurrent edits).
  **Deploy order:** the site tolerates the table being absent (defaults shown), so
  code can go first; editing is enabled once the SQL is run in Supabase.
- **Registry** `lib/page-text.ts`: `PAGE_TEXT_DEFAULTS` (every key + original copy),
  `TEXT_PAGES` (admin layout: page → groups → fields with label and kind
  `line | paragraph | list`), `textGetter`, `lines`, `cleanText`
  (line/paragraph: newlines → spaces; list: one item per line, bullets stripped,
  max 8; max 160 / 1200 / 600 chars). Saving the default or an empty box deletes
  the row.
- **Also editable** (Codex): button and link labels on the three pages (hero buttons,
  pathway button/link, service-card links, “All packages”, “All projects”, “About
  JFL Solar”, “Request a Quote” buttons, Services header buttons, “Often suits:”,
  “Prefer to talk? Call”, “Only need equipment?” / “Browse products”, About
  “Founder” label). Not editable: screen-reader-only headings, hero photo alt text,
  page SEO descriptions.
- **Public pages:** `app/(site)/page.tsx`, `services/page.tsx`, `about/page.tsx` read
  `t(key)`; `lib/services.ts` now builds services / process steps / audiences /
  system types from `t` (icons and links stay in code). Process steps are shared
  by Home and Services (`services.step1–6.*`). `getPublicSnapshot()` now returns
  `texts`; `getPageText()` selector added.
- **Admin:** nav item “Page text” → `/admin/text/{home|services|about}` (tabs),
  `components/admin/forms/PageTextForm.tsx`, action `app/admin/actions/page-text.ts`
  (version token from `page_texts_version`; one `save_page_texts` RPC with only the
  changed keys; content cache tag refreshed). Shows “Changed.
  Original: …” under edited fields.
- **PHP:**
  1. Migration + `upgrade-<date>.sql` for existing Hostinger installs:
     `CREATE TABLE page_texts (\`key\` varchar(80) PK, value text NOT NULL,
     updated_at timestamp NULL, updated_by bigint unsigned NULL FK users SET NULL)`;
     regenerate `database/schema/jflsolar.sql`.
  2. `app/Support/PageText.php`: port `PAGE_TEXT_DEFAULTS`, `TEXT_PAGES`, `clean()`,
     `lines()`; `PublicContent` caches the overrides with the snapshot.
  3. Blade pages `pages/home`, `pages/services`, `pages/about` + `App\Support\Services`
     use `PageText::get()`.
  4. Admin: route group `admin/text/{page}` (GET form, POST save, staff), nav item,
     view with tabs; in a DB transaction: `lockForUpdate`/`GET_LOCK`, recompute the
     page version, compare, delete + upsert; `PublicContent::flush()` on save.
  5. Data copy: `jfl:copy-from-supabase` must export `page_texts` too.
  6. Tests: rules for clean/lines; feature test that an override shows and an empty
     value restores the default.

### 4. Ported back from the Hostinger review (Codex H2)  ☐ n/a (already in PHP)
- Product cards: image absolutely positioned in a fixed 4:3 frame (equal card heights).
- Form control borders `steel-400` → `steel-500` (≈4.4:1 contrast) in admin fields,
  image manager, settings/staff inputs, product filters, inquiry form, compare checkbox.

---

## 2026-10-20 — Inquiries saved in the admin (Vercel catches up with Hostinger)

The Hostinger edition already saves inquiries (Admin → Inquiries, email alert
optional), so there is little to port. Check for parity:

- **Demo notice:** Vercel now shows the “Demo form” notice only when neither saving
  (Supabase + secret key) nor email is configured. PHP never shows it — no change.
- **Admin:** same tabs (New / Handled / Archived with counts), detail page, status
  buttons, staff notes, delete only when archived. Vercel added paging (50 per page,
  `?page=N`); the PHP list already paginates with Laravel’s paginator — no change.
- **Privacy page:** Vercel now uses the PHP wording (“saved in this website’s
  database … a copy may be emailed”) — no change.
- **Permissions:** Vercel revokes Supabase’s default table privileges on new tables
  (`inquiries`, `page_texts`). MySQL has no equivalent API roles — not applicable.
  ☑ nothing to port; `jfl:copy-from-supabase` now also copies `inquiries` (2026-10-28)

---

## 2026-10-28 — Port to the Hostinger edition done (jflsolar-php)

Entries 1–3 ported and tested (PHP tests 23/23, browser e2e 47/47, Codex H3 PASS).
PHP specifics: the registry `app/Support/PageTextData.php` is generated from
`lib/page-text.ts` — when a field is added here, add it there too (same key,
default, label). Form field names use `__` instead of dots (PHP turns dots in POST
names into underscores). Version token = md5 of the page’s key=value pairs; saving
runs under `Cache::lock` + a transaction. Existing Hostinger installs import
`upgrade-2026-10-28.sql` (it ships in the release zip).

Found while porting and fixed here too: the “Package photo pending” placeholder was
given `absolute` on top of its own `relative` class; it is now wrapped in an
absolutely positioned div (no visible change while every package has a photo).
