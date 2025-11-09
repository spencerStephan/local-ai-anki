import { command } from '$app/server';
import { db } from '$lib/server/db';
import { review, score } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import z from 'zod/v4';

const reviewSchema = z.object({
	id: z.string(),
	cardId: z.string(),
	lastReview: z.number(),
	nextReview: z.number(),
	scoreValue: z.boolean(),
	difficulty: z.number()
});

export const updateReviews = command(
	reviewSchema,
	async ({ id, lastReview, nextReview, scoreValue, cardId, difficulty }) => {
		try {
			await db
				.update(review)
				.set({
					lastReview: lastReview,
					nextReview: nextReview
				})
				.where(eq(review.id, id));

			await db.insert(score).values({
				cardId: cardId,
				score: scoreValue,
				difficulty: difficulty
			});

			return { success: true };
		} catch (err) {
			if (err instanceof Error) {
				return { success: false, error: err };
			}
		}
	}
);
