// ** import core packages
import { Feed } from 'feed';

// ** import utils
import { source } from './source';

// Deployed documentation URL
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tnks-docs.vercel.app';

export function generateRssFeed(): string {
  const feed = new Feed({
    title: 'TNKS Data Table Documentation',
    description:
      'A powerful and flexible data table component for React applications',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}/og-image.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`,
    },
    author: {
      name: 'Jackson Kasi',
      link: 'https://github.com/jacksonkasi1',
    },
  });

  const pages = source.getPages();

  for (const page of pages) {
    feed.addItem({
      title: page.data.title,
      id: page.url,
      link: `${SITE_URL}${page.url}`,
      description: page.data.description,
      date: page.data.exports.lastModified
        ? new Date(page.data.exports.lastModified)
        : new Date(),
    });
  }

  return feed.rss2();
}
