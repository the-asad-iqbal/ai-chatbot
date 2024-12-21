import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  text,
  boolean,
} from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('chats', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('created_at').notNull(),
  title: text('title').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('messages', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('created_at').notNull(),
  content: text('content').notNull(),
  role: varchar('role', { length: 256 }).notNull(),
  chatId: uuid('chat_id').notNull()
    .references(() => chat.id),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable('votes', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chat_id').notNull()
    .references(() => chat.id),
  messageId: uuid('message_id').notNull()
    .references(() => message.id),
  isUpvoted: boolean('is_upvoted').notNull(),
});

export type Vote = InferSelectModel<typeof vote>;

export const memory = pgTable('memories', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('created_at').notNull(),
  text: text('text').notNull(),
  userId: uuid('user_id').notNull()
    .references(() => user.id),
});

export type Memory = InferSelectModel<typeof memory>;