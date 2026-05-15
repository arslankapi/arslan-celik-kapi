import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR =
  process.argv[2] ?? "C:/Users/Ulas/Desktop/arslankapıgörselleri/kapı2/kapıı/referanslar";
const OUTPUT_DIR = path.resolve(process.cwd(), "public/images/references/normalized");
const DATA_FILE = path.resolve(process.cwd(), "src/data/reference-logos.ts");

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 250;
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

const transliterationMap = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function slugify(input) {
  const translated = [...input].map((char) => transliterationMap[char] ?? char).join("");
  return translated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toDisplayName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

function makeUniqueSlug(base, used) {
  let candidate = base || "logo";
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base || "logo"}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function run() {
  await ensureDirectory(OUTPUT_DIR);

  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "tr"));

  const usedSlugs = new Set();
  const logos = [];
  let processed = 0;
  let failed = 0;

  for (const fileName of files) {
    const inputPath = path.join(SOURCE_DIR, fileName);
    const stem = path.parse(fileName).name;
    const baseSlug = slugify(stem);
    const safeSlug = makeUniqueSlug(baseSlug, usedSlugs);
    const outputFileName = `${safeSlug}.png`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    try {
      let buffer = await sharp(inputPath, { limitInputPixels: false })
        .rotate()
        .ensureAlpha()
        .trim({ threshold: 8 })
        .grayscale()
        .normalise()
        .linear(1.05, -10)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();

      const stats = await sharp(buffer).stats();
      const mean = stats.channels[0]?.mean ?? 128;
      if (mean > 218) {
        buffer = await sharp(buffer).linear(0.78, 0).toBuffer();
      }

      await fs.writeFile(outputPath, buffer);

      logos.push({
        name: toDisplayName(safeSlug),
        src: `/images/references/normalized/${outputFileName}`,
      });
      processed += 1;
    } catch (error) {
      failed += 1;
      console.warn(`[WARN] Dosya işlenemedi: ${fileName}`);
      console.warn(error instanceof Error ? error.message : String(error));
    }
  }

  const selectedLogos = logos.slice(0, 12);
  const dataContent = `export const referenceLogos = ${JSON.stringify(selectedLogos, null, 2)} as const;\n`;
  await fs.writeFile(DATA_FILE, dataContent, "utf8");

  console.log(`Toplam bulunan: ${files.length}`);
  console.log(`Başarıyla işlenen: ${processed}`);
  console.log(`Hatalı: ${failed}`);
  console.log(`Grid için seçilen logo sayısı: ${selectedLogos.length}`);
  console.log(`Çıktı klasörü: ${OUTPUT_DIR}`);
  console.log(`Data dosyası: ${DATA_FILE}`);
}

run().catch((error) => {
  console.error("[FATAL] Logo normalize işlemi başarısız:");
  console.error(error);
  process.exit(1);
});
