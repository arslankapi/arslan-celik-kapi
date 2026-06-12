import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const FALLBACK_SITE = "https://arslancelikkapi.com";
const BRAND_NAME = "Arslan Çelik Kapı";
const DEFAULT_SIZE = "90 x 210 cm";
const DEFAULT_CURRENCY = "TRY";

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
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const compactText = (value?: string | number | null) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSlug = (value: string) => compactText(value).replace(/\.md$/i, "");

const toAbsoluteUrl = (site: string, path: string) => {
  const normalizedPath = compactText(path);
  if (!normalizedPath) return site;
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  return `${site}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
};

const buildProductUrl = (site: string, slug: string) => `${site}/${normalizeSlug(slug)}/`;

const formatPrice = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === "") return "";

  const normalized = typeof value === "number"
    ? value
    : Number.parseFloat(compactText(value).replace(/\./g, "").replace(",", "."));

  if (!Number.isFinite(normalized)) return "";

  return `${normalized.toFixed(2)} ${DEFAULT_CURRENCY}`;
};

export const GET: APIRoute = async () => {
  const site = (import.meta.env.SITE || FALLBACK_SITE).replace(/\/$/, "");
  const products = await getCollection("products", ({ data }) => !data.draft);

  const items = products
    .sort((a, b) => compactText(a.data.title).localeCompare(compactText(b.data.title), "tr"))
    .map((product) => {
      const { data, id, body } = product;
      const slug = normalizeSlug(id);
      const merchantId = compactText(data.modelCode) || slug;
      const categoryLabel = categoryMap[data.category] ?? "Kapı";
      const title = compactText(data.title);
      const size = compactText(data.size || DEFAULT_SIZE) || DEFAULT_SIZE;
      const shortDescription = compactText(data.shortDescription || title);
      const color = compactText(data.color);
      const material = compactText(data.material);
      const imageUrl = toAbsoluteUrl(site, compactText(data.image));
      const productUrl = buildProductUrl(site, slug);
      const mpn = compactText(data.modelCode) || slug;
      const price = formatPrice(data.price);
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
          color ? `Renk: ${color}.` : "",
          material ? `Malzeme: ${material}.` : "",
        ]
          .filter(Boolean)
          .join(" ")
      );

      const additionalImages = (data.gallery || [])
        .map((image) => compactText(image))
        .filter(Boolean)
        .map(
          (image) =>
            `    <g:additional_image_link>${xmlEscape(toAbsoluteUrl(site, image))}</g:additional_image_link>`
        )
        .join("\n");

      const priceLine = price ? `\n    <g:price>${xmlEscape(price)}</g:price>` : "";

      return `  <item>
    <g:id>${xmlEscape(merchantId)}</g:id>
    <g:title>${xmlEscape(title)}</g:title>
    <g:description>${xmlEscape(description)}</g:description>
    <g:link>${xmlEscape(productUrl)}</g:link>
    <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
    <g:condition>new</g:condition>
    <g:availability>in_stock</g:availability>
    <g:brand>${xmlEscape(BRAND_NAME)}</g:brand>
    <g:mpn>${xmlEscape(mpn)}</g:mpn>
    <g:product_type>${xmlEscape(`Kapı > ${categoryLabel}`)}</g:product_type>${priceLine}
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
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
};
