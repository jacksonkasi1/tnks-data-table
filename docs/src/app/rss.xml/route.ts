// ** import utils
import { generateRssFeed } from '@/lib/rss';

export function GET(): Response {
  const feed = generateRssFeed();

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
