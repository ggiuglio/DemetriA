/**
 * Send a prompt to Gemini AI via the server API
 */
export async function sendPromptToGemini(prompt: string, model: string = 'gemini-2.5-pro'): Promise<string> {
	try {
		const response = await fetch('/api/gemini', {
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
