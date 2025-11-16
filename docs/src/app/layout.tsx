import type { Metadata } from "next";

import { RootProvider } from 'fumadocs-ui/provider/next';
import "./globals.css";

export const metadata: Metadata = {
  title: "TNKS Data Table Documentation",
  description: "Comprehensive documentation for TNKS Data Table - A powerful server-side data table component for React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
