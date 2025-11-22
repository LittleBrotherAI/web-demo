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
    id: varchar({ length: 36 })
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
    id: varchar({ length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chatId: varchar({ length: 36 })
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    role: roleEnum().notNull(),
    parts: json(),
    ...timestamps
  },
  table => [index('messages_chat_id_idx').on(table.chatId)]
)

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  }),
  monitoringResults: many(monitoringResults)
}))

export const monitoringResults = pgTable(
  'monitoring_results',
  {
    id: varchar({ length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: varchar({ length: 36 })
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    chatId: varchar({ length: 36 })
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    consistency_language: real(),
    consistency_semantics: real(),
    consistency_nli: varchar({ length: 50 }),
    similarity: real(),
    understandability: real(),
    completed: boolean().default(false).notNull(),
    ...timestamps
  },
  table => [
    index('monitoring_results_message_id_idx').on(table.messageId),
    index('monitoring_results_chat_id_idx').on(table.chatId),
    index('monitoring_results_completed_idx').on(table.completed)
  ]
)

export const monitoringResultsRelations = relations(monitoringResults, ({ one }) => ({
  message: one(messages, {
    fields: [monitoringResults.messageId],
    references: [messages.id]
  }),
  chat: one(chats, {
    fields: [monitoringResults.chatId],
    references: [chats.id]
  })
}))
