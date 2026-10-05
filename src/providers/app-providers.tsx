"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RepositoryProvider } from "@/src/providers/repository-provider";
import { ToastProvider } from "@/src/components/ui/toast";
import { subscribeMockDatabase } from "@/src/data/mock/store";

function MockStoreSync() {
  const client = useQueryClient();
  useEffect(() => subscribeMockDatabase(() => { void client.invalidateQueries(); }), [client]);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <MockStoreSync />
        <ToastProvider>{children}</ToastProvider>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
