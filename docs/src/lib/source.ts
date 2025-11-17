// ** import utils
import { docs } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export function getPageImage(page: { slugs: string[] }): {
  url: string;
  alt: string;
} {
  const segments = page.slugs.join('/');

  return {
    url: `/og/docs/${segments}/image.png`,
    alt: 'Documentation Page',
  };
}

