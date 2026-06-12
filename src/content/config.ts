import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    modelCode: z.string(),
    category: z.enum(["celik-kapi", "yangin-kapisi", "bina-giris-kapisi"]),
    shortDescription: z.string(),
    size: z.string(),
    color: z.string(),
    material: z.string(),
    price: z.union([z.string(), z.number()]).optional(),
    image: z.string(),
    gallery: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.union([z.string(), z.date()]).transform((v) => (typeof v === "string" ? v : v.toISOString().slice(0, 10))),
    cover: z.string(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    shortDescription: z.string(),
    city: z.string(),
    completionYear: z.string(),
    doorCategory: z.enum(["celik-kapi", "yangin-kapisi", "bina-giris-kapisi"]),
    cover: z.string(),
    gallery: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  products,
  blog,
  projects,
};

