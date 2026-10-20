import { test } from "node:test";
import assert from "node:assert/strict";
import { addUser, asRole, createDb } from "./harness";

const OWNER = "11111111-1111-4111-8111-111111111111";
const EDITOR = "22222222-2222-4222-8222-222222222222";
const STRANGER = "33333333-3333-4333-8333-333333333333";
const UNCONFIRMED = "44444444-4444-4444-8444-444444444444";
const REVOKED = "55555555-5555-4555-8555-555555555555";

async function setup() {
  const db = await createDb();
  await addUser(db, OWNER, "owner@example.com");
  await addUser(db, EDITOR, "Editor@Example.com"); // case-insensitive match
  await addUser(db, STRANGER, "stranger@gmail.com");
  await addUser(db, UNCONFIRMED, "pending@example.com", false);
  await addUser(db, REVOKED, "revoked@example.com");
  await db.exec(`
    insert into public.staff_members (email, role) values
      ('owner@example.com', 'owner'),
      ('editor@example.com', 'editor'),
      ('pending@example.com', 'editor');
    insert into public.staff_members (email, role, active) values ('revoked@example.com', 'editor', false);
    insert into public.packages (slug, name, package_type, status) values ('secret-draft', 'Secret draft', 'installed_system', 'draft');
    insert into public.packages (slug, name, package_type, status, is_sample) values ('real-package', 'Real package', 'installed_system', 'published', false);
  `);
  return db;
}

const count = async (db: Awaited<ReturnType<typeof createDb>>, sql: string) =>
  Number(((await db.query<{ n: number }>(sql)).rows[0] as { n: number }).n);

test("anonymous visitors see only published packages; samples visible only in preview mode", async () => {
  const db = await setup();
  const slugs = async () =>
    (await asRole(db, "anon", null, () => db.query<{ slug: string }>(`select slug from public.packages order by slug`))).rows.map((r) => r.slug);

  const preview = await slugs();
  assert.ok(!preview.includes("secret-draft"), "draft must be hidden");
  assert.ok(preview.includes("trio-6kw-hybrid-equipment-bundle"), "sample visible in preview mode");

  await db.exec(`update public.deployment_config set content_mode = 'production'`);
  const production = await slugs();
  assert.deepEqual(production, ["real-package"], "production mode hides samples and drafts");
});

test("anonymous visitors cannot read admin-only columns or write content", async () => {
  const db = await setup();
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select admin_notes from public.packages`)), /permission denied/);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select review_note from public.content_blocks`)), /permission denied/);
  await assert.rejects(
    asRole(db, "anon", null, () => db.query(`insert into public.packages (slug, name, package_type) values ('x-y', 'Hack', 'installed_system')`)),
    /permission denied/,
  );
  await assert.rejects(asRole(db, "anon", null, () => db.query(`update public.site_settings set phone_display = 'hacked'`)), /permission denied/);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select * from public.staff_members`)), /permission denied/);
});

test("Google sign-in alone grants nothing: non-staff, unconfirmed and revoked users are not staff", async () => {
  const db = await setup();
  for (const user of [STRANGER, UNCONFIRMED, REVOKED]) {
    const isStaff = await asRole(db, "authenticated", user, () => db.query<{ s: boolean }>(`select public.is_staff() as s`));
    assert.equal(isStaff.rows[0].s, false, `user ${user} must not be staff`);
    const visible = await asRole(db, "authenticated", user, () => db.query(`select id from public.packages`));
    assert.equal(visible.rows.length, 0, "non-staff authenticated users get no admin reads");
    const updated = await asRole(db, "authenticated", user, () =>
      db.query(`update public.packages set name = 'Hacked' where slug = 'real-package' returning id`),
    );
    assert.equal(updated.rows.length, 0, "non-staff update must affect no rows");
    await assert.rejects(
      asRole(db, "authenticated", user, () => db.query(`insert into public.packages (slug, name, package_type) values ('h-x', 'Hack', 'installed_system')`)),
      /row-level security/,
    );
  }
});

test("staff editors can manage content including drafts, but not staff membership", async () => {
  const db = await setup();
  const role = await asRole(db, "authenticated", EDITOR, () => db.query<{ r: string }>(`select public.current_staff_role() as r`));
  assert.equal(role.rows[0].r, "editor");

  const drafts = await asRole(db, "authenticated", EDITOR, () => db.query(`select id from public.packages where status = 'draft'`));
  assert.equal(drafts.rows.length, 1);

  await asRole(db, "authenticated", EDITOR, () =>
    db.query(`insert into public.packages (slug, name, package_type) values ('new-draft', 'New draft', 'equipment_bundle')`),
  );
  const updated = await asRole(db, "authenticated", EDITOR, () =>
    db.query<{ updated_by: string }>(`update public.packages set status = 'published' where slug = 'new-draft' returning updated_by`),
  );
  assert.equal(updated.rows[0].updated_by, EDITOR, "updated_by is stamped from auth.uid()");

  await assert.rejects(
    asRole(db, "authenticated", EDITOR, () => db.query(`insert into public.staff_members (email, role) values ('friend@example.com', 'owner')`)),
    /row-level security/,
  );
  const selfPromote = await asRole(db, "authenticated", EDITOR, () =>
    db.query(`update public.staff_members set role = 'owner' where email = 'editor@example.com' returning id`),
  );
  assert.equal(selfPromote.rows.length, 0, "editors cannot promote themselves");
  const stillEditor = await asRole(db, "authenticated", EDITOR, () => db.query<{ r: string }>(`select public.current_staff_role() as r`));
  assert.equal(stillEditor.rows[0].r, "editor");
});

test("owners manage staff, and the last active owner cannot be removed or demoted", async () => {
  const db = await setup();
  await asRole(db, "authenticated", OWNER, () => db.query(`insert into public.staff_members (email, role) values ('new@example.com', 'editor')`));
  assert.equal(await count(db, `select count(*) as n from public.staff_members where email = 'new@example.com'`), 1);

  await assert.rejects(
    asRole(db, "authenticated", OWNER, () => db.query(`update public.staff_members set role = 'editor' where email = 'owner@example.com'`)),
    /last active owner/,
  );
  await assert.rejects(
    asRole(db, "authenticated", OWNER, () => db.query(`delete from public.staff_members where email = 'owner@example.com'`)),
    /last active owner/,
  );
  await assert.rejects(
    asRole(db, "authenticated", OWNER, () => db.query(`insert into public.staff_members (email, role) values ('Bad Email', 'editor')`)),
    /check constraint/,
  );
});

test("deployment mode cannot be changed through the API, even by owners", async () => {
  const db = await setup();
  await assert.rejects(
    asRole(db, "authenticated", OWNER, () => db.query(`update public.deployment_config set content_mode = 'preview'`)),
    /permission denied/,
  );
});

test("content blocks needing confirmation are hidden from the public in production mode", async () => {
  const db = await setup();
  const keys = async () =>
    (await asRole(db, "anon", null, () => db.query<{ key: string }>(`select key from public.content_blocks`))).rows.map((r) => r.key);
  assert.ok((await keys()).includes("why.warranty"));
  await db.exec(`update public.deployment_config set content_mode = 'production'`);
  const prod = await keys();
  assert.ok(!prod.includes("why.warranty"));
  assert.ok(prod.includes("about.intro"), "confirmed blocks stay public");
});

test("storage: anonymous reads only media of public records; only staff can upload or delete", async () => {
  const db = await setup();
  const pkg = (await db.query<{ id: string }>(`select id from public.packages where slug = 'real-package'`)).rows[0].id;
  const draft = (await db.query<{ id: string }>(`select id from public.packages where slug = 'secret-draft'`)).rows[0].id;
  const k1 = `packages/${pkg}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`;
  const k2 = `packages/${draft}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`;
  await db.query(
    `insert into public.media_assets (kind, storage_key, package_id, alt) values ('image', $1, $2, 'Public'), ('image', $3, $4, 'Draft')`,
    [k1, pkg, k2, draft],
  );
  await db.query(`insert into storage.objects (bucket_id, name) values ('media', $1), ('media', $2)`, [`${k1}/640.webp`, `${k2}/640.webp`]);

  const anonObjects = await asRole(db, "anon", null, () => db.query<{ name: string }>(`select name from storage.objects`));
  assert.deepEqual(anonObjects.rows.map((r) => r.name), [`${k1}/640.webp`]);
  const anonMedia = await asRole(db, "anon", null, () => db.query(`select id from public.media_assets`));
  assert.equal(anonMedia.rows.length, 1);

  await assert.rejects(
    asRole(db, "anon", null, () => db.query(`insert into storage.objects (bucket_id, name) values ('media', 'packages/x/y.webp')`)),
    /row-level security/,
  );
  await assert.rejects(
    asRole(db, "authenticated", STRANGER, () => db.query(`insert into storage.objects (bucket_id, name) values ('media', 'packages/x/y.webp')`)),
    /row-level security/,
  );
  const strangerDelete = await asRole(db, "authenticated", STRANGER, () => db.query(`delete from storage.objects returning id`));
  assert.equal(strangerDelete.rows.length, 0);

  await asRole(db, "authenticated", EDITOR, () =>
    db.query(`insert into storage.objects (bucket_id, name) values ('media', $1)`, [`${k2}/1280.webp`]),
  );
  const staffObjects = await asRole(db, "authenticated", EDITOR, () => db.query(`select name from storage.objects`));
  assert.equal(staffObjects.rows.length, 3, "staff can see draft media");

  // Unpublishing withdraws public access immediately at the data layer.
  await db.exec(`update public.packages set status = 'draft' where slug = 'real-package'`);
  const afterUnpublish = await asRole(db, "anon", null, () => db.query(`select name from storage.objects`));
  assert.equal(afterUnpublish.rows.length, 0);
});

test("inquiry rate limiting is server-only and enforces client and global limits", async () => {
  const db = await setup();
  const hash = "a".repeat(64);
  await assert.rejects(
    asRole(db, "anon", null, () => db.query(`select public.inquiry_rate_check($1, 5, 600, 80)`, [hash])),
    /permission denied/,
  );
  const call = (h: string, cap = 80) =>
    asRole(db, "service_role", null, () => db.query<{ r: string }>(`select public.inquiry_rate_check($1, 2, 600, $2) as r`, [h, cap]));
  assert.equal((await call(hash)).rows[0].r, "ok");
  assert.equal((await call(hash)).rows[0].r, "ok");
  assert.equal((await call(hash)).rows[0].r, "client_limited");
  assert.equal((await call("b".repeat(64), 2)).rows[0].r, "global_limited");
  await assert.rejects(call("not-a-hash"), /invalid client hash/);
});

test("schema constraints reject invalid content", async () => {
  const db = await setup();
  const bad = [
    `insert into public.packages (slug, name, package_type) values ('Bad Slug', 'x1', 'installed_system')`,
    `insert into public.packages (slug, name, package_type, pricing_mode) values ('fixed-no-price', 'x1', 'installed_system', 'fixed')`,
    `insert into public.packages (slug, name, package_type, pricing_mode, price_php) values ('quote-with-price', 'x1', 'installed_system', 'quote', 5)`,
    `insert into public.packages (slug, name, package_type, promo_start, promo_end) values ('promo-backwards', 'x1', 'installed_system', '2026-10-31', '2026-10-01')`,
    `insert into public.packages (slug, name, package_type) values ('trio-6kw-hybrid-equipment-bundle', 'dup', 'installed_system')`,
    `update public.site_settings set phone_e164 = '0969'`,
    `update public.site_settings set facebook_enabled = true, facebook_url = null`,
    `insert into public.media_assets (kind, storage_key, project_id, alt) values ('datasheet', 'projects/00000000-0000-4000-8000-000000000301/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-4000-8000-000000000301', 'x')`,
    `insert into public.media_assets (kind, storage_key, project_id, alt) values ('image', 'projects/00000000-0000-4000-8000-000000000301/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', '00000000-0000-4000-8000-000000000301', ' ')`,
  ];
  for (const sql of bad) {
    await assert.rejects(db.query(sql), Error, sql);
  }
});

test("admin integrity functions: cover, media reorder and record reorder are staff-only and atomic", async () => {
  const db = await setup();
  const proj = "00000000-0000-4000-8000-000000000301";
  const ids = ["a1", "a2", "a3"].map((s, i) => `aaaaaaa${i}-aaaa-4aaa-8aaa-aaaaaaaaaaaa`);
  for (const [i, id] of ids.entries()) {
    await db.query(
      `insert into public.media_assets (id, kind, storage_key, project_id, alt, sort_order, is_cover) values ($1, 'image', $2, $3, 'Photo', $4, $5)`,
      [id, `projects/${proj}/${id}`, proj, (i + 1) * 10, i === 0],
    );
  }
  await assert.rejects(asRole(db, "authenticated", STRANGER, () => db.query(`select public.media_set_cover($1)`, [ids[2]])), /not allowed/);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select public.media_set_cover($1)`, [ids[2]])), /permission denied/);

  await asRole(db, "authenticated", EDITOR, () => db.query(`select public.media_set_cover($1)`, [ids[2]]));
  const covers = await db.query<{ id: string }>(`select id from public.media_assets where project_id = $1 and is_cover`, [proj]);
  assert.deepEqual(covers.rows.map((r) => r.id), [ids[2]], "exactly one cover");

  await asRole(db, "authenticated", EDITOR, () => db.query(`select public.media_move($1, -1)`, [ids[2]]));
  const order = await db.query<{ id: string }>(`select id from public.media_assets where project_id = $1 order by sort_order`, [proj]);
  assert.deepEqual(order.rows.map((r) => r.id), [ids[0], ids[2], ids[1]]);

  const before = (await db.query<{ slug: string }>(`select slug from public.packages where status <> 'archived' order by sort_order, created_at`)).rows.map((r) => r.slug);
  const second = (await db.query<{ id: string }>(`select id from public.packages where slug = $1`, [before[1]])).rows[0].id;
  await asRole(db, "authenticated", EDITOR, () => db.query(`select public.record_move('packages', $1, -1)`, [second]));
  const after = (await db.query<{ slug: string }>(`select slug from public.packages where status <> 'archived' order by sort_order`)).rows.map((r) => r.slug);
  assert.deepEqual(after.slice(0, 2), [before[1], before[0]]);
  await assert.rejects(asRole(db, "authenticated", EDITOR, () => db.query(`select public.record_move('staff_members', $1, 1)`, [second])), /invalid table/);
  await assert.rejects(asRole(db, "authenticated", STRANGER, () => db.query(`select public.record_move('packages', $1, 1)`, [second])), /not allowed/);
});

test("page text: everyone reads it, only active staff change it, and values are bounded", async () => {
  const db = await setup();
  await db.exec(`insert into public.page_texts (key, value) values ('home.hero.title', 'Edited headline')`);
  const anonRead = await asRole(db, "anon", null, () => db.query<{ value: string }>(`select value from public.page_texts where key = 'home.hero.title'`));
  assert.equal(anonRead.rows[0]?.value, "Edited headline");
  await assert.rejects(asRole(db, "anon", null, () => db.query(`update public.page_texts set value = 'hacked'`)), /permission denied/);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`insert into public.page_texts (key, value) values ('home.hero.intro', 'x')`)), /permission denied/);

  for (const outsider of [STRANGER, REVOKED, UNCONFIRMED]) {
    await assert.rejects(
      asRole(db, "authenticated", outsider, () => db.query(`insert into public.page_texts (key, value) values ('home.hero.intro', 'x')`)),
      /row-level security/,
    );
    await asRole(db, "authenticated", outsider, () => db.query(`delete from public.page_texts`));
  }
  assert.equal(await count(db, `select count(*)::int as n from public.page_texts`), 1, "outsiders cannot delete");

  await asRole(db, "authenticated", EDITOR, () =>
    db.query(`insert into public.page_texts (key, value) values ('home.hero.title', 'By editor') on conflict (key) do update set value = excluded.value`),
  );
  const row = await db.query<{ value: string; updated_by: string }>(`select value, updated_by from public.page_texts where key = 'home.hero.title'`);
  assert.equal(row.rows[0]?.value, "By editor");
  assert.equal(row.rows[0]?.updated_by, EDITOR);

  await assert.rejects(db.query(`insert into public.page_texts (key, value) values ('Bad Key', 'x')`), /check constraint/);
  await assert.rejects(db.query(`insert into public.page_texts (key, value) values ('home.x', '   ')`), /check constraint/);
  await assert.rejects(db.query(`insert into public.page_texts (key, value) values ('home.y', repeat('a', 1201))`), /check constraint/);
});

test("page text saves are atomic: version checked under a lock, staff only, keys limited to the page", async () => {
  const db = await setup();
  const keys = `array['home.hero.title','home.hero.intro']`;
  const version = async () => (await db.query<{ v: string }>(`select public.page_texts_version(${keys}) as v`)).rows[0]!.v;
  const save = (who: string, v: string, set: string, del = `array[]::text[]`, k = keys) =>
    asRole(db, "authenticated", who, () => db.query<{ v: string }>(`select public.save_page_texts(${k}, '${v}', '${set}'::jsonb, ${del}) as v`));

  const v0 = await version();
  assert.equal(v0, "none");
  const r1 = await save(EDITOR, v0, `{"home.hero.title":"First"}`);
  const v1 = r1.rows[0]!.v;
  assert.notEqual(v1, v0);
  await assert.rejects(save(OWNER, v0, `{"home.hero.title":"Late"}`), /stale_version/, "a save based on an old version is refused");
  await assert.rejects(save(STRANGER, v1, `{"home.hero.title":"Hack"}`), /not_staff/);
  await assert.rejects(save(OWNER, v1, `{"about.why.title":"Other page"}`), /key_outside_page/);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select public.save_page_texts(${keys}, 'none', '{}'::jsonb, array[]::text[])`)), /permission denied/);

  const r2 = await save(OWNER, v1, `{"home.hero.intro":"Intro"}`, `array['home.hero.title']`);
  const rows = (await db.query<{ key: string; value: string }>(`select key, value from public.page_texts order by key`)).rows;
  assert.deepEqual(rows, [{ key: "home.hero.intro", value: "Intro" }]);
  assert.equal(r2.rows[0]!.v, await version());
});

test("page text load returns values and version from one snapshot", async () => {
  const db = await setup();
  await db.exec(`insert into public.page_texts (key, value) values ('home.hero.title', 'T'), ('about.why.title', 'Other')`);
  const keys = `array['home.hero.title','home.hero.intro']`;
  const res = (await asRole(db, "authenticated", EDITOR, () => db.query<{ j: { version: string; rows: Record<string, string> } }>(`select public.page_texts_load(${keys}) as j`))).rows[0]!.j;
  assert.deepEqual(res.rows, { "home.hero.title": "T" });
  assert.equal(res.version, (await db.query<{ v: string }>(`select public.page_texts_version(${keys}) as v`)).rows[0]!.v);
  await assert.rejects(asRole(db, "anon", null, () => db.query(`select public.page_texts_load(${keys})`)), /permission denied/);
});

test("inquiries: only the server can add them, staff read and update status/notes, archived ones can be deleted", async () => {
  const db = await setup();
  const key = "a".repeat(48);
  const insert = `insert into public.inquiries (submission_key, name, phone, inquiry_type, message) values ('${key}', 'Ana', '09171234567', 'residential', 'Hello there, quote please')`;
  await assert.rejects(asRole(db, "anon", null, () => db.query(insert)), /permission denied/);
  await assert.rejects(asRole(db, "authenticated", EDITOR, () => db.query(insert)), /permission denied/);
  await asRole(db, "service_role", null, () => db.query(insert));
  await asRole(db, "service_role", null, () => db.query(`${insert} on conflict (submission_key) do nothing`));
  assert.equal(await count(db, `select count(*)::int as n from public.inquiries`), 1, "a resubmitted form is stored once");

  await assert.rejects(asRole(db, "anon", null, () => db.query(`select * from public.inquiries`)), /permission denied/);
  for (const outsider of [STRANGER, REVOKED]) {
    const seen = await asRole(db, "authenticated", outsider, () => db.query(`select id from public.inquiries`));
    assert.equal(seen.rows.length, 0, "non-staff see nothing");
  }
  const seen = await asRole(db, "authenticated", EDITOR, () => db.query<{ name: string }>(`select name from public.inquiries`));
  assert.equal(seen.rows[0]?.name, "Ana");

  await assert.rejects(asRole(db, "authenticated", EDITOR, () => db.query(`update public.inquiries set message = 'changed'`)), /permission denied/);
  await asRole(db, "authenticated", EDITOR, () => db.query(`update public.inquiries set status = 'handled', staff_notes = 'Called back'`));
  await asRole(db, "authenticated", EDITOR, () => db.query(`delete from public.inquiries`));
  assert.equal(await count(db, `select count(*)::int as n from public.inquiries`), 1, "only archived inquiries can be deleted");
  await asRole(db, "authenticated", EDITOR, () => db.query(`update public.inquiries set status = 'archived'`));
  await asRole(db, "authenticated", STRANGER, () => db.query(`delete from public.inquiries`));
  assert.equal(await count(db, `select count(*)::int as n from public.inquiries`), 1, "outsiders cannot delete");
  await asRole(db, "authenticated", EDITOR, () => db.query(`delete from public.inquiries`));
  assert.equal(await count(db, `select count(*)::int as n from public.inquiries`), 0);

  await assert.rejects(
    db.query(`insert into public.inquiries (submission_key, name, inquiry_type, message) values ('${"b".repeat(48)}', 'No contact', 'other', 'Message here')`),
    /check constraint/,
    "a phone number or email is required",
  );
});

test("tables added after the initial schema keep only their intended privileges (Supabase defaults revoked)", async () => {
  const db = await setup();
  const priv = async (role: string, table: string, p: string) =>
    (await db.query<{ ok: boolean }>(`select has_table_privilege('${role}', 'public.${table}', '${p}') as ok`)).rows[0]!.ok;
  for (const p of ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "SELECT"]) assert.equal(await priv("anon", "inquiries", p), false, `anon ${p} inquiries`);
  for (const p of ["INSERT", "UPDATE", "DELETE", "TRUNCATE"]) assert.equal(await priv("anon", "page_texts", p), false, `anon ${p} page_texts`);
  for (const p of ["INSERT", "TRUNCATE"]) assert.equal(await priv("authenticated", "inquiries", p), false, `authenticated ${p} inquiries`);
  assert.equal(await priv("authenticated", "page_texts", "TRUNCATE"), false);
  const col = (c: string) => db.query<{ ok: boolean }>(`select has_column_privilege('authenticated', 'public.inquiries', '${c}', 'UPDATE') as ok`).then((r) => r.rows[0]!.ok);
  assert.equal(await col("message"), false, "staff cannot rewrite a customer's message");
  assert.equal(await col("status"), true);
});
