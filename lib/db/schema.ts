import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Drizzle schema mirrors supabase/migrations/0001-0004.
 * Treat SQL files as the source of truth; this file is for typed queries
 * from app code. RLS still applies — use the right Supabase client.
 */

export const appUsers = pgTable("app_users", {
  email: text("email").primaryKey(),
  role: text("role", { enum: ["admin", "interviewer"] }).notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const formTemplates = pgTable("form_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  category: text("category", {
    enum: ["culture", "onboarding", "interview-q", "interview-eval", "exit"],
  }).notNull(),
  name: text("name").notNull(),
  currentVersionId: uuid("current_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const formVersions = pgTable(
  "form_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    schemaJson: jsonb("schema_json").notNull(),
    sourceYamlHash: text("source_yaml_hash").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by"),
    supersedesId: uuid("supersedes_id"),
  },
  (t) => ({
    versionUnique: unique("form_versions_template_version").on(
      t.templateId,
      t.versionNumber,
    ),
    templateIdx: index("form_versions_template_idx").on(t.templateId),
  }),
);

export const formLinks = pgTable(
  "form_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    versionId: uuid("version_id").notNull(),
    targetName: text("target_name"),
    targetRole: text("target_role"),
    candidateId: uuid("candidate_id"),
    employeeId: uuid("employee_id"),
    issuedBy: text("issued_by"),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxUses: integer("max_uses").notNull().default(1),
    useCount: integer("use_count").notNull().default(0),
  },
  (t) => ({
    versionIdx: index("form_links_version_idx").on(t.versionId),
    tokenIdx: index("form_links_token_idx").on(t.token),
  }),
);

export const formResponses = pgTable(
  "form_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    linkId: uuid("link_id").notNull(),
    versionId: uuid("version_id").notNull(),
    schemaSnapshotJson: jsonb("schema_snapshot_json").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submitterEmail: text("submitter_email"),
    submitterMeta: jsonb("submitter_meta")
      .notNull()
      .default(sql`'{}'::jsonb`),
  },
  (t) => ({
    linkIdx: index("form_responses_link_idx").on(t.linkId),
    versionIdx: index("form_responses_version_idx").on(t.versionId),
    submittedIdx: index("form_responses_submitted_idx").on(t.submittedAt),
  }),
);

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    role: text("role"),
    source: text("source"),
    stage: text("stage", {
      enum: [
        "sourced",
        "screened",
        "interview",
        "offer",
        "hired",
        "rejected",
      ],
    })
      .notNull()
      .default("sourced"),
    contact: jsonb("contact").notNull().default(sql`'{}'::jsonb`),
    notes: text("notes"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stageIdx: index("candidates_stage_idx").on(t.stage),
  }),
);

export const candidateEvaluations = pgTable(
  "candidate_evaluations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id").notNull(),
    responseId: uuid("response_id").notNull().unique(),
    interviewerEmail: text("interviewer_email"),
    round: integer("round").notNull().default(1),
    recommendation: text("recommendation", {
      enum: ["strong-yes", "yes", "no", "strong-no"],
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    candidateIdx: index("candidate_evaluations_candidate_idx").on(t.candidateId),
  }),
);

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    dept: text("dept"),
    role: text("role"),
    email: text("email").unique(),
    joinedAt: date("joined_at"),
    status: text("status", { enum: ["active", "leaving", "left"] })
      .notNull()
      .default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("employees_status_idx").on(t.status),
    deptIdx: index("employees_dept_idx").on(t.dept),
  }),
);

export const retentionSignals = pgTable("retention_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").notNull(),
  signalType: text("signal_type", {
    enum: [
      "rights_negotiation",
      "gossip",
      "accountability",
      "leaving_intent",
      "comp_query",
      "conflict",
      "other",
    ],
  }).notNull(),
  severity: text("severity", { enum: ["red", "yellow", "green"] })
    .notNull()
    .default("yellow"),
  raisedAt: timestamp("raised_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  raisedBy: text("raised_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  sourceResponseId: uuid("source_response_id"),
  notes: text("notes"),
});
