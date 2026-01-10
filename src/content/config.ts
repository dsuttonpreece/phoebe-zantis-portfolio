import { defineCollection, z } from 'astro:content';
import { HygraphLoader } from '@hygraph/hygraph-astro-loader';

const endpoint = import.meta.env.HYGRAPH_ENDPOINT;

// Info collection (site settings)
const info = defineCollection({
  loader: HygraphLoader({
    endpoint,
    operation: 'infos',
    fields: ['id', 'title', 'instagram', 'email'],
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    instagram: z.string().optional(),
    email: z.string().optional(),
  }),
});

// Categories collection
const categories = defineCollection({
  loader: HygraphLoader({
    endpoint,
    operation: 'categories',
    fields: [
      'id',
      'name',
      {
        images: [
          'id',
          { photo: ['url', 'width', 'height'] },
        ],
      },
    ],
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(
      z.object({
        id: z.string(),
        photo: z.object({
          url: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
        }),
      })
    ).optional(),
  }),
});

// Image Collections (for homepage featured images)
const imageCollections = defineCollection({
  loader: HygraphLoader({
    endpoint,
    operation: 'imageCollections',
    fields: [
      'id',
      'name',
      {
        images: [
          'id',
          { photo: ['url', 'width', 'height'] },
        ],
      },
    ],
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(
      z.object({
        id: z.string(),
        photo: z.object({
          url: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
        }),
      })
    ).optional(),
  }),
});

export const collections = {
  info,
  categories,
  imageCollections,
};
