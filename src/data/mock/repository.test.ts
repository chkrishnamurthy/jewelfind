import { beforeEach, describe, expect, it } from "vitest";

import { mockRepositoryBundle } from "@/src/data/mock/repository";

describe("mock repository", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await mockRepositoryBundle.demo.reset();
    mockRepositoryBundle.demo.setScenario({ latency: "normal", forceError: false, offline: false });
  });

  it("creates a shopper request that can be retrieved using its tracking token", async () => {
    const request = await mockRepositoryBundle.requests.create({
      customerName: "Ananya Rao",
      phone: "+919876543210",
      area: "Banjara Hills",
      category: "Necklace",
      budgetLabel: "₹1–2 lakh",
      budgetMin: 100000,
      budgetMax: 200000,
      notes: "Looking for a lightweight temple necklace.",
      photoDataUrl: "data:image/jpeg;base64,demo",
    });

    const tracked = await mockRepositoryBundle.requests.getByToken(request.trackingToken);

    expect(tracked.request.code).toBe(request.code);
    expect(tracked.request.status).toBe("submitted");
    expect(tracked.messages[0]?.template).toBe("request_received");
  });

  it("moves an assigned request through showroom reply and shopper release", async () => {
    const assigned = await mockRepositoryBundle.requests.assign("req-001", ["sr-01"]);
    const assignment = assigned.assignments.find((item) => item.showroom.id === "sr-01");

    expect(assignment).toBeDefined();
    expect(assigned.request.status).toBe("checking");

    const replied = await mockRepositoryBundle.requests.reply({
      assignmentId: assignment!.id,
      kind: "has",
      note: "Available for an in-store viewing today.",
      price: 185000,
      weight: "28.4 g",
      purity: "22K",
      source: "showroom",
    });
    const reply = replied.assignments.find((item) => item.id === assignment!.id)?.latestReply;

    expect(reply?.kind).toBe("has");

    const released = await mockRepositoryBundle.requests.release("req-001", reply!.id);

    expect(released.request.status).toBe("matched");
    expect(released.matches).toHaveLength(1);
    expect(released.matches[0]?.reply.price).toBe(185000);
  });
});
