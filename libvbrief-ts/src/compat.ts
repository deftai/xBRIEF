/**
 * Compatibility constants and issue codes.
 */

export const VALID_STATUSES = new Set([
  "draft",
  "proposed",
  "approved",
  "pending",
  "running",
  "completed",
  "blocked",
  "cancelled",
]);

export const HIERARCHICAL_ID_PATTERN = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/;
export const PLAN_REF_PATTERN = /^(#[a-zA-Z0-9_.-]+|file:\/\/.*|https:\/\/.*)$/;

export const ISSUE_INVALID_DOCUMENT_TYPE = "invalid_document_type";
export const ISSUE_MISSING_ROOT_FIELD = "missing_root_field";
export const ISSUE_INVALID_ROOT_FIELD_TYPE = "invalid_root_field_type";
export const ISSUE_INVALID_VERSION = "invalid_version";
export const ISSUE_MISSING_PLAN_FIELD = "missing_plan_field";
export const ISSUE_INVALID_PLAN_FIELD_TYPE = "invalid_plan_field_type";
export const ISSUE_INVALID_PLAN_STATUS = "invalid_plan_status";
export const ISSUE_INVALID_ITEM_TYPE = "invalid_item_type";
export const ISSUE_MISSING_ITEM_FIELD = "missing_item_field";
export const ISSUE_INVALID_ITEM_STATUS = "invalid_item_status";
export const ISSUE_INVALID_ID_FORMAT = "invalid_id_format";
export const ISSUE_DUPLICATE_ITEM_ID = "duplicate_item_id";
export const ISSUE_INVALID_PLANREF = "invalid_planref";
export const ISSUE_INVALID_SUBITEMS_TYPE = "invalid_subitems_type";
export const ISSUE_INVALID_EDGE_STRUCTURE = "invalid_edge_structure";
export const ISSUE_DANGLING_EDGE_REF = "dangling_edge_ref";
export const ISSUE_DAG_CYCLE = "dag_cycle";

export const PLAN_ITEM_FIELD_ORDER = [
  "id",
  "uid",
  "title",
  "status",
  "narrative",
  "subItems",
  "planRef",
  "tags",
  "metadata",
  "created",
  "updated",
  "completed",
  "priority",
  "dueDate",
  "startDate",
  "endDate",
  "percentComplete",
  "participants",
  "location",
  "uris",
  "recurrence",
  "reminders",
  "classification",
  "relatedComments",
  "timezone",
  "sequence",
  "lastModifiedBy",
  "lockedBy",
] as const;

export const PLAN_FIELD_ORDER = [
  "id",
  "uid",
  "title",
  "status",
  "items",
  "narratives",
  "edges",
  "tags",
  "metadata",
  "architecture",
  "created",
  "updated",
  "author",
  "reviewers",
  "uris",
  "references",
  "timezone",
  "agent",
  "lastModifiedBy",
  "changeLog",
  "sequence",
  "fork",
] as const;

export const DOCUMENT_FIELD_ORDER = ["vBRIEFInfo", "plan"] as const;
