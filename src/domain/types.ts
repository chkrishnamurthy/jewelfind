export const AREAS = [
  "Banjara Hills",
  "Jubilee Hills",
  "Abids",
  "Kukatpally",
  "Secunderabad",
  "Himayatnagar",
  "Gachibowli",
  "Dilsukhnagar",
] as const;

export const CATEGORIES = [
  "Necklace",
  "Earrings",
  "Bangles",
  "Ring",
  "Pendant",
  "Bridal Set",
  "Other",
] as const;

export type Area = (typeof AREAS)[number];
export type Category = (typeof CATEGORIES)[number];
export type RequestStatus =
  | "submitted"
  | "checking"
  | "similar_offered"
  | "matched"
  | "not_found"
  | "closed"
  | "cancelled";
export type AssignmentStatus = "draft" | "sent" | "viewed" | "replied" | "expired" | "cancelled";
export type ReplyKind = "has" | "similar" | "no";
export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "read" | "failed";
export type ApplicationStatus = "new" | "reviewing" | "approved" | "rejected" | "needs_info";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "operator";
}

export interface Showroom {
  id: string;
  name: string;
  area: Area;
  address: string;
  phone: string;
  whatsapp: string;
  categories: Category[];
  active: boolean;
  rating: number;
  responseRate: number;
  averageReplyMinutes: number;
  hours: string;
  initials: string;
  accent: string;
}

export interface JewelleryRequest {
  id: string;
  code: string;
  trackingToken: string;
  customerName: string;
  phone: string;
  area: Area;
  category: Category;
  budgetLabel: string;
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  photoDataUrl?: string;
  photoTone: string;
  status: RequestStatus;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  version: number;
}

export interface ShowroomAssignment {
  id: string;
  requestId: string;
  showroomId: string;
  status: AssignmentStatus;
  sentAt?: string;
  viewedAt?: string;
  replyDueAt?: string;
  createdAt: string;
}

export interface ShowroomReply {
  id: string;
  assignmentId: string;
  kind: ReplyKind;
  note?: string;
  price?: number;
  weight?: string;
  purity?: string;
  photoTone?: string;
  source: "admin" | "showroom";
  createdAt: string;
}

export interface Match {
  id: string;
  requestId: string;
  showroomId: string;
  replyId: string;
  kind: "exact" | "similar";
  releasedAt: string;
}

export interface MessageRecord {
  id: string;
  requestId?: string;
  recipient: string;
  template: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface ShowroomApplication {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  area: Area;
  categories: Category[];
  note?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  requestId?: string;
  actor: string;
  event: string;
  detail: string;
  createdAt: string;
}

export interface ShopperFeedback {
  id: string;
  requestId: string;
  outcome: "contacted" | "visited" | "not_interested";
  createdAt: string;
}

export interface RequestDetail {
  request: JewelleryRequest;
  assignments: Array<ShowroomAssignment & { showroom: Showroom; latestReply?: ShowroomReply }>;
  matches: Array<Match & { showroom: Showroom; reply: ShowroomReply }>;
  messages: MessageRecord[];
  activity: ActivityEvent[];
  feedback?: ShopperFeedback;
}

export interface DashboardMetrics {
  requestsToday: number;
  openRequests: number;
  exactMatchRate: number;
  medianReplyMinutes: number;
  pendingApplications: number;
  failedMessages: number;
  statusCounts: Array<{ status: RequestStatus; count: number }>;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface RequestFilters {
  search?: string;
  status?: RequestStatus | "all";
  area?: Area | "all";
  category?: Category | "all";
  page?: number;
  pageSize?: number;
}

export interface ShowroomFilters {
  search?: string;
  area?: Area | "all";
  active?: "all" | "active" | "paused";
}

export interface CreateRequestInput {
  customerName: string;
  phone: string;
  area: Area;
  category: Category;
  budgetLabel: string;
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  photoDataUrl?: string;
}

export interface ReplyInput {
  assignmentId: string;
  kind: ReplyKind;
  note?: string;
  price?: number;
  weight?: string;
  purity?: string;
  source: "admin" | "showroom";
}

export interface CreateApplicationInput {
  businessName: string;
  contactName: string;
  phone: string;
  area: Area;
  categories: Category[];
  note?: string;
}

export interface DemoScenario {
  latency: "normal" | "slow";
  forceError: boolean;
  offline: boolean;
}

export class AppError extends Error {
  constructor(
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK" | "CONFLICT" | "UNKNOWN",
    message: string,
    public retryable = false,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}
