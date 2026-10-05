import type {
  ActivityEvent,
  AdminUser,
  ApplicationStatus,
  CreateApplicationInput,
  CreateRequestInput,
  DashboardMetrics,
  DemoScenario,
  JewelleryRequest,
  MessageRecord,
  PageResult,
  ReplyInput,
  RequestDetail,
  RequestFilters,
  Showroom,
  ShowroomApplication,
  ShowroomFilters,
} from "@/src/domain/types";

export interface AuthRepository {
  loginAdmin(email: string, password: string): Promise<AdminUser>;
  loginShowroom(phone: string, code: string): Promise<Showroom>;
  getAdminSession(): AdminUser | null;
  getShowroomSession(): Showroom | null;
  logout(scope: "admin" | "showroom"): Promise<void>;
}

export interface RequestRepository {
  list(filters?: RequestFilters): Promise<PageResult<JewelleryRequest>>;
  get(id: string): Promise<RequestDetail>;
  getByToken(token: string): Promise<RequestDetail>;
  create(input: CreateRequestInput): Promise<JewelleryRequest>;
  assign(requestId: string, showroomIds: string[]): Promise<RequestDetail>;
  reply(input: ReplyInput): Promise<RequestDetail>;
  release(requestId: string, replyId: string): Promise<RequestDetail>;
  markNotFound(requestId: string): Promise<RequestDetail>;
  submitFeedback(requestId: string, outcome: "contacted" | "visited" | "not_interested"): Promise<RequestDetail>;
}

export interface ShowroomRepository {
  list(filters?: ShowroomFilters): Promise<Showroom[]>;
  get(id: string): Promise<Showroom>;
  save(showroom: Partial<Showroom> & Pick<Showroom, "name" | "area" | "categories">): Promise<Showroom>;
  toggle(id: string): Promise<Showroom>;
  assignments(showroomId: string): Promise<RequestDetail[]>;
}

export interface ApplicationRepository {
  list(status?: ApplicationStatus | "all"): Promise<ShowroomApplication[]>;
  get(id: string): Promise<ShowroomApplication>;
  create(input: CreateApplicationInput): Promise<ShowroomApplication>;
  updateStatus(id: string, status: ApplicationStatus): Promise<ShowroomApplication>;
}

export interface OperationsRepository {
  dashboard(): Promise<DashboardMetrics>;
  messages(): Promise<MessageRecord[]>;
  retryMessage(id: string): Promise<MessageRecord>;
  activity(): Promise<ActivityEvent[]>;
}

export interface DemoRepository {
  getScenario(): DemoScenario;
  setScenario(scenario: DemoScenario): void;
  reset(): Promise<void>;
}

export interface RepositoryBundle {
  auth: AuthRepository;
  requests: RequestRepository;
  showrooms: ShowroomRepository;
  applications: ApplicationRepository;
  operations: OperationsRepository;
  demo: DemoRepository;
}
