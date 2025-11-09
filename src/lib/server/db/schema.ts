import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	age: integer('age')
});

export const card = sqliteTable('card', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	front: text('front').notNull(),
	back: text('back').notNull(),
	noteId: text('note_id')
		.references(() => note.id, {
			onDelete: 'cascade'
		})
		.notNull(),
	options: text({ mode: 'json' }).$type<Array<{ option: string; value: string }> | string>(),
	type: text().notNull(),
	createdAt: integer('created_at').default(sql`(unixepoch())`),
	updatedAt: integer('updated_at').default(sql`(unixepoch())`)
});

export const note = sqliteTable('note', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').unique().notNull(),
	content: text('content'),
	createdAt: integer('created_at').default(sql`(unixepoch())`),
	updatedAt: integer('updated_at').default(sql`(unixepoch())`)
});

export const review = sqliteTable('review', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	cardId: text('card_id')
		.references(() => card.id, {
			onDelete: 'cascade'
		})
		.notNull(),
	lastReview: integer('last_review'),
	nextReview: integer('next_review').default(sql`(unixepoch())`)
});

export const score = sqliteTable('score', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	cardId: text('card_id')
		.references(() => card.id)
		.notNull(),
	score: integer({ mode: 'boolean' }).notNull(),
	difficulty: integer().notNull(),
	createdAt: integer('created_at').default(sql`(unixepoch())`),
	updatedAt: integer('updated_at').default(sql`(unixepoch())`)
});

export const cardsRelations = relations(card, ({ one, many }) => ({
	note: one(note, {
		fields: [card.noteId],
		references: [note.id]
	}),
	review: many(review),
	score: many(score)
}));

export const notesRelations = relations(note, ({ many }) => ({
	card: many(card)
}));

export const reviewRelations = relations(review, ({ one }) => ({
	card: one(card, {
		fields: [review.cardId],
		references: [card.id]
	})
}));

export const scoreRelations = relations(score, ({ one }) => ({
	card: one(card, {
		fields: [score.cardId],
		references: [card.id]
	})
}));
