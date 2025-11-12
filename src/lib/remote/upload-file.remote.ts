import { command } from '$app/server';
import { db } from '$lib/server/db';
import { note, card, review, score } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod/v4';

export const checkFile = command(
	z.object({ notes: z.string() }),
	async ({ notes }: { notes: string }) => {
		const parsedNotes = JSON.parse(notes);
		const checkedNotes: { name: string; uploaded: boolean }[] = [];
		for (const noteData of parsedNotes) {
			const query = await db.select().from(note).where(eq(note.name, noteData.name)).limit(1);
			checkedNotes.push({ name: noteData.name, uploaded: query.length > 0 });
		}
		return checkedNotes;
	}
);
export const uploadFile = command(
	z.object({ notes: z.string() }),

	async ({ notes }: { notes: string }) => {
		const ids: { id: string }[] = [];

		try {
			const parsedNotes: {
				upload: boolean;
				content: string;
				name: string;
				update: boolean;
			}[] = JSON.parse(notes);

			console.log('Uploading notes:', parsedNotes.length);
			for (const noteData of parsedNotes) {
				console.log(
					`Processing note: ${noteData.name}, update: ${noteData.update}, upload: ${noteData.upload}`
				);
				if (noteData.update) {
					const existingNote = await db
						.select({ id: note.id })
						.from(note)
						.where(eq(note.name, noteData.name))
						.limit(1);

					if (existingNote.length > 0) {
						console.log(`Deleting cards for note ${existingNote[0].id}`);
						const cardsToDelete = await db
							.select({ id: card.id })
							.from(card)
							.where(eq(card.noteId, existingNote[0].id));

						if (cardsToDelete.length > 0) {
							const cardIds = cardsToDelete.map((c) => c.id);
							console.log(
								`Deleting ${cardIds.length} cards, ${cardIds.length} reviews, ${cardIds.length} scores`
							);
							await db.delete(score).where(inArray(score.cardId, cardIds));
							await db.delete(review).where(inArray(review.cardId, cardIds));
							await db.delete(card).where(eq(card.noteId, existingNote[0].id));
						}
					}
				}

				const id = await db
					.insert(note)
					.values({
						name: noteData.name,
						content: noteData.content
					})
					.onConflictDoUpdate({
						target: [note.name],
						set: {
							content: noteData.content
						}
					})
					.returning({ id: note.id });
				console.log(`Note ${noteData.name} has ID: ${id[0].id}`);
				ids.push(id[0]);
			}

			console.log('Returning note IDs:', ids);
			return { success: true, data: ids };
		} catch (error) {
			if (error instanceof Error) {
				console.log(error);
				return { success: false, error: error.message };
			}
		}
	}
);
