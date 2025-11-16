// ** import types
import type { ImageResponse } from 'next/og';

// ** import core packages
import { notFound } from 'next/navigation';
import { NextRequest } from 'next/server';

// ** import utils
import { source } from '@/lib/source';
import { generate } from '@/lib/mono';

export const revalidate = false;

export function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): ImageResponse | Response {
  const { slug } = params as unknown as { slug: string[] };
  const page = source.getPage(slug);

  if (!page) notFound();

  return generate({
    title: page.data.title,
    description: page.data.description ?? 'Documentation',
    site: 'TNKS Data Table',
  });
}

export function generateStaticParams(): { slug: string[] }[] {
  return source.getPages().map((page) => ({
    slug: page.file.slugs,
  }));
}
