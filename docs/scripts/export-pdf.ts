// ** import core packages
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// ** import utils
import { source } from '@/lib/source';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './pdfs';

async function exportPDF() {
  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const pages = source.getPages();

    for (const page of pages) {
      const url = `${BASE_URL}${page.url}`;
      console.log(`Generating PDF for: ${url}`);

      const browserPage = await browser.newPage();
      await browserPage.goto(url, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF filename from URL
      const filename = page.url.replace(/\//g, '-').slice(1) || 'index';
      const outputPath = join(OUTPUT_DIR, `${filename}.pdf`);

      await browserPage.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      console.log(`✓ Generated: ${outputPath}`);
      await browserPage.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\n✓ All PDFs generated successfully!');
}

exportPDF().catch((error) => {
  console.error('Error generating PDFs:', error);
  process.exit(1);
});
