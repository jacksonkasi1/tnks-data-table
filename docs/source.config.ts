import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkMdxFiles } from 'fumadocs-core/mdx-plugins';

export const docs = defineDocs({
  dir: 'content',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxFiles],
  },
});