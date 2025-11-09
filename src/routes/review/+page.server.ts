import { db } from '$lib/server/db';

export const load = async () => {
	const currentTime = Math.floor(Date.now() / 1000);

	const questions = await db.query.review.findMany({
		where: (review, { lt }) => lt(review.nextReview, currentTime),
		columns: {
			lastReview: true,
			id: true
		},
		with: {
			card: {
				columns: {
					id: true,
					front: true,
					back: true,
					options: true
				},
				with: {
					note: {
						columns: {
							name: true
						}
					}
				}
			}
		}
	});

	const questionsToReturn = questions.map((q) => {
		return {
			id: q.id,
			cardId: q.card.id,
			noteName: q.card.note.name,
			question: q.card.front,
			options: q.card.options! as { option: string; value: string }[],
			answer: q.card.back!,
			lastReview: q.lastReview!
		};
	});

	return {
		questions: questionsToReturn
	};
};
