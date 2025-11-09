import { env } from '$env/dynamic/private';

const url = env.LOCAL_AI_HTTP_URL;
const IDENTIFIER = env.MODEL_NAME;

export async function postMessage(content: string | null) {
	if (!content) {
		return;
	}
	const response = await fetch(`${url}/v1/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer lm-studio'
		},
		body: JSON.stringify({
			model: IDENTIFIER,
			messages: [
				{
					role: 'user',
					content: content
				}
			]
		})
	});

	const data = await response.json();
	return data.choices[0].message.content;
}
