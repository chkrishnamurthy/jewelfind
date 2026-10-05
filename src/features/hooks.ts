"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/src/providers/repository-provider";
import type { ApplicationStatus, CreateApplicationInput, CreateRequestInput, ReplyInput, RequestFilters, Showroom, ShowroomFilters } from "@/src/domain/types";

export const keys = {
  dashboard: ["dashboard"] as const,
  requests: (filters?: RequestFilters) => ["requests", filters ?? {}] as const,
  request: (id: string) => ["request", id] as const,
  tracking: (token: string) => ["tracking", token] as const,
  showrooms: (filters?: ShowroomFilters) => ["showrooms", filters ?? {}] as const,
  showroom: (id: string) => ["showroom", id] as const,
  showroomAssignments: (id: string) => ["showroom-assignments", id] as const,
  applications: (status?: string) => ["applications", status ?? "all"] as const,
  application: (id: string) => ["application", id] as const,
  messages: ["messages"] as const,
  activity: ["activity"] as const,
};

function useInvalidateOperations() {
  const client = useQueryClient();
  return async (requestId?: string) => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["requests"] }),
      client.invalidateQueries({ queryKey: keys.dashboard }),
      client.invalidateQueries({ queryKey: keys.activity }),
      client.invalidateQueries({ queryKey: keys.messages }),
      client.invalidateQueries({ queryKey: ["tracking"] }),
      client.invalidateQueries({ queryKey: ["showroom-assignments"] }),
      ...(requestId ? [client.invalidateQueries({ queryKey: keys.request(requestId) })] : []),
    ]);
  };
}

export function useDashboard() {
  const { operations } = useRepositories();
  return useQuery({ queryKey: keys.dashboard, queryFn: () => operations.dashboard() });
}

export function useRequests(filters?: RequestFilters) {
  const { requests } = useRepositories();
  return useQuery({ queryKey: keys.requests(filters), queryFn: () => requests.list(filters) });
}

export function useRequest(id: string) {
  const { requests } = useRepositories();
  return useQuery({ queryKey: keys.request(id), queryFn: () => requests.get(id), enabled: Boolean(id) });
}

export function useTracking(token: string) {
  const { requests } = useRepositories();
  return useQuery({ queryKey: keys.tracking(token), queryFn: () => requests.getByToken(token), enabled: Boolean(token), retry: false });
}

export function useCreateRequest() {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: (input: CreateRequestInput) => requests.create(input), onSuccess: () => invalidate() });
}

export function useAssignRequest(requestId: string) {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: (showroomIds: string[]) => requests.assign(requestId, showroomIds), onSuccess: () => invalidate(requestId) });
}

export function useReply(requestId?: string) {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: (input: ReplyInput) => requests.reply(input), onSuccess: () => invalidate(requestId) });
}

export function useRelease(requestId: string) {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: (replyId: string) => requests.release(requestId, replyId), onSuccess: () => invalidate(requestId) });
}

export function useMarkNotFound(requestId: string) {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: () => requests.markNotFound(requestId), onSuccess: () => invalidate(requestId) });
}

export function useFeedback(requestId: string) {
  const { requests } = useRepositories();
  const invalidate = useInvalidateOperations();
  return useMutation({ mutationFn: (outcome: "contacted" | "visited" | "not_interested") => requests.submitFeedback(requestId, outcome), onSuccess: () => invalidate(requestId) });
}

export function useShowrooms(filters?: ShowroomFilters) {
  const { showrooms } = useRepositories();
  return useQuery({ queryKey: keys.showrooms(filters), queryFn: () => showrooms.list(filters) });
}

export function useShowroom(id: string) {
  const { showrooms } = useRepositories();
  return useQuery({ queryKey: keys.showroom(id), queryFn: () => showrooms.get(id), enabled: Boolean(id) });
}

export function useSaveShowroom() {
  const { showrooms } = useRepositories();
  const client = useQueryClient();
  return useMutation({ mutationFn: (showroom: Partial<Showroom> & Pick<Showroom, "name" | "area" | "categories">) => showrooms.save(showroom), onSuccess: (result) => Promise.all([client.invalidateQueries({ queryKey: ["showrooms"] }), client.invalidateQueries({ queryKey: keys.showroom(result.id) })]) });
}

export function useToggleShowroom() {
  const { showrooms } = useRepositories();
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => showrooms.toggle(id), onSuccess: (result) => Promise.all([client.invalidateQueries({ queryKey: ["showrooms"] }), client.invalidateQueries({ queryKey: keys.showroom(result.id) })]) });
}

export function useShowroomAssignments(id: string) {
  const { showrooms } = useRepositories();
  return useQuery({ queryKey: keys.showroomAssignments(id), queryFn: () => showrooms.assignments(id), enabled: Boolean(id) });
}

export function useApplications(status?: ApplicationStatus | "all") {
  const { applications } = useRepositories();
  return useQuery({ queryKey: keys.applications(status), queryFn: () => applications.list(status) });
}

export function useApplication(id: string) {
  const { applications } = useRepositories();
  return useQuery({ queryKey: keys.application(id), queryFn: () => applications.get(id), enabled: Boolean(id) });
}

export function useCreateApplication() {
  const { applications } = useRepositories();
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: CreateApplicationInput) => applications.create(input), onSuccess: () => client.invalidateQueries({ queryKey: ["applications"] }) });
}

export function useUpdateApplication(id: string) {
  const { applications } = useRepositories();
  const client = useQueryClient();
  return useMutation({ mutationFn: (status: ApplicationStatus) => applications.updateStatus(id, status), onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["applications"] }), client.invalidateQueries({ queryKey: keys.application(id) }), client.invalidateQueries({ queryKey: keys.activity })]) });
}

export function useMessages() {
  const { operations } = useRepositories();
  return useQuery({ queryKey: keys.messages, queryFn: () => operations.messages() });
}

export function useRetryMessage() {
  const { operations } = useRepositories();
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => operations.retryMessage(id), onSuccess: () => client.invalidateQueries({ queryKey: keys.messages }) });
}

export function useActivity() {
  const { operations } = useRepositories();
  return useQuery({ queryKey: keys.activity, queryFn: () => operations.activity() });
}
