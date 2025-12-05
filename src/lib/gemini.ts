// Determine API endpoint based on environment
const getApiEndpoint = () => {
	// Always use local SvelteKit API routes
	// Note: With adapter-static, these won't work. We need Cloud Functions to be public.
	// For now, always try Cloud Functions in production
	if (import.meta.env.PROD) {
		const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demetria-b7ee8';
		return `https://europe-west1-${projectId}.cloudfunctions.net/geminiChatV2`;
	}
	return '/api/gemini';
};

const getModelsEndpoint = () => {
	if (import.meta.env.PROD) {
		const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demetria-b7ee8';
		return `https://europe-west1-${projectId}.cloudfunctions.net/geminiModelsV2`;
	}
	return '/api/gemini/models';
};

/**
 * Send a prompt to Gemini AI via the server API or Cloud Function
 */
export async function sendPromptToGemini(prompt: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> {
	try {
		const endpoint = getApiEndpoint();
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt, model })
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Failed to get response from Gemini');
		}

		return data.text;
	} catch (error) {
		console.error('Error calling Gemini API:', error);
		throw error;
	}
}

/**
 * Get list of available Gemini models
 */
export async function getGeminiModels() {
	try {
		const endpoint = getModelsEndpoint();
		const response = await fetch(endpoint);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Failed to get models');
		}

		return data.models;
	} catch (error) {
		console.error('Error fetching Gemini models:', error);
		throw error;
	}
}

/**
 * Send a prompt with streaming response (for longer responses)
 */
export async function sendPromptToGeminiStream(
	prompt: string, 
	onChunk: (text: string) => void,
	model: string = 'gemini-2.5-pro'
): Promise<void> {
	try {
		const response = await fetch('/api/gemini/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt, model })
		});

		if (!response.ok) {
			throw new Error('Failed to get response from Gemini');
		}

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) {
			throw new Error('No response body');
		}

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			
			const chunk = decoder.decode(value);
			onChunk(chunk);
		}
	} catch (error) {
		console.error('Error calling Gemini API:', error);
		throw error;
	}
}
