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
	console.log('Generating questions for note IDs:', idsParsed);
	const notes: { notename: string; content: string | null; id: string }[] = await db
		.select({ notename: note.name, content: note.content, id: note.id })
		.from(note)
		.where(inArray(note.id, idsParsed));
	console.log('Found notes:', notes.length);
	if (notes.length === 0) {
		return { success: false, message: 'No notes found for the provided IDs' };
	}
	for (let i = 0; i < notes.length; i++) {
		console.log(`loading note ${i + 1} ...`);
		if (!notes[i].content) {
			console.log(`Note ${notes[i].id} has no content, skipping`);
			continue;
		}
		let aiResponse: string | undefined;
		try {
			aiResponse = await postMessage(notes[i].content);
			if (!aiResponse) {
				console.error(`No response from AI for note ${notes[i].id}`);
				continue;
			}
			console.log(
				`AI response for note ${notes[i].id} (first 200 chars):`,
				aiResponse.substring(0, 200)
			);

			let cleanedResponse = aiResponse.trim();
			if (cleanedResponse.startsWith('```json')) {
				cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
			} else if (cleanedResponse.startsWith('```')) {
				cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
			}

			const questionsRaw: Omit<Questions, 'noteId'>[] = JSON.parse(cleanedResponse);
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
				console.error(`Error generating questions for note ${notes[i].id}:`, err);
				console.error(`Note name: ${notes[i].notename}`);
				if (aiResponse) {
					console.error(`Raw AI response (full):`, aiResponse);
				}
			}
		}
	}
	console.log(`Generated ${questions.length} questions`);

	console.log(`Inserting ${questions.length} questions into database`);
	for (const question of questions) {
		try {
			const ids = await db.insert(card).values(question).returning({ id: card.id });
			const mapped = ids.map((id) => {
				return {
					cardId: id.id
				};
			});
			await db.insert(review).values(mapped);
		} catch (err) {
			if (err instanceof Error) {
				console.error('Error inserting question:', err);
				console.error('Question data:', question);
				return { success: false, error: JSON.stringify(err) };
			}
		}
	}

	console.log('done');
	return { success: true, data: questions };
});
