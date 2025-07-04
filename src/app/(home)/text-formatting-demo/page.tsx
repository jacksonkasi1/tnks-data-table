import { Metadata } from "next";
import { Suspense } from "react";
import TextFormattingDemo from "../data-table/text-formatting-demo";

export const metadata: Metadata = {
  title: "Text Formatting Demo - Data Table",
  description: "Demonstrates flexible text formatting for column names with multiple naming conventions",
};

export default function TextFormattingDemoPage() {
  return (
    <main className="container mx-auto py-10">
      <Suspense fallback={<div>Loading demo...</div>}>
        <TextFormattingDemo />
      </Suspense>
    </main>
  );
}