<script lang="ts">
	import { sendPromptToGemini } from '$lib/gemini';

	let prompt = '';
	let response = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		if (!prompt.trim()) return;

		loading = true;
		error = '';
		response = '';

		try {
			const result = await sendPromptToGemini(prompt);
			response = result;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	// Example: Get AI recommendations for a field
	async function getFieldRecommendations(soilType: string, crop: string) {
		const fieldPrompt = `As an agricultural expert, provide recommendations for growing ${crop} in ${soilType} soil. Include:
1. Best practices for soil preparation
2. Optimal planting schedule
3. Irrigation requirements
4. Common pests and diseases to watch for
5. Expected yield per hectare

Keep the response concise and practical.`;

		loading = true;
		try {
			const result = await sendPromptToGemini(fieldPrompt);
			response = result;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="sketch-box p-6 bg-white max-w-2xl">
	<h3 class="text-2xl font-bold text-[#2e7d32] mb-4">🤖 Ask Gemini AI</h3>

	<div class="space-y-4">
		<div>
			<label class="block text-sm font-semibold text-[#555] mb-2">
				Your Question
			</label>
			<textarea
				bind:value={prompt}
				placeholder="Ask anything about agriculture, crops, or farming..."
				class="sketch-box w-full px-4 py-3 bg-[#faf9f6] text-[#333] min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
				disabled={loading}
			></textarea>
		</div>

		<button
			on:click={handleSubmit}
			disabled={loading || !prompt.trim()}
			class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-semibold hover:bg-[#81c784] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? '🔄 Thinking...' : '✨ Ask Gemini'}
		</button>

		<!-- Quick Examples -->
		<div class="flex gap-2 flex-wrap">
			<button
				on:click={() => getFieldRecommendations('Loamy', 'Wheat')}
				disabled={loading}
				class="sketch-button bg-[#fff8e1] text-[#f57c00] px-3 py-2 text-sm hover:bg-[#ffecb3] disabled:opacity-50"
			>
				💡 Wheat in Loamy Soil
			</button>
			<button
				on:click={() => getFieldRecommendations('Clay', 'Rice')}
				disabled={loading}
				class="sketch-button bg-[#e1f5fe] text-[#0277bd] px-3 py-2 text-sm hover:bg-[#b3e5fc] disabled:opacity-50"
			>
				💡 Rice in Clay Soil
			</button>
		</div>

		{#if error}
			<div class="sketch-box p-4 bg-[#ffebee] border-[#c62828]">
				<p class="text-[#c62828] font-semibold">❌ Error: {error}</p>
			</div>
		{/if}

		{#if response}
			<div class="sketch-box p-4 bg-[#e8f5e9]">
				<h4 class="font-bold text-[#2e7d32] mb-2">📝 Response:</h4>
				<div class="text-[#333] whitespace-pre-wrap">{response}</div>
			</div>
		{/if}
	</div>
</div>
