import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: text('display_name').notNull().default('Default User'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const baseCvs = pgTable(
  'base_cvs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    fileName: text('file_name').notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_base_cvs_profile').on(table.profileId)],
)

export const jobPostings = pgTable(
  'job_postings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    sourceType: text('source_type').notNull(),
    sourceUrl: text('source_url'),
    rawText: text('raw_text'),
    extractedText: text('extracted_text').notNull(),
    companyName: text('company_name'),
    jobTitle: text('job_title'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'job_postings_source_type_check',
      sql`${table.sourceType} in ('paste', 'url')`,
    ),
    index('idx_job_postings_profile').on(table.profileId),
  ],
)

export const tailoredCvs = pgTable(
  'tailored_cvs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    baseCvId: uuid('base_cv_id')
      .notNull()
      .references(() => baseCvs.id, { onDelete: 'cascade' }),
    jobPostingId: uuid('job_posting_id')
      .notNull()
      .references(() => jobPostings.id, { onDelete: 'cascade' }),
    content: jsonb('content').notNull(),
    templateId: text('template_id').notNull().default('modern'),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('idx_tailored_cvs_profile').on(table.profileId)],
)

export const profilesRelations = relations(profiles, ({ many }) => ({
  baseCvs: many(baseCvs),
  jobPostings: many(jobPostings),
  tailoredCvs: many(tailoredCvs),
}))

export const baseCvsRelations = relations(baseCvs, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [baseCvs.profileId],
    references: [profiles.id],
  }),
  tailoredCvs: many(tailoredCvs),
}))

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [jobPostings.profileId],
    references: [profiles.id],
  }),
  tailoredCvs: many(tailoredCvs),
}))

export const tailoredCvsRelations = relations(tailoredCvs, ({ one }) => ({
  profile: one(profiles, {
    fields: [tailoredCvs.profileId],
    references: [profiles.id],
  }),
  baseCv: one(baseCvs, {
    fields: [tailoredCvs.baseCvId],
    references: [baseCvs.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [tailoredCvs.jobPostingId],
    references: [jobPostings.id],
  }),
}))

export type Profile = typeof profiles.$inferSelect
export type InsertProfile = typeof profiles.$inferInsert

export type BaseCv = typeof baseCvs.$inferSelect
export type InsertBaseCv = typeof baseCvs.$inferInsert

export type JobPosting = typeof jobPostings.$inferSelect
export type InsertJobPosting = typeof jobPostings.$inferInsert

export type TailoredCv = typeof tailoredCvs.$inferSelect
export type InsertTailoredCv = typeof tailoredCvs.$inferInsert

export type SourceType = 'paste' | 'url'
export type TemplateId = 'classic' | 'modern' | 'creative' | 'compact'
