// ** import core packages
import { scan } from 'next-validate-link';

// ** import utils
import { source } from '@/lib/source';

void scan({
  preset: 'next',
  pages: source.getPages().map((page) => ({
    path: page.url,
    headings: page.data.toc?.map((heading) => heading.url.slice(1)) ?? [],
  })),
  components: {
    Card: {
      attributes: {
        href: 'url',
      },
    },
  },
  options: {
    relativePath: 'url',
  },
});
