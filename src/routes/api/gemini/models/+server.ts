import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const GET: RequestHandler = async () => {
	try {
		// List available models
		const models = await genAI.listModels();
		
		return json({ 
			success: true,
			models: models.map(m => ({
				name: m.name,
				displayName: m.displayName,
				description: m.description,
				supportedMethods: m.supportedGenerationMethods
			}))
		});
	} catch (error) {
		console.error('Error listing models:', error);
		return json({ 
			error: 'Failed to list models',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
