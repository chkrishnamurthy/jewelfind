"use client";

import { createSeedDatabase, type MockDatabase } from "@/src/data/mock/seed";
import type { DemoScenario } from "@/src/domain/types";

const STORAGE_KEY = "jewelfind.mock.db.v1";
const SCENARIO_KEY = "jewelfind.mock.scenario";
const listeners = new Set<() => void>();
let memory: MockDatabase | null = null;

function isDatabase(value: unknown): value is MockDatabase {
  return Boolean(value && typeof value === "object" && (value as MockDatabase).version === 1 && Array.isArray((value as MockDatabase).requests));
}

export function getMockDatabase(): MockDatabase {
  if (memory) return memory;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isDatabase(parsed)) {
          memory = parsed;
          return memory;
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
  memory = createSeedDatabase();
  return memory;
}

export function updateMockDatabase(mutator: (database: MockDatabase) => void) {
  const database = structuredClone(getMockDatabase());
  mutator(database);
  memory = database;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  listeners.forEach((listener) => listener());
  return database;
}

export function resetMockDatabase() {
  memory = createSeedDatabase();
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  listeners.forEach((listener) => listener());
}

export function subscribeMockDatabase(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getScenario(): DemoScenario {
  if (typeof window === "undefined") return { latency: "normal", forceError: false, offline: false };
  try {
    const raw = window.localStorage.getItem(SCENARIO_KEY);
    return raw ? JSON.parse(raw) : { latency: "normal", forceError: false, offline: false };
  } catch {
    return { latency: "normal", forceError: false, offline: false };
  }
}

export function setScenario(scenario: DemoScenario) {
  if (typeof window !== "undefined") window.localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenario));
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      memory = null;
      listeners.forEach((listener) => listener());
    }
  });
}
