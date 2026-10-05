import type {
  ActivityEvent,
  JewelleryRequest,
  Match,
  MessageRecord,
  ShopperFeedback,
  Showroom,
  ShowroomApplication,
  ShowroomAssignment,
  ShowroomReply,
} from "@/src/domain/types";
import { AREAS, CATEGORIES } from "@/src/domain/types";

export interface MockDatabase {
  version: 1;
  showrooms: Showroom[];
  requests: JewelleryRequest[];
  assignments: ShowroomAssignment[];
  replies: ShowroomReply[];
  matches: Match[];
  applications: ShowroomApplication[];
  messages: MessageRecord[];
  activity: ActivityEvent[];
  feedback: ShopperFeedback[];
}

const showroomNames = [
  "Aarna Fine Jewels",
  "Nizam Heritage House",
  "Miraaya Gold Studio",
  "Kohinoor Craft",
  "Sitara Jewels",
  "The Deccan Atelier",
  "Varnika Gold",
  "Aurum & Co.",
  "Navya Jewellery",
  "Pearl Courtyard",
  "Saanvi Bridal Studio",
  "Riwaayat Jewels",
  "Ziya Fine Jewellery",
  "Mayura Gold House",
  "Tara Diamond Room",
  "Aabharan Studio",
];

const accents = ["#8a5a44", "#8b6a20", "#4b6f67", "#7d536a", "#5f6546", "#6e5b8b"];
const statusCycle = ["submitted", "checking", "matched", "similar_offered", "not_found", "closed"] as const;
const tones = ["rose", "emerald", "sapphire", "amber", "pearl", "ruby"];

function at(hoursAgo: number) {
  return new Date(Date.parse("2026-10-04T10:00:00.000Z") - hoursAgo * 3_600_000).toISOString();
}

export function createSeedDatabase(): MockDatabase {
  const showrooms: Showroom[] = showroomNames.map((name, index) => ({
    id: `sr-${String(index + 1).padStart(2, "0")}`,
    name,
    area: AREAS[index % AREAS.length],
    address: `${18 + index}, ${AREAS[index % AREAS.length]} Main Road, Hyderabad`,
    phone: `+91990000${String(1000 + index)}`,
    whatsapp: `+91990000${String(1000 + index)}`,
    categories: [CATEGORIES[index % 6], CATEGORIES[(index + 2) % 6]],
    active: index !== 13,
    rating: 4.2 + (index % 7) / 10,
    responseRate: 72 + (index * 7) % 27,
    averageReplyMinutes: 24 + (index * 13) % 150,
    hours: index % 3 === 0 ? "10:30 AM – 8:30 PM" : "10:00 AM – 8:00 PM",
    initials: name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join(""),
    accent: accents[index % accents.length],
  }));

  const requests: JewelleryRequest[] = Array.from({ length: 42 }, (_, index) => {
    const status = statusCycle[index % statusCycle.length];
    return {
      id: `req-${String(index + 1).padStart(3, "0")}`,
      code: `JF-${["7K3P9QXM", "4N8W2LDS", "9R5T1BCA", "2M6Y8HFK", "5P1X7VNE", "8D4Q6JTR"][index % 6]}${index > 5 ? index : ""}`,
      trackingToken: `track-demo-${String(index + 1).padStart(3, "0")}`,
      customerName: ["Ananya Rao", "Meera Shah", "Sara Khan", "Ishita Reddy", "Naina Kapoor", "Kavya Iyer"][index % 6],
      phone: `+9198•••${String(1200 + index).slice(-4)}`,
      area: AREAS[(index + 1) % AREAS.length],
      category: CATEGORIES[index % 6],
      budgetLabel: ["Under ₹50,000", "₹50,000 – ₹1 lakh", "₹1 – ₹2 lakh", "₹2 – ₹5 lakh", "₹5 lakh+"][index % 5],
      budgetMin: [0, 50_000, 100_000, 200_000, 500_000][index % 5],
      budgetMax: [50_000, 100_000, 200_000, 500_000, undefined][index % 5],
      notes: index % 3 === 0 ? "Looking for a close match with a delicate finish. Flexible on small design details." : undefined,
      photoTone: tones[index % tones.length],
      status,
      consentVersion: "frontend-demo-v1",
      createdAt: at(index * 3 + 1),
      updatedAt: at(index * 2),
      closedAt: status === "closed" ? at(index) : undefined,
      version: 1,
    };
  });

  const assignments: ShowroomAssignment[] = [];
  const replies: ShowroomReply[] = [];
  const matches: Match[] = [];

  requests.forEach((request, requestIndex) => {
    if (request.status === "submitted") return;
    const count = 2 + (requestIndex % 3);
    for (let offset = 0; offset < count; offset += 1) {
      const assignmentId = `asn-${requestIndex + 1}-${offset + 1}`;
      const hasReply = request.status !== "checking" || offset === 0;
      assignments.push({
        id: assignmentId,
        requestId: request.id,
        showroomId: showrooms[(requestIndex + offset) % showrooms.length].id,
        status: hasReply ? "replied" : offset === 1 ? "viewed" : "sent",
        sentAt: at(requestIndex * 3),
        viewedAt: offset < 2 ? at(requestIndex * 3 - 0.5) : undefined,
        replyDueAt: at(requestIndex * 3 - 6),
        createdAt: at(requestIndex * 3 + 0.2),
      });

      if (hasReply) {
        const kind = request.status === "matched" && offset === 0 ? "has" : request.status === "similar_offered" && offset === 0 ? "similar" : "no";
        const reply: ShowroomReply = {
          id: `rep-${requestIndex + 1}-${offset + 1}`,
          assignmentId,
          kind,
          note: kind === "no" ? "Not in current stock." : kind === "has" ? "Very close design available in 22K gold." : "A lighter variation is available.",
          price: kind === "no" ? undefined : 86_000 + requestIndex * 1_250,
          weight: kind === "no" ? undefined : `${8 + (requestIndex % 12)}.4 g`,
          purity: kind === "no" ? undefined : "22K",
          photoTone: kind === "no" ? undefined : tones[(requestIndex + 2) % tones.length],
          source: offset % 2 ? "admin" : "showroom",
          createdAt: at(requestIndex * 3 - 1),
        };
        replies.push(reply);
        if (kind !== "no") {
          matches.push({
            id: `match-${requestIndex + 1}`,
            requestId: request.id,
            showroomId: assignments[assignments.length - 1].showroomId,
            replyId: reply.id,
            kind: kind === "has" ? "exact" : "similar",
            releasedAt: at(requestIndex * 3 - 1.5),
          });
        }
      }
    }
  });

  const applications: ShowroomApplication[] = Array.from({ length: 16 }, (_, index) => ({
    id: `app-${String(index + 1).padStart(2, "0")}`,
    businessName: `${["Veda", "Ruhani", "Moksha", "Prisha", "Noor", "Aarya"][index % 6]} Jewellery ${index + 1}`,
    contactName: ["Rohan Mehta", "Fatima Ali", "Arjun Verma", "Sneha Das"][index % 4],
    phone: `+91970000${String(2000 + index)}`,
    area: AREAS[index % AREAS.length],
    categories: [CATEGORIES[index % 6], CATEGORIES[(index + 3) % 6]],
    note: index % 2 === 0 ? "Family-run showroom serving the neighbourhood for over ten years." : undefined,
    status: (["new", "reviewing", "approved", "needs_info", "rejected"] as const)[index % 5],
    createdAt: at(index * 11 + 4),
    updatedAt: at(index * 7 + 2),
  }));

  const messages: MessageRecord[] = requests.slice(0, 24).map((request, index) => ({
    id: `msg-${index + 1}`,
    requestId: request.id,
    recipient: request.phone,
    template: request.status === "matched" ? "match_found" : request.status === "not_found" ? "not_found" : "request_received",
    status: (["read", "delivered", "sent", "failed", "queued"] as const)[index % 5],
    error: index % 5 === 3 ? "Demo delivery failure" : undefined,
    createdAt: at(index * 2 + 1),
    updatedAt: at(index * 2),
  }));

  const activity: ActivityEvent[] = requests.slice(0, 30).map((request, index) => ({
    id: `evt-${index + 1}`,
    requestId: request.id,
    actor: index % 3 === 0 ? "Priya (Admin)" : index % 3 === 1 ? "Showroom" : "System",
    event: index % 3 === 0 ? "Request reviewed" : index % 3 === 1 ? "Reply recorded" : "Status updated",
    detail: `${request.code} · ${request.category} in ${request.area}`,
    createdAt: at(index * 1.4),
  }));

  return {
    version: 1,
    showrooms,
    requests,
    assignments,
    replies,
    matches,
    applications,
    messages,
    activity,
    feedback: [],
  };
}
