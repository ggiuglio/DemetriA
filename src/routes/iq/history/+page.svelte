<script>
    // Mock chat history - in real app this would come from a database
    const chatSessions = [
        {
            id: 1,
            date: '2025-10-12',
            time: '14:30',
            questions: [
                { q: 'How do I improve soil quality?', a: 'Healthy soil is the foundation of good farming. Test pH levels regularly, add organic matter, practice crop rotation, and avoid over-tilling to maintain soil structure.' },
                { q: 'What fertilizer should I use for wheat?', a: 'For optimal results, use nitrogen-rich fertilizers during the vegetative stage. Consider organic options like compost or manure. Soil testing will help determine exact nutrient needs.' }
            ]
        },
        {
            id: 2,
            date: '2025-10-11',
            time: '09:15',
            questions: [
                { q: 'When is the best time to plant corn?', a: 'Corn is best planted when soil temperature reaches 50-55°F (10-13°C). This is typically late spring. Ensure frost danger has passed and soil is workable.' },
                { q: 'How can I control pests naturally?', a: 'Integrated Pest Management (IPM) is recommended. Start with monitoring, use natural predators when possible, and only resort to pesticides when necessary. Regular field inspections are key.' }
            ]
        },
        {
            id: 3,
            date: '2025-10-10',
            time: '16:45',
            questions: [
                { q: 'What irrigation method is most efficient?', a: 'Drip irrigation is most water-efficient. Water early morning or evening to reduce evaporation. Monitor soil moisture levels and adjust based on weather conditions.' }
            ]
        },
        {
            id: 4,
            date: '2025-10-09',
            time: '11:20',
            questions: [
                { q: 'How often should I rotate crops?', a: 'Crop rotation should typically occur every 2-4 years depending on the crops. This helps prevent soil depletion, reduces pest and disease buildup, and improves soil health.' },
                { q: 'What are signs of nitrogen deficiency?', a: 'Signs include yellowing of older leaves (chlorosis), stunted growth, and pale green color overall. Address with nitrogen-rich fertilizers or organic amendments.' }
            ]
        }
    ];
    
    let expandedSession = null;
    
    function toggleSession(id) {
        expandedSession = expandedSession === id ? null : id;
    }
</script>

<div class="max-w-5xl">
    <div class="mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">Chat History</h2>
        <p class="text-lg text-[#666] mt-2">Review your previous conversations with DemetriA IQ</p>
    </div>

    <div class="space-y-4">
        {#each chatSessions as session}
            <div class="sketch-box p-5 bg-white">
                <button
                    on:click={() => toggleSession(session.id)}
                    class="w-full flex items-center justify-between hover:bg-[#f1f8e9] transition-colors p-2 rounded"
                >
                    <div class="flex items-center gap-4">
                        <div class="text-3xl">💬</div>
                        <div class="text-left">
                            <h3 class="font-bold text-[#333]">Session {session.id}</h3>
                            <p class="text-sm text-[#666]">{session.date} at {session.time}</p>
                            <p class="text-xs text-[#999] mt-1">{session.questions.length} question{session.questions.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div class="text-2xl transform transition-transform {expandedSession === session.id ? 'rotate-180' : ''}">
                        ▼
                    </div>
                </button>

                {#if expandedSession === session.id}
                    <div class="mt-4 space-y-4 border-t-2 border-[#333] pt-4" style="border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;">
                        {#each session.questions as qa, index}
                            <div class="space-y-2">
                                <!-- Question -->
                                <div class="flex justify-end">
                                    <div class="max-w-[80%] bg-[#a5d6a7] text-[#1b5e20] rounded-lg p-4 sketch-box">
                                        <div class="flex items-start gap-2 mb-1">
                                            <span class="text-lg">👤</span>
                                            <span class="font-bold text-sm">You</span>
                                        </div>
                                        <p class="text-sm leading-relaxed">{qa.q}</p>
                                    </div>
                                </div>

                                <!-- Answer -->
                                <div class="flex justify-start">
                                    <div class="max-w-[80%] bg-[#f5f5f5] text-[#333] rounded-lg p-4 sketch-box">
                                        <div class="flex items-start gap-2 mb-1">
                                            <span class="text-lg">🤖</span>
                                            <span class="font-bold text-sm">DemetriA IQ</span>
                                        </div>
                                        <p class="text-sm leading-relaxed">{qa.a}</p>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <div class="mt-6 text-center">
        <a href="/iq" class="sketch-button bg-[#2e7d32] text-white px-6 py-3 font-bold hover:bg-[#1b5e20] inline-block">
            ← Back to Chat
        </a>
    </div>
</div>
