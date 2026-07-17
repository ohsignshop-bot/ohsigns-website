import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['decals', 'uv', 'design', 'other']),
    tags: z.array(z.string()).default([]),
    image: z.string(),          // path relative to /public
    imageAlt: z.string(),
    date: z.date(),
    featured: z.boolean().default(false),
    client: z.string().optional(),
  }),
});

export const collections = { work };
