<script>
    let messages = [
        { role: 'assistant', content: 'Hello! I\'m DemetriA IQ, your agricultural AI assistant. Ask me anything about farming, crops, soil management, pest control, or any agricultural topic!' }
    ];
    let userInput = '';
    let isLoading = false;
    
    // Mock AI responses - in real app this would call an AI API
    const mockResponses = {
        'wheat': 'Wheat is best planted in fall or early spring depending on your climate. It requires well-drained soil with a pH of 6.0-7.0. Make sure to rotate crops to prevent disease buildup.',
        'fertilizer': 'For optimal results, use nitrogen-rich fertilizers during the vegetative stage. Consider organic options like compost or manure. Soil testing will help determine exact nutrient needs.',
        'pest': 'Integrated Pest Management (IPM) is recommended. Start with monitoring, use natural predators when possible, and only resort to pesticides when necessary. Regular field inspections are key.',
        'irrigation': 'Drip irrigation is most water-efficient. Water early morning or evening to reduce evaporation. Monitor soil moisture levels and adjust based on weather conditions.',
        'soil': 'Healthy soil is the foundation of good farming. Test pH levels regularly, add organic matter, practice crop rotation, and avoid over-tilling to maintain soil structure.',
        'default': 'That\'s a great question! Based on agricultural best practices, I recommend consulting with local agricultural extension services for region-specific advice. Would you like me to provide more general information on this topic?'
    };
    
    function getAIResponse(question) {
        const lowerQuestion = question.toLowerCase();
        for (const [key, response] of Object.entries(mockResponses)) {
            if (lowerQuestion.includes(key)) {
                return response;
            }
        }
        return mockResponses.default;
    }
    
    async function sendMessage() {
        if (!userInput.trim() || isLoading) return;
        
        // Add user message
        messages = [...messages, { role: 'user', content: userInput }];
        const question = userInput;
        userInput = '';
        isLoading = true;
        
        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add AI response
        const response = getAIResponse(question);
        messages = [...messages, { role: 'assistant', content: response }];
        isLoading = false;
        
        // Scroll to bottom
        setTimeout(() => {
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
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
            <p class="text-lg text-[#666] mt-2">Your AI-powered agricultural assistant</p>
        </div>
        <a href="/iq/history" class="sketch-button bg-[#fff8e1] text-[#f57c00] px-5 py-3 font-bold hover:bg-[#ffecb3]">
            📜 View History
        </a>
    </div>

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
