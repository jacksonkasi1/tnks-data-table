import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { pageTree } from '@/app/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={pageTree}
      nav={{
        title: 'TNKS Data Table',
        url: '/',
      }}
      links={[
        {
          text: 'Documentation',
          url: '/docs',
          active: 'nested-url',
        },
        {
          text: 'Examples',
          url: '/docs/examples',
        },
        {
          text: 'GitHub',
          url: 'https://github.com/jacksonkasi1/tnks-data-table',
          external: true,
        },
      ]}
      githubUrl="https://github.com/jacksonkasi1/tnks-data-table"
    >
      {children}
    </DocsLayout>
  );
}
