import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const reports = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/reports" }),
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  }),
});

const forecasts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/forecasts" }),
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    targetYear: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  blog,
  resources,
  reports,
  forecasts,
};
