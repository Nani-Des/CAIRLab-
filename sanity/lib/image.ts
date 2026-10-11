// sanity/lib/image.ts
// Builds URLs for images uploaded through the Studio.
// Usage: urlFor(project.image).width(800).url()

import { createImageUrlBuilder } from '@sanity/image-url';
import type { Image } from 'sanity';
import { dataset, projectId } from '../env';

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: Image) {
  return builder.image(source);
}
