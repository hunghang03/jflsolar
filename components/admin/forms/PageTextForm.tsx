"use client";

import { savePageText } from "@/app/admin/actions/page-text";
import { FIELD_MAX, PAGE_TEXT_DEFAULTS, type TextFieldDef, type TextPageDef } from "@/lib/page-text";
import { AdminForm, useAdminField } from "../AdminForm";
import { Fieldset, TextArea, TextField } from "../Fields";

export function PageTextForm({ page, values, version }: { page: TextPageDef; values: Record<string, string>; version: string }) {
  return (
    <AdminForm action={savePageText} initialValues={values} hidden={{ version, page: page.slug }} isNew={false} publishable={false} labels={{ save: "Save page text" }}>
      {page.groups.map((g) => (
        <Fieldset key={g.title} legend={g.title} description={g.note}>
          {g.fields.map((f) => (
            <PageTextField key={f.key} field={f} />
          ))}
        </Fieldset>
      ))}
    </AdminForm>
  );
}

function PageTextField({ field }: { field: TextFieldDef }) {
  const { value } = useAdminField(field.key);
  const original = PAGE_TEXT_DEFAULTS[field.key];
  const edited = value !== "" && value !== original;
  const hint = (
    <>
      {field.kind === "list" && "One point per line. "}
      {edited ? (
        <>
          <span className="font-semibold text-gold-800">Changed.</span> Original: “{original.replace(/\n/g, " · ")}” — clear the box to restore it.
        </>
      ) : (
        "Clear the box to restore the original wording."
      )}
    </>
  );
  const common = { name: field.key, label: field.label, hint, maxLength: FIELD_MAX[field.kind], className: "sm:col-span-2" };
  return field.kind === "line" ? <TextField {...common} /> : <TextArea {...common} rows={field.kind === "list" ? 4 : 3} />;
}
