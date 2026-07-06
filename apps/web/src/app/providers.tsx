
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getBrowserQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getBrowserQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
