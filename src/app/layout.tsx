import type { Metadata } from "next";

// ** Import UI Components
import { Toaster } from "@/components/ui/sonner";

// ** Import Components
import { Header } from "@/components/header";

// ** Import Libs
import { Providers } from "@/lib/providers";

// ** Import Global CSS
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DataTable",
  description: "Advanced data table with powerful features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          <div className="relative min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
