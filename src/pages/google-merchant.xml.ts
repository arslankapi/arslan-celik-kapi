import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const FALLBACK_SITE = "https://arslancelikkapi.com";
const BRAND_NAME = "Arslan Çelik Kapı";
const DEFAULT_SIZE = "90 x 210 cm";

const categoryMap: Record<string, string> = {
  "celik-kapi": "Çelik Kapı",
  "yangin-kapisi": "Yangın Kapısı",
  "bina-giris-kapisi": "Bina Giriş Kapısı",
};

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toAbsoluteUrl = (site: string, path: string) => {
  if (!path) return site;
  if (/^https?:\/\//i.test(path)) return path;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
};

const compactText = (value: string) => value.replace(/\s+/g, " ").trim();

export const GET: APIRoute = async () => {
  const site = (import.meta.env.SITE || FALLBACK_SITE).replace(/\/$/, "");
  const products = await getCollection("products", ({ data }) => !data.draft);

  const items = products
    .sort((a, b) => a.data.title.localeCompare(b.data.title, "tr"))
    .map((product) => {
      const { data, id, body } = product;
      const categoryLabel = categoryMap[data.category] ?? "Kapı";
      const size = compactText(data.size || DEFAULT_SIZE) || DEFAULT_SIZE;
      const shortDescription = compactText(data.shortDescription || data.title);
      const bodyText = compactText(
        body
          .replace(/^[-*]\s*/gm, "")
          .replace(/\*\*/g, "")
          .replace(/__/g, "")
      );
      const description = compactText(
        [
          shortDescription,
          bodyText,
          `Kategori: ${categoryLabel}.`,
          `Standart ölçü: ${size}.`,
          `Renk: ${compactText(data.color)}.`,
          `Malzeme: ${compactText(data.material)}.`,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const additionalImages = (data.gallery || [])
        .filter(Boolean)
        .map((image) => `    <g:additional_image_link>${xmlEscape(toAbsoluteUrl(site, image))}</g:additional_image_link>`)
        .join("\n");

      return `  <item>
    <g:id>${xmlEscape(id)}</g:id>
    <g:title>${xmlEscape(data.title)}</g:title>
    <g:description>${xmlEscape(description)}</g:description>
    <g:link>${xmlEscape(`${site}/${id}/`)}</g:link>
    <g:image_link>${xmlEscape(toAbsoluteUrl(site, data.image))}</g:image_link>
    <g:condition>new</g:condition>
    <g:availability>in_stock</g:availability>
    <g:brand>${xmlEscape(BRAND_NAME)}</g:brand>
    <g:mpn>${xmlEscape(data.modelCode)}</g:mpn>
    <g:product_type>${xmlEscape(`Kapı > ${categoryLabel}`)}</g:product_type>
${additionalImages ? `${additionalImages}\n` : ""}  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${xmlEscape(BRAND_NAME)}</title>
  <link>${xmlEscape(site)}</link>
  <description>${xmlEscape("Arslan Çelik Kapı ürün veri kaynağı")}</description>
  <language>tr-TR</language>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
