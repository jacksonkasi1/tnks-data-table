"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ 
  children, 
  ...props 
}: { 
  children: ReactNode;
} & Omit<ThemeProviderProps, "children">) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}