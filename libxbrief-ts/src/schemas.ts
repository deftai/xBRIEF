import { z } from "zod";

const AnyValueSchema = z.unknown();

export interface PlanEdgeData {
  from: string;
  to: string;
  type?: string;
  [key: string]: unknown;
}

export interface PlanItemData {
  title: string;
  status: string;
  id?: unknown;
  uid?: unknown;
  type?: unknown;
  summary?: unknown;
  narrative?: unknown;
  items?: PlanItemData[];
  subItems?: PlanItemData[];
  planRef?: unknown;
  planRefs?: unknown;
  tags?: unknown;
  metadata?: unknown;
  created?: unknown;
  updated?: unknown;
  completed?: unknown;
  priority?: unknown;
  dueDate?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  percentComplete?: unknown;
  participants?: unknown;
  location?: unknown;
  uris?: unknown;
  recurrence?: unknown;
  reminders?: unknown;
  classification?: unknown;
  relatedComments?: unknown;
  timezone?: unknown;
  sequence?: unknown;
  lastModifiedBy?: unknown;
  lockedBy?: unknown;
  [key: string]: unknown;
}

export interface PlanData {
  title: string;
  status: string;
  items: PlanItemData[];
  id?: unknown;
  uid?: unknown;
  narratives?: unknown;
  edges?: PlanEdgeData[];
  tags?: unknown;
  metadata?: unknown;
  created?: unknown;
  updated?: unknown;
  author?: unknown;
  reviewers?: unknown;
  uris?: unknown;
  references?: unknown;
  timezone?: unknown;
  agent?: unknown;
  lastModifiedBy?: unknown;
  changeLog?: unknown;
  sequence?: unknown;
  fork?: unknown;
  [key: string]: unknown;
}

export interface XBriefDocumentData {
  xBRIEFInfo: {
    version: string;
    [key: string]: unknown;
  };
  plan: PlanData;
  [key: string]: unknown;
}

/**
 * Runtime schema for plan edges used by DAG-enabled plans.
 */
export const PlanEdgeSchema: z.ZodType<PlanEdgeData> = z
  .object({
    from: z.string(),
    to: z.string(),
    type: z.string().optional(),
  })
  .passthrough();

/**
 * Runtime schema for xBRIEF plan items.
 */
export const PlanItemSchema: z.ZodType<PlanItemData> = z.lazy(() =>
  z
    .object({
      id: AnyValueSchema.optional(),
      uid: AnyValueSchema.optional(),
      type: AnyValueSchema.optional(),
      summary: AnyValueSchema.optional(),
      title: z.string(),
      status: z.string(),
      narrative: AnyValueSchema.optional(),
      items: z.array(PlanItemSchema).optional(),
      subItems: z.array(PlanItemSchema).optional(),
      planRef: AnyValueSchema.optional(),
      planRefs: AnyValueSchema.optional(),
      tags: AnyValueSchema.optional(),
      metadata: AnyValueSchema.optional(),
      created: AnyValueSchema.optional(),
      updated: AnyValueSchema.optional(),
      completed: AnyValueSchema.optional(),
      priority: AnyValueSchema.optional(),
      dueDate: AnyValueSchema.optional(),
      startDate: AnyValueSchema.optional(),
      endDate: AnyValueSchema.optional(),
      percentComplete: AnyValueSchema.optional(),
      participants: AnyValueSchema.optional(),
      location: AnyValueSchema.optional(),
      uris: AnyValueSchema.optional(),
      recurrence: AnyValueSchema.optional(),
      reminders: AnyValueSchema.optional(),
      classification: AnyValueSchema.optional(),
      relatedComments: AnyValueSchema.optional(),
      timezone: AnyValueSchema.optional(),
      sequence: AnyValueSchema.optional(),
      lastModifiedBy: AnyValueSchema.optional(),
      lockedBy: AnyValueSchema.optional(),
    })
    .passthrough(),
);

/**
 * Runtime schema for xBRIEF plans.
 */
export const PlanSchema: z.ZodType<PlanData> = z
  .object({
    id: AnyValueSchema.optional(),
    uid: AnyValueSchema.optional(),
    title: z.string(),
    status: z.string(),
    items: z.array(PlanItemSchema),
    narratives: AnyValueSchema.optional(),
    edges: z.array(PlanEdgeSchema).optional(),
    tags: AnyValueSchema.optional(),
    metadata: AnyValueSchema.optional(),
    created: AnyValueSchema.optional(),
    updated: AnyValueSchema.optional(),
    author: AnyValueSchema.optional(),
    reviewers: AnyValueSchema.optional(),
    uris: AnyValueSchema.optional(),
    references: AnyValueSchema.optional(),
    timezone: AnyValueSchema.optional(),
    agent: AnyValueSchema.optional(),
    lastModifiedBy: AnyValueSchema.optional(),
    changeLog: AnyValueSchema.optional(),
    sequence: AnyValueSchema.optional(),
    fork: AnyValueSchema.optional(),
  })
  .passthrough();

/**
 * Runtime schema for xBRIEF documents.
 */
export const XBriefDocumentSchema: z.ZodType<XBriefDocumentData> = z
  .object({
    xBRIEFInfo: z
      .object({
        version: z.string(),
      })
      .passthrough(),
    plan: PlanSchema,
  })
  .passthrough();

