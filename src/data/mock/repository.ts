"use client";

import type { RepositoryBundle } from "@/src/domain/repositories";
import {
  AppError,
  type ActivityEvent,
  type ApplicationStatus,
  type JewelleryRequest,
  type MessageRecord,
  type RequestDetail,
  type Showroom,
  type ShowroomApplication,
  type ShowroomReply,
} from "@/src/domain/types";
import { getMockDatabase, getScenario, resetMockDatabase, setScenario, updateMockDatabase } from "@/src/data/mock/store";

const ADMIN_SESSION_KEY = "jewelfind.demo.admin";
const SHOWROOM_SESSION_KEY = "jewelfind.demo.showroom";

const wait = async () => {
  const scenario = getScenario();
  if (scenario.offline) throw new AppError("NETWORK", "You appear to be offline. Check your connection and try again.", true);
  await new Promise((resolve) => window.setTimeout(resolve, scenario.latency === "slow" ? 1300 : 260));
  if (scenario.forceError) throw new AppError("NETWORK", "The demo service is unavailable in this scenario.", true);
};

const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const now = () => new Date().toISOString();

function detailFor(requestId: string): RequestDetail {
  const db = getMockDatabase();
  const request = db.requests.find((item) => item.id === requestId);
  if (!request) throw new AppError("NOT_FOUND", "We could not find that jewellery request.");

  const assignments = db.assignments
    .filter((assignment) => assignment.requestId === requestId)
    .map((assignment) => {
      const showroom = db.showrooms.find((item) => item.id === assignment.showroomId);
      if (!showroom) throw new AppError("UNKNOWN", "This assignment references a missing showroom.");
      const latestReply = db.replies
        .filter((reply) => reply.assignmentId === assignment.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      return { ...assignment, showroom, latestReply };
    });

  const matches = db.matches
    .filter((match) => match.requestId === requestId)
    .map((match) => {
      const showroom = db.showrooms.find((item) => item.id === match.showroomId);
      const reply = db.replies.find((item) => item.id === match.replyId);
      if (!showroom || !reply) throw new AppError("UNKNOWN", "This result is incomplete.");
      return { ...match, showroom, reply };
    });

  return {
    request,
    assignments,
    matches,
    messages: db.messages.filter((message) => message.requestId === requestId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    activity: db.activity.filter((event) => event.requestId === requestId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    feedback: db.feedback.find((item) => item.requestId === requestId),
  };
}

function addActivity(events: ActivityEvent[], requestId: string | undefined, actor: string, event: string, detail: string) {
  events.unshift({ id: id("evt"), requestId, actor, event, detail, createdAt: now() });
}

export const mockRepositoryBundle: RepositoryBundle = {
  auth: {
    async loginAdmin(email, password) {
      await wait();
      if (email.toLowerCase() !== "demo@jewelfind.in" || password !== "jewel123") {
        throw new AppError("UNAUTHORIZED", "Email or password is incorrect.", false, { email: "Use the demo credentials shown below." });
      }
      const user = { id: "admin-01", name: "Priya Sharma", email: "demo@jewelfind.in", role: "owner" as const };
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
      return user;
    },
    async loginShowroom(phone, code) {
      await wait();
      if (code !== "246810") throw new AppError("UNAUTHORIZED", "That demo code is incorrect.");
      const showroom = getMockDatabase().showrooms.find((item) => item.phone.endsWith(phone.replace(/\D/g, "").slice(-4))) ?? getMockDatabase().showrooms[0];
      window.localStorage.setItem(SHOWROOM_SESSION_KEY, JSON.stringify(showroom));
      return showroom;
    },
    getAdminSession() {
      if (typeof window === "undefined") return null;
      const value = window.localStorage.getItem(ADMIN_SESSION_KEY);
      return value ? JSON.parse(value) : null;
    },
    getShowroomSession() {
      if (typeof window === "undefined") return null;
      const value = window.localStorage.getItem(SHOWROOM_SESSION_KEY);
      return value ? JSON.parse(value) : null;
    },
    async logout(scope) {
      if (typeof window !== "undefined") window.localStorage.removeItem(scope === "admin" ? ADMIN_SESSION_KEY : SHOWROOM_SESSION_KEY);
    },
  },

  requests: {
    async list(filters = {}) {
      await wait();
      let items = [...getMockDatabase().requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const search = filters.search?.trim().toLowerCase();
      if (search) items = items.filter((item) => `${item.code} ${item.customerName} ${item.phone}`.toLowerCase().includes(search));
      if (filters.status && filters.status !== "all") items = items.filter((item) => item.status === filters.status);
      if (filters.area && filters.area !== "all") items = items.filter((item) => item.area === filters.area);
      if (filters.category && filters.category !== "all") items = items.filter((item) => item.category === filters.category);
      const pageSize = filters.pageSize ?? 10;
      const page = Math.max(1, filters.page ?? 1);
      const total = items.length;
      return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
    },
    async get(requestId) {
      await wait();
      return detailFor(requestId);
    },
    async getByToken(token) {
      await wait();
      const request = getMockDatabase().requests.find((item) => item.trackingToken === token || item.code.toLowerCase() === token.toLowerCase());
      if (!request) throw new AppError("NOT_FOUND", "This tracking link is invalid or has expired.");
      return detailFor(request.id);
    },
    async create(input) {
      await wait();
      const createdAt = now();
      const request: JewelleryRequest = {
        id: id("req"),
        code: `JF-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
        trackingToken: `track-${crypto.randomUUID()}`,
        customerName: input.customerName,
        phone: input.phone,
        area: input.area,
        category: input.category,
        budgetLabel: input.budgetLabel,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        notes: input.notes,
        photoDataUrl: input.photoDataUrl,
        photoTone: "amber",
        status: "submitted",
        consentVersion: "frontend-demo-v1",
        createdAt,
        updatedAt: createdAt,
        version: 1,
      };
      updateMockDatabase((db) => {
        db.requests.unshift(request);
        db.messages.unshift({ id: id("msg"), requestId: request.id, recipient: input.phone, template: "request_received", status: "delivered", createdAt, updatedAt: createdAt });
        addActivity(db.activity, request.id, "Shopper", "Request submitted", `${request.code} · ${request.category}`);
      });
      return request;
    },
    async assign(requestId, showroomIds) {
      await wait();
      updateMockDatabase((db) => {
        const request = db.requests.find((item) => item.id === requestId);
        if (!request) throw new AppError("NOT_FOUND", "Request not found.");
        showroomIds.forEach((showroomId) => {
          if (db.assignments.some((item) => item.requestId === requestId && item.showroomId === showroomId)) return;
          db.assignments.push({ id: id("asn"), requestId, showroomId, status: "sent", sentAt: now(), replyDueAt: new Date(Date.now() + 6 * 3_600_000).toISOString(), createdAt: now() });
        });
        request.status = "checking";
        request.updatedAt = now();
        request.version += 1;
        addActivity(db.activity, requestId, "Priya (Admin)", "Showrooms assigned", `${showroomIds.length} showroom${showroomIds.length === 1 ? "" : "s"} contacted`);
      });
      return detailFor(requestId);
    },
    async reply(input) {
      await wait();
      let requestId = "";
      updateMockDatabase((db) => {
        const assignment = db.assignments.find((item) => item.id === input.assignmentId);
        if (!assignment) throw new AppError("NOT_FOUND", "Assignment not found.");
        requestId = assignment.requestId;
        const reply: ShowroomReply = { id: id("rep"), assignmentId: assignment.id, kind: input.kind, note: input.note, price: input.price, weight: input.weight, purity: input.purity, source: input.source, photoTone: input.kind === "no" ? undefined : "emerald", createdAt: now() };
        db.replies.push(reply);
        assignment.status = "replied";
        const request = db.requests.find((item) => item.id === requestId);
        if (request) {
          request.updatedAt = now();
          request.version += 1;
        }
        addActivity(db.activity, requestId, input.source === "admin" ? "Priya (Admin)" : "Showroom", "Reply recorded", input.kind === "has" ? "Exact design available" : input.kind === "similar" ? "Similar design available" : "Design unavailable");
      });
      return detailFor(requestId);
    },
    async release(requestId, replyId) {
      await wait();
      updateMockDatabase((db) => {
        const request = db.requests.find((item) => item.id === requestId);
        const reply = db.replies.find((item) => item.id === replyId);
        const assignment = reply ? db.assignments.find((item) => item.id === reply.assignmentId) : undefined;
        if (!request || !reply || !assignment || reply.kind === "no") throw new AppError("VALIDATION", "Choose an available exact or similar reply.");
        const kind = reply.kind === "has" ? "exact" : "similar";
        if (!db.matches.some((item) => item.requestId === requestId && item.replyId === replyId)) {
          db.matches.push({ id: id("match"), requestId, showroomId: assignment.showroomId, replyId, kind, releasedAt: now() });
        }
        request.status = kind === "exact" ? "matched" : "similar_offered";
        request.updatedAt = now();
        request.version += 1;
        db.messages.unshift({ id: id("msg"), requestId, recipient: request.phone, template: kind === "exact" ? "match_found" : "similar_found", status: "delivered", createdAt: now(), updatedAt: now() });
        addActivity(db.activity, requestId, "Priya (Admin)", kind === "exact" ? "Exact result released" : "Similar result released", `Visible on shopper tracking for ${request.code}`);
      });
      return detailFor(requestId);
    },
    async markNotFound(requestId) {
      await wait();
      updateMockDatabase((db) => {
        const request = db.requests.find((item) => item.id === requestId);
        if (!request) throw new AppError("NOT_FOUND", "Request not found.");
        request.status = "not_found";
        request.updatedAt = now();
        request.version += 1;
        db.messages.unshift({ id: id("msg"), requestId, recipient: request.phone, template: "not_found", status: "delivered", createdAt: now(), updatedAt: now() });
        addActivity(db.activity, requestId, "Priya (Admin)", "Not-found result released", "Shopper has been updated in the demo.");
      });
      return detailFor(requestId);
    },
    async submitFeedback(requestId, outcome) {
      await wait();
      updateMockDatabase((db) => {
        db.feedback = db.feedback.filter((item) => item.requestId !== requestId);
        db.feedback.push({ id: id("feedback"), requestId, outcome, createdAt: now() });
        addActivity(db.activity, requestId, "Shopper", "Outcome shared", outcome.replace("_", " "));
      });
      return detailFor(requestId);
    },
  },

  showrooms: {
    async list(filters = {}) {
      await wait();
      let items = [...getMockDatabase().showrooms];
      const search = filters.search?.toLowerCase().trim();
      if (search) items = items.filter((item) => `${item.name} ${item.area}`.toLowerCase().includes(search));
      if (filters.area && filters.area !== "all") items = items.filter((item) => item.area === filters.area);
      if (filters.active && filters.active !== "all") items = items.filter((item) => item.active === (filters.active === "active"));
      return items.sort((a, b) => a.name.localeCompare(b.name));
    },
    async get(showroomId) {
      await wait();
      const showroom = getMockDatabase().showrooms.find((item) => item.id === showroomId);
      if (!showroom) throw new AppError("NOT_FOUND", "Showroom not found.");
      return showroom;
    },
    async save(input) {
      await wait();
      let result: Showroom | undefined;
      updateMockDatabase((db) => {
        const existing = input.id ? db.showrooms.find((item) => item.id === input.id) : undefined;
        if (existing) {
          Object.assign(existing, input);
          result = existing;
        } else {
          result = {
            id: id("sr"),
            name: input.name,
            area: input.area,
            address: input.address ?? "Address to be confirmed",
            phone: input.phone ?? "+919900000000",
            whatsapp: input.whatsapp ?? input.phone ?? "+919900000000",
            categories: input.categories,
            active: true,
            rating: 0,
            responseRate: 0,
            averageReplyMinutes: 0,
            hours: input.hours ?? "10:00 AM – 8:00 PM",
            initials: input.name.split(" ").slice(0, 2).map((part) => part[0]).join(""),
            accent: "#8b6a20",
          };
          db.showrooms.push(result);
        }
      });
      return result!;
    },
    async toggle(showroomId) {
      await wait();
      let result: Showroom | undefined;
      updateMockDatabase((db) => {
        result = db.showrooms.find((item) => item.id === showroomId);
        if (!result) throw new AppError("NOT_FOUND", "Showroom not found.");
        result.active = !result.active;
      });
      return result!;
    },
    async assignments(showroomId) {
      await wait();
      return getMockDatabase().assignments.filter((item) => item.showroomId === showroomId).map((item) => detailFor(item.requestId)).sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt));
    },
  },

  applications: {
    async list(status = "all") {
      await wait();
      return getMockDatabase().applications.filter((item) => status === "all" || item.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async get(applicationId) {
      await wait();
      const application = getMockDatabase().applications.find((item) => item.id === applicationId);
      if (!application) throw new AppError("NOT_FOUND", "Application not found.");
      return application;
    },
    async create(input) {
      await wait();
      const application: ShowroomApplication = { id: id("app"), ...input, status: "new", createdAt: now(), updatedAt: now() };
      updateMockDatabase((db) => {
        db.applications.unshift(application);
        addActivity(db.activity, undefined, "Partner", "Application submitted", application.businessName);
      });
      return application;
    },
    async updateStatus(applicationId, status: ApplicationStatus) {
      await wait();
      let result: ShowroomApplication | undefined;
      updateMockDatabase((db) => {
        result = db.applications.find((item) => item.id === applicationId);
        if (!result) throw new AppError("NOT_FOUND", "Application not found.");
        result.status = status;
        result.updatedAt = now();
        addActivity(db.activity, undefined, "Priya (Admin)", "Application updated", `${result.businessName} · ${status.replace("_", " ")}`);
      });
      return result!;
    },
  },

  operations: {
    async dashboard() {
      await wait();
      const db = getMockDatabase();
      const open = db.requests.filter((item) => ["submitted", "checking", "similar_offered"].includes(item.status)).length;
      const matched = db.requests.filter((item) => item.status === "matched").length;
      const statusCounts = Array.from(new Set(db.requests.map((item) => item.status))).map((status) => ({ status, count: db.requests.filter((item) => item.status === status).length }));
      return {
        requestsToday: db.requests.filter((item) => item.createdAt.slice(0, 10) === "2026-10-04").length,
        openRequests: open,
        exactMatchRate: Math.round((matched / db.requests.length) * 100),
        medianReplyMinutes: 74,
        pendingApplications: db.applications.filter((item) => ["new", "reviewing"].includes(item.status)).length,
        failedMessages: db.messages.filter((item) => item.status === "failed").length,
        statusCounts,
      };
    },
    async messages() {
      await wait();
      return [...getMockDatabase().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async retryMessage(messageId) {
      await wait();
      let result: MessageRecord | undefined;
      updateMockDatabase((db) => {
        result = db.messages.find((item) => item.id === messageId);
        if (!result) throw new AppError("NOT_FOUND", "Message not found.");
        result.status = "queued";
        result.error = undefined;
        result.updatedAt = now();
      });
      return result!;
    },
    async activity() {
      await wait();
      return [...getMockDatabase().activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  },

  demo: {
    getScenario,
    setScenario,
    async reset() {
      resetMockDatabase();
      setScenario({ latency: "normal", forceError: false, offline: false });
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      window.localStorage.removeItem(SHOWROOM_SESSION_KEY);
    },
  },
};
