import { describe, expect, test } from "vitest";

import { Plan, PlanItem, XBriefDocument } from "../src/index.js";

describe("models", () => {
  test("preserves unknown fields and ordering when round-tripping a document", () => {
    const document = XBriefDocument.fromDict({
      before: "root-extra",
      xBRIEFInfo: {
        version: "0.8",
        profile: "custom",
      },
      plan: {
        customLeading: true,
        title: "Plan",
        status: "running",
        items: [
          {
            custom: "extra",
            title: "Item A",
            status: "pending",
          },
        ],
      },
    });

    expect(document.extras.before).toBe("root-extra");
    expect(document.plan.extras.customLeading).toBe(true);
    expect(document.plan.items[0]?.extras.custom).toBe("extra");

    const payload = document.toDict({ preserveOrder: true });
    expect(Object.keys(payload)).toEqual(["before", "xBRIEFInfo", "plan"]);
    expect(Object.keys(payload.plan as Record<string, unknown>)).toEqual([
      "customLeading",
      "title",
      "status",
      "items",
    ]);
  });

  test("omits null-like optional fields like the Python model", () => {
    const item = new PlanItem({
      title: "One",
      status: "pending",
      narrative: undefined,
      metadata: null,
    });

    expect(item.toDict()).toEqual({
      title: "One",
      status: "pending",
    });
  });

  test("supports status factories", () => {
    const item = PlanItem.completed("Ship release", { id: "ship-release" });

    expect(item.status).toBe("completed");
    expect(item.id).toBe("ship-release");
  });

  test("constructs plan and document objects directly", () => {
    const document = new XBriefDocument({
      xbriefInfo: { version: "0.8" },
      plan: new Plan({
        title: "Roadmap",
        status: "draft",
        items: [PlanItem.pending("Implement parser")],
      }),
    });

    expect(document.toDict()).toEqual({
      xBRIEFInfo: { version: "0.8" },
      plan: {
        title: "Roadmap",
        status: "draft",
        items: [{ title: "Implement parser", status: "pending" }],
      },
    });
  });
});
