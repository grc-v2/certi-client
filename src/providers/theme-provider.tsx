"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";

type NextThemesProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: { children: ReactNode } & NextThemesProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
