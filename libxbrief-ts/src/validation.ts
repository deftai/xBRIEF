import {
  HIERARCHICAL_ID_PATTERN,
  ISSUE_DUPLICATE_ITEM_ID,
  ISSUE_INVALID_DOCUMENT_TYPE,
  ISSUE_INVALID_ID_FORMAT,
  ISSUE_INVALID_ITEM_STATUS,
  ISSUE_INVALID_ITEM_TYPE,
  ISSUE_INVALID_PLAN_FIELD_TYPE,
  ISSUE_INVALID_PLAN_STATUS,
  ISSUE_INVALID_PLANREF,
  ISSUE_INVALID_ROOT_FIELD_TYPE,
  ISSUE_INVALID_SUBITEMS_TYPE,
  ISSUE_INVALID_VERSION,
  ISSUE_MISSING_ITEM_FIELD,
  ISSUE_MISSING_PLAN_FIELD,
  ISSUE_MISSING_ROOT_FIELD,
  PLAN_REF_PATTERN,
  VALID_STATUSES,
} from "./compat.js";
import { validatePlanDAG } from "./dag.js";
import { ValidationReport } from "./issues.js";
import { isRecordLike } from "./utils.js";

export interface ValidateOptions {
  dag?: boolean;
}

/**
 * Validate a plain document or model object.
 */
export function validateDocument(document: unknown, options: ValidateOptions = {}): ValidationReport {
  const report = new ValidationReport();
  const data = toDict(document);

  if (!isRecordLike(data)) {
    report.addError(ISSUE_INVALID_DOCUMENT_TYPE, "$", "Document must be an object/dictionary");
    return report;
  }

  validateRoot(data, report);

  if (options.dag) {
    const plan = data.plan;
    if (isRecordLike(plan)) {
      validatePlanDAG(plan, report);
    }
  }

  return report;
}

function validateRoot(data: Record<string, unknown>, report: ValidationReport): void {
  let xbriefInfo: Record<string, unknown> | undefined;
  if (!Object.hasOwn(data, "xBRIEFInfo")) {
    report.addError(ISSUE_MISSING_ROOT_FIELD, "xBRIEFInfo", "Missing required root field: xBRIEFInfo");
  } else if (!isRecordLike(data.xBRIEFInfo)) {
    report.addError(ISSUE_INVALID_ROOT_FIELD_TYPE, "xBRIEFInfo", "xBRIEFInfo must be an object");
  } else {
    xbriefInfo = data.xBRIEFInfo;
  }

  if (xbriefInfo !== undefined) {
    const version = xbriefInfo.version;
    if (version !== "0.8") {
      report.addError(
        ISSUE_INVALID_VERSION,
        "xBRIEFInfo.version",
        `Expected version '0.7', got ${JSON.stringify(version)}`,
      );
    }
  }

  if (!Object.hasOwn(data, "plan")) {
    report.addError(ISSUE_MISSING_ROOT_FIELD, "plan", "Missing required root field: plan");
    return;
  }

  if (!isRecordLike(data.plan)) {
    report.addError(ISSUE_INVALID_ROOT_FIELD_TYPE, "plan", "plan must be an object");
    return;
  }

  validatePlan(data.plan, report);
}

function validatePlan(plan: Record<string, unknown>, report: ValidationReport): void {
  for (const fieldName of ["title", "status", "items"]) {
    if (!Object.hasOwn(plan, fieldName)) {
      report.addError(
        ISSUE_MISSING_PLAN_FIELD,
        `plan.${fieldName}`,
        `Missing required plan field: ${fieldName}`,
      );
    }
  }

  const status = plan.status;
  if (status !== undefined && (typeof status !== "string" || !VALID_STATUSES.has(status))) {
    report.addError(
      ISSUE_INVALID_PLAN_STATUS,
      "plan.status",
      `Invalid plan status ${JSON.stringify(status)}; expected one of ${JSON.stringify([...VALID_STATUSES].sort())}`,
    );
  }

  const planId = plan.id;
  if (planId !== undefined && (typeof planId !== "string" || !HIERARCHICAL_ID_PATTERN.test(planId))) {
    report.addError(ISSUE_INVALID_ID_FORMAT, "plan.id", "plan.id must match hierarchical ID pattern");
  }

  const items = plan.items;
  if (items === undefined) {
    return;
  }

  if (!Array.isArray(items)) {
    report.addError(ISSUE_INVALID_PLAN_FIELD_TYPE, "plan.items", "plan.items must be an array");
    return;
  }

  validateItems(items, report, "plan.items", new Set<string>());
}

function validateItems(
  items: unknown[],
  report: ValidationReport,
  path: string,
  seenIds: Set<string>,
): void {
  for (const [index, item] of items.entries()) {
    const itemPath = `${path}[${index}]`;

    if (!isRecordLike(item)) {
      report.addError(ISSUE_INVALID_ITEM_TYPE, itemPath, "Plan item must be an object");
      continue;
    }

    if (!Object.hasOwn(item, "title")) {
      report.addError(ISSUE_MISSING_ITEM_FIELD, `${itemPath}.title`, "Missing required item field: title");
    }

    if (!Object.hasOwn(item, "status")) {
      report.addError(ISSUE_MISSING_ITEM_FIELD, `${itemPath}.status`, "Missing required item field: status");
    }

    const status = item.status;
    if (status !== undefined && (typeof status !== "string" || !VALID_STATUSES.has(status))) {
      report.addError(
        ISSUE_INVALID_ITEM_STATUS,
        `${itemPath}.status`,
        `Invalid item status ${JSON.stringify(status)}; expected one of ${JSON.stringify([...VALID_STATUSES].sort())}`,
      );
    }

    const itemId = item.id;
    if (itemId !== undefined && (typeof itemId !== "string" || !HIERARCHICAL_ID_PATTERN.test(itemId))) {
      report.addError(ISSUE_INVALID_ID_FORMAT, `${itemPath}.id`, "item id must match hierarchical ID pattern");
    } else if (typeof itemId === "string") {
      if (seenIds.has(itemId)) {
        report.addError(ISSUE_DUPLICATE_ITEM_ID, `${itemPath}.id`, `Duplicate item id ${JSON.stringify(itemId)}`);
      } else {
        seenIds.add(itemId);
      }
    }

    const planRef = item.planRef;
    if (planRef !== undefined && (typeof planRef !== "string" || !PLAN_REF_PATTERN.test(planRef))) {
      report.addError(
        ISSUE_INVALID_PLANREF,
        `${itemPath}.planRef`,
        "planRef must match #..., file://..., or https://...",
      );
    }

    const subItems = item.subItems;
    if (subItems === undefined) {
      continue;
    }
    if (!Array.isArray(subItems)) {
      report.addError(ISSUE_INVALID_SUBITEMS_TYPE, `${itemPath}.subItems`, "subItems must be an array");
      continue;
    }

    validateItems(subItems, report, `${itemPath}.subItems`, seenIds);
  }
}

function toDict(document: unknown): unknown {

  if (typeof document === "object" && document !== null) {
    const candidate = document as { toDict?: (options?: { preserveOrder?: boolean }) => unknown };
    if (typeof candidate.toDict === "function") {
      return candidate.toDict({ preserveOrder: false });
    }
  }

  if (isRecordLike(document)) {
    return document;
  }

  return document;
}
