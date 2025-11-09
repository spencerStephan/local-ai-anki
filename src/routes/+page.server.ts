import { db } from '$lib/server/db';

export const load = async () => {
	const reviews = await db.query.review.findMany({
		columns: {
			id: true,
			nextReview: true,
			lastReview: true
		},
		with: {
			card: {
				columns: {
					front: true
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

	const reviewsToReturn = reviews.map((review) => {
		return {
			id: review.id,
			noteName: review.card.note.name,
			question: review.card.front,
			lastReview: review.lastReview,
			nextReview: review.nextReview
		};
	});

	return {
		reviews: reviewsToReturn
	};
};
