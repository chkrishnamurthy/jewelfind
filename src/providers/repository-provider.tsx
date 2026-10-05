"use client";

import { createContext, useContext } from "react";
import type { RepositoryBundle } from "@/src/domain/repositories";
import { mockRepositoryBundle } from "@/src/data/mock/repository";

const RepositoryContext = createContext<RepositoryBundle | null>(null);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  return <RepositoryContext.Provider value={mockRepositoryBundle}>{children}</RepositoryContext.Provider>;
}

export function useRepositories() {
  const repositories = useContext(RepositoryContext);
  if (!repositories) throw new Error("RepositoryProvider is missing.");
  return repositories;
}
