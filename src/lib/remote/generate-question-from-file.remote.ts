import { command } from '$app/server';
import { db } from '$lib/server/db';
import { card, note, review } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { postMessage } from '$lib/server/ai/parse-questions';

import { z } from 'zod/v4';

export type Questions = {
	noteId: string;
	question: number;
	front: string;
	back: string;
	type: string;
	options: Array<{ option: string; value: string }>;
};

const idsArraySchema = z.preprocess(
	(val) => {
		if (typeof val === 'string') {
			try {
				return JSON.parse(val);
			} catch {
				return val;
			}
		}
		return val;
	},
	z.array(z.object({ id: z.string() }))
);
export const generateQuestions = command(idsArraySchema, async (ids) => {
	const questions: Questions[] = [];
	const idsParsed = idsArraySchema.parse(ids).map((idobj) => idobj.id);
	const notes: { notename: string; content: string | null; id: string }[] = await db
		.select({ notename: note.name, content: note.content, id: note.id })
		.from(note)
		.where(inArray(note.id, idsParsed));
	for (let i = 0; i < notes.length; i++) {
		console.log(`loading note ${i + 1} ...`);
		try {
			const questionsRaw: Omit<Questions, 'noteId'>[] = JSON.parse(
				await postMessage(notes[i].content)
			);
			questions.push(
				...questionsRaw.map((question) => {
					return {
						noteId: notes[i].id,
						question: question.question,
						front: question.front,
						back: question.back,
						type: question.type,
						options: question.options
					};
				})
			);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err);
				return JSON.stringify({ success: false, message: JSON.stringify(err) });
			}
		}
	}

	questions.forEach(async (note) => {
		try {
			const ids = await db.insert(card).values(note).returning({ id: card.id });
			const mapped = ids.map((id) => {
				return {
					cardId: id.id
				};
			});
			await db.insert(review).values(mapped);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err);
				return JSON.stringify({ success: false, error: JSON.stringify(err) });
			}
		}
	});

	console.log('success');

	return JSON.stringify({ success: true, data: questions });
});
