import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    slug: z.string(),
    date: z.string(),
  })
});

export const collections = { blog }; 