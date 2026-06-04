import { describe, expect, test } from "vitest";

import { Plan, PlanItem, StateSurfaceSchema, VBriefDocument } from "../src/index.js";

describe("models", () => {
  test("preserves unknown fields and ordering when round-tripping a document", () => {
    const document = VBriefDocument.fromDict({
      before: "root-extra",
      vBRIEFInfo: {
        version: "0.5",
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
    expect(Object.keys(payload)).toEqual(["before", "vBRIEFInfo", "plan"]);
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
    const document = new VBriefDocument({
      vbriefInfo: { version: "0.5" },
      plan: new Plan({
        title: "Roadmap",
        status: "draft",
        items: [PlanItem.pending("Implement parser")],
      }),
    });

    expect(document.toDict()).toEqual({
      vBRIEFInfo: { version: "0.5" },
      plan: {
        title: "Roadmap",
        status: "draft",
        items: [{ title: "Implement parser", status: "pending" }],
      },
    });
  });

  test("round-trips plan architecture system-of-record as a known field", () => {
    const architecture = {
      systemOfRecord: {
        stateSurfaces: [
          {
            name: "Workspace",
            classification: "durable_product_state",
            owner: "application database",
            approvedStorage: "postgres",
            permissionBoundary: "workspace membership",
          },
        ],
      },
    };
    const document = VBriefDocument.fromDict({
      vBRIEFInfo: { version: "0.5" },
      plan: {
        title: "Stateful feature",
        status: "draft",
        items: [],
        architecture,
      },
    });

    expect(document.plan.architecture).toEqual(architecture);
    expect(document.plan.extras.architecture).toBeUndefined();
    expect(document.toDict()).toEqual({
      vBRIEFInfo: { version: "0.5" },
      plan: {
        title: "Stateful feature",
        status: "draft",
        items: [],
        architecture,
      },
    });
  });

  test("validates system-of-record state surface classification", () => {
    expect(
      StateSurfaceSchema.parse({
        name: "Workspace",
        classification: "durable_product_state",
      }),
    ).toEqual({
      name: "Workspace",
      classification: "durable_product_state",
    });

    expect(() =>
      StateSurfaceSchema.parse({
        name: "Workspace",
        classification: "durable",
      }),
    ).toThrow();
  });
});
