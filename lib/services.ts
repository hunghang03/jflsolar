// Service structure (icons, links, order). The wording is editable in
// Admin → Page text (lib/page-text.ts). No savings, payback or performance guarantees.
import type { IconName } from "@/components/ui/Icon";
import type { PageTextKey } from "./page-text";

type Get = (key: PageTextKey) => string;

const SERVICE_LINKS: { icon: IconName; href: string }[] = [
  { icon: "tools", href: "/services#installation" },
  { icon: "bolt", href: "/services#consultancy" },
  { icon: "battery", href: "/products" },
];

export const services = (t: Get) =>
  SERVICE_LINKS.map((s, i) => {
    const n = i + 1;
    return {
      ...s,
      key: `service${n}`,
      title: t(`home.service${n}.title` as PageTextKey),
      body: t(`home.service${n}.body` as PageTextKey),
      cta: t(`home.service${n}.link` as PageTextKey),
    };
  });

export const processSteps = (t: Get) =>
  [1, 2, 3, 4, 5, 6].map((n) => ({ title: t(`services.step${n}.title` as PageTextKey), body: t(`services.step${n}.body` as PageTextKey) }));

export const audiences = (t: Get) =>
  (["residential", "commercial", "industrial"] as const).map((id, i) => {
    const n = i + 1;
    return {
      id,
      title: t(`services.audience${n}.title` as PageTextKey),
      body: t(`services.audience${n}.body` as PageTextKey),
      points: t(`services.audience${n}.points` as PageTextKey),
    };
  });

export const systemTypes = (t: Get) =>
  (["on_grid", "hybrid", "off_grid"] as const).map((key, i) => {
    const n = i + 1;
    return {
      key,
      lead: t(`services.type${n}.lead` as PageTextKey),
      title: t(`services.type${n}.title` as PageTextKey),
      body: t(`services.type${n}.body` as PageTextKey),
      suits: t(`services.type${n}.suits` as PageTextKey),
    };
  });
