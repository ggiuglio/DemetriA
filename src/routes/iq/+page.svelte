<script>
    import { sendPromptToGemini } from '$lib/gemini';
    import { saveChatHistory } from '$lib/chatHistory';
    
    let messages = [
        { role: 'assistant', content: 'Hello! I\'m DemetriA IQ, your agricultural AI assistant powered by Gemini. Ask me anything about farming, crops, soil management, pest control, or any agricultural topic!' }
    ];
    let userInput = '';
    let isLoading = false;
    let error = '';
    let currentSessionId = null; // Current chat session ID
    let isSaving = false;
    
    // Each page load starts a fresh chat
    // All chats are saved to Firebase and accessible from /iq/history
    
    // Save chat history to Firebase
    async function saveHistory() {
        if (isSaving) return; // Prevent concurrent saves
        
        // Only save if there are actual user messages (not just the welcome message)
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (!hasUserMessages) {
            return;
        }
        
        try {
            isSaving = true;
            currentSessionId = await saveChatHistory(messages, currentSessionId);
        } catch (e) {
            console.error('Failed to save chat history:', e);
            error = 'Failed to save chat history';
        } finally {
            isSaving = false;
        }
    }
    
    // Start a new chat (saves current one first)
    async function startNewChat() {
        if (confirm('Start a new chat? Your current conversation will be saved to history.')) {
            // Save current chat if it has messages
            await saveHistory();
            
            // Reset to fresh chat
            messages = [
                { role: 'assistant', content: 'Hello! I\'m DemetriA IQ, your agricultural AI assistant powered by Gemini. Ask me anything about farming, crops, soil management, pest control, or any agricultural topic!' }
            ];
            currentSessionId = null;
        }
    }
    
    // System prompt to guide Gemini's responses
    const systemContext = `You are DemetriA IQ, an expert agricultural AI assistant. You provide practical, science-based advice on:
- Crop cultivation and management
- Soil health and fertilization
- Pest and disease control
- Irrigation and water management
- Sustainable farming practices
- Agricultural technology

Provide clear, actionable advice. Keep responses concise (2-4 paragraphs) unless asked for more detail. Use a friendly, professional tone.`;
    
    async function sendMessage() {
        if (!userInput.trim() || isLoading) return;
        
        // Add user message
        messages = [...messages, { role: 'user', content: userInput }];
        const question = userInput;
        userInput = '';
        isLoading = true;
        error = '';
        
        try {
            // Build conversation context for Gemini
            const conversationHistory = messages
                .slice(-6) // Last 3 exchanges to keep context manageable
                .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                .join('\n\n');
            
            const fullPrompt = `${systemContext}\n\nConversation history:\n${conversationHistory}\n\nUser: ${question}\n\nAssistant:`;
            
            // Call Gemini API
            const response = await sendPromptToGemini(fullPrompt);
            
            // Add AI response
            messages = [...messages, { role: 'assistant', content: response }];
            await saveHistory(); // Save after successful response
        } catch (err) {
            console.error('Error getting AI response:', err);
            error = err instanceof Error ? err.message : 'Failed to get response';
            
            // Add error message to chat
            messages = [...messages, { 
                role: 'assistant', 
                content: '❌ Sorry, I encountered an error. Please make sure the Gemini API is configured correctly and try again.' 
            }];
            await saveHistory(); // Save even on error
        } finally {
            isLoading = false;
            
            // Scroll to bottom
            setTimeout(() => {
                const chatContainer = document.getElementById('chat-container');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 100);
        }
    }
    
    function handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
    
    // Suggested questions
    const suggestedQuestions = [
        'How do I improve soil quality?',
        'What\'s the best time to plant wheat?',
        'How can I control pests naturally?',
        'What irrigation method should I use?',
        'How often should I fertilize my crops?'
    ];
    
    function askSuggested(question) {
        userInput = question;
        sendMessage();
    }
</script>

<div class="max-w-5xl">
    <div class="mb-6 flex justify-between items-start">
        <div>
            <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">DemetriA IQ</h2>
            <p class="text-lg text-[#666] mt-2">
                Your AI-powered agricultural assistant
                {#if isSaving}
                    <span class="text-sm text-[#2e7d32] ml-2">💾 Saving...</span>
                {/if}
            </p>
        </div>
        <div class="flex gap-2">
            <button 
                on:click={startNewChat}
                class="sketch-button bg-[#e3f2fd] text-[#1565c0] px-5 py-3 font-bold hover:bg-[#bbdefb]"
                title="Start a new chat conversation"
            >
                ✨ New Chat
            </button>
            <a href="/iq/history" class="sketch-button bg-[#fff8e1] text-[#f57c00] px-5 py-3 font-bold hover:bg-[#ffecb3]">
                📜 View History
            </a>
        </div>
    </div>

    <!-- Error notification -->
    {#if error}
        <div class="mb-4 sketch-box p-4 bg-[#ffebee] border-[#c62828]">
            <div class="flex items-center gap-2">
                <span class="text-xl">⚠️</span>
                <div class="flex-1">
                    <p class="font-bold text-[#c62828]">Error</p>
                    <p class="text-sm text-[#c62828]">{error}</p>
                </div>
                <button 
                    on:click={() => error = ''}
                    class="text-[#c62828] hover:text-[#b71c1c] font-bold"
                >
                    ✕
                </button>
            </div>
        </div>
    {/if}

    <!-- Suggested Questions (show when chat is empty) -->
    {#if messages.length === 1}
        <div class="mb-6 sketch-box p-6 bg-[#e8f5e9]">
            <h3 class="text-lg font-bold text-[#2e7d32] mb-3">💡 Try asking:</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each suggestedQuestions as question}
                    <button
                        on:click={() => askSuggested(question)}
                        class="sketch-button bg-white text-[#2e7d32] px-4 py-3 text-left text-sm hover:bg-[#c8e6c9] transition-colors"
                        disabled={isLoading}
                    >
                        {question}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Chat Area -->
    <div>
            <div class="sketch-box p-6 bg-white" style="height: 700px; display: flex; flex-direction: column;">
                <!-- Chat Messages -->
                <div id="chat-container" class="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                    {#each messages as message}
                        <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                            <div class="max-w-[80%] {message.role === 'user' ? 'bg-[#a5d6a7] text-[#1b5e20]' : 'bg-[#f5f5f5] text-[#333]'} rounded-lg p-4 sketch-box">
                                <div class="flex items-start gap-2 mb-1">
                                    <span class="text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                                    <span class="font-bold text-sm">{message.role === 'user' ? 'You' : 'DemetriA IQ'}</span>
                                </div>
                                <p class="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    {/each}
                    
                    {#if isLoading}
                        <div class="flex justify-start">
                            <div class="bg-[#f5f5f5] rounded-lg p-4 sketch-box">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg">🤖</span>
                                    <span class="text-sm text-[#666]">Thinking...</span>
                                    <div class="flex gap-1">
                                        <div class="w-2 h-2 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                                        <div class="w-2 h-2 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                                        <div class="w-2 h-2 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Input Area -->
                <div class="border-t-2 border-[#333] pt-4" style="border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;">
                    <div class="flex gap-2">
                        <textarea
                            bind:value={userInput}
                            on:keypress={handleKeyPress}
                            placeholder="Ask me anything about agriculture..."
                            class="flex-1 p-3 border-2 border-[#333] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                            rows="2"
                            disabled={isLoading}
                        ></textarea>
                        <button
                            on:click={sendMessage}
                            disabled={!userInput.trim() || isLoading}
                            class="sketch-button bg-[#2e7d32] text-white px-6 py-3 font-bold hover:bg-[#1b5e20] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                    <p class="text-xs text-[#666] mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
            </div>
    </div>
</div>

<style>
    /* Custom scrollbar for chat */
    #chat-container::-webkit-scrollbar {
        width: 8px;
    }
    
    #chat-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    #chat-container::-webkit-scrollbar-thumb {
        background: #2e7d32;
        border-radius: 4px;
    }
    
    #chat-container::-webkit-scrollbar-thumb:hover {
        background: #1b5e20;
    }
</style>
