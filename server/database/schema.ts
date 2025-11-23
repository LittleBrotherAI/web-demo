import {
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  index,
  json,
  real,
  boolean
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

const timestamps = {
  createdAt: timestamp().defaultNow().notNull()
}

export const roleEnum = pgEnum('role', ['user', 'assistant'])

export const chats = pgTable(
  'chats',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar({ length: 200 }),
    sessionId: varchar({ length: 255 }).notNull(),
    ...timestamps
  },
  table => [index('chats_session_id_idx').on(table.sessionId)]
)

export const chatsRelations = relations(chats, ({ many }) => ({
  messages: many(messages)
}))

export const messages = pgTable(
  'messages',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chatId: varchar({ length: 255 })
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    role: roleEnum().notNull(),
    parts: json(),
    ...timestamps
  },
  table => [index('messages_chat_id_idx').on(table.chatId)]
)

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  }),
  monitorLanguage: one(monitorLanguage, {
    fields: [messages.id],
    references: [monitorLanguage.messageId]
  }),
  monitorSemantics: one(monitorSemantics, {
    fields: [messages.id],
    references: [monitorSemantics.messageId]
  }),
  monitorEntailment: one(monitorEntailment, {
    fields: [messages.id],
    references: [monitorEntailment.messageId]
  }),
  monitorSurprisal: one(monitorSurprisal, {
    fields: [messages.id],
    references: [monitorSurprisal.messageId]
  }),
  monitorReproducibility: one(monitorReproducibility, {
    fields: [messages.id],
    references: [monitorReproducibility.messageId]
  }),
  monitorLegibilityCoverage: one(monitorLegibilityCoverage, {
    fields: [messages.id],
    references: [monitorLegibilityCoverage.messageId]
  }),
  monitorAdversarial: one(monitorAdversarial, {
    fields: [messages.id],
    references: [monitorAdversarial.messageId]
  }),
  monitorConsistency: one(monitorConsistency, {
    fields: [messages.id],
    references: [monitorConsistency.messageId]
  }),
  monitorFactcheck: one(monitorFactcheck, {
    fields: [messages.id],
    references: [monitorFactcheck.messageId]
  })
}))

// Monitor tables - one per monitor type

export const monitorLanguage = pgTable(
  'monitor_language',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    score: real().notNull()
  },
  table => [index('monitor_language_message_id_idx').on(table.messageId)]
)

export const monitorLanguageRelations = relations(monitorLanguage, ({ one }) => ({
  message: one(messages, {
    fields: [monitorLanguage.messageId],
    references: [messages.id]
  })
}))

export const monitorSemantics = pgTable(
  'monitor_semantics',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    score: real().notNull()
  },
  table => [index('monitor_semantics_message_id_idx').on(table.messageId)]
)

export const monitorSemanticsRelations = relations(monitorSemantics, ({ one }) => ({
  message: one(messages, {
    fields: [monitorSemantics.messageId],
    references: [messages.id]
  })
}))

export const monitorEntailment = pgTable(
  'monitor_entailment',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    score: real().notNull()
  },
  table => [index('monitor_entailment_message_id_idx').on(table.messageId)]
)

export const monitorEntailmentRelations = relations(monitorEntailment, ({ one }) => ({
  message: one(messages, {
    fields: [monitorEntailment.messageId],
    references: [messages.id]
  })
}))

export const monitorSurprisal = pgTable(
  'monitor_surprisal',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    surprisal_score: real().notNull()
  },
  table => [index('monitor_surprisal_message_id_idx').on(table.messageId)]
)

export const monitorSurprisalRelations = relations(monitorSurprisal, ({ one }) => ({
  message: one(messages, {
    fields: [monitorSurprisal.messageId],
    references: [messages.id]
  })
}))

export const monitorReproducibility = pgTable(
  'monitor_reproducibility',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    score: real().notNull()
  },
  table => [index('monitor_reproducibility_message_id_idx').on(table.messageId)]
)

export const monitorReproducibilityRelations = relations(monitorReproducibility, ({ one }) => ({
  message: one(messages, {
    fields: [monitorReproducibility.messageId],
    references: [messages.id]
  })
}))

export const monitorLegibilityCoverage = pgTable(
  'monitor_legibility_coverage',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    legibility_score: real().notNull(),
    coverage_score: real().notNull()
  },
  table => [index('monitor_legibility_coverage_message_id_idx').on(table.messageId)]
)

export const monitorLegibilityCoverageRelations = relations(monitorLegibilityCoverage, ({ one }) => ({
  message: one(messages, {
    fields: [monitorLegibilityCoverage.messageId],
    references: [messages.id]
  })
}))

export const monitorAdversarial = pgTable(
  'monitor_adversarial',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    isAdversarial: boolean().notNull(),
    explanation: varchar({ length: 1000 }).notNull(),
    severity: varchar({ length: 255 }).notNull()
  },
  table => [index('monitor_adversarial_message_id_idx').on(table.messageId)]
)

export const monitorAdversarialRelations = relations(monitorAdversarial, ({ one }) => ({
  message: one(messages, {
    fields: [monitorAdversarial.messageId],
    references: [messages.id]
  })
}))

export const monitorConsistency = pgTable(
  'monitor_consistency',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    isConsistent: boolean().notNull(),
    confidence: real().notNull(),
    explanation: varchar({ length: 1000 }).notNull()
  },
  table => [index('monitor_consistency_message_id_idx').on(table.messageId)]
)

export const monitorConsistencyRelations = relations(monitorConsistency, ({ one }) => ({
  message: one(messages, {
    fields: [monitorConsistency.messageId],
    references: [messages.id]
  })
}))

export const monitorFactcheck = pgTable(
  'monitor_factcheck',
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 255 })
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: 'cascade' }),
    correctness_score: real().notNull(),
    explanation: varchar({ length: 1000 }).notNull()
  },
  table => [index('monitor_factcheck_message_id_idx').on(table.messageId)]
)

export const monitorFactcheckRelations = relations(monitorFactcheck, ({ one }) => ({
  message: one(messages, {
    fields: [monitorFactcheck.messageId],
    references: [messages.id]
  })
}))
