import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { prompt, model = 'gemini-2.5-pro' } = await request.json();

		if (!prompt) {
			return json({ error: 'Prompt is required' }, { status: 400 });
		}

		// Get the generative model
		const geminiModel = genAI.getGenerativeModel({ 
			model,
			generationConfig: {
				maxOutputTokens: 2048,
			}
		});

		// Generate content
		const result = await geminiModel.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		return json({ 
			success: true, 
			text,
			model 
		});

	} catch (error) {
		console.error('Gemini API Error:', error);
		return json({ 
			error: 'Failed to generate response',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
