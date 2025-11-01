<script>
    import { getRecentChatSessions } from '$lib/chatHistory';
    import { onMount } from 'svelte';
    
    let chatSessions = [];
    let expandedSession = null;
    let isLoading = true;
    let error = '';
    
    // Load chat sessions from Firebase
    onMount(async () => {
        try {
            const sessions = await getRecentChatSessions(50); // Get last 50 sessions
            chatSessions = sessions.map(session => {
                const date = session.createdAt?.toDate ? session.createdAt.toDate() : new Date();
                return {
                    id: session.id,
                    date: date.toLocaleDateString(),
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    messages: session.messages || [],
                    messageCount: session.messages?.length || 0
                };
            });
        } catch (e) {
            console.error('Failed to load chat history:', e);
            error = 'Failed to load chat history. Make sure Firebase is configured.';
        } finally {
            isLoading = false;
        }
    });
    
    function toggleSession(id) {
        expandedSession = expandedSession === id ? null : id;
    }
</script>

<div class="max-w-5xl">
    <div class="mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">Chat History</h2>
        <p class="text-lg text-[#666] mt-2">Review your previous conversations with DemetriA IQ</p>
    </div>

    <!-- Loading State -->
    {#if isLoading}
        <div class="sketch-box p-8 bg-white text-center">
            <div class="flex items-center justify-center gap-3">
                <div class="w-3 h-3 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-3 h-3 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-3 h-3 bg-[#2e7d32] rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>
            <p class="text-[#666] mt-4">Loading chat history...</p>
        </div>
    {:else if error}
        <!-- Error State -->
        <div class="sketch-box p-6 bg-[#ffebee] border-[#c62828]">
            <p class="text-[#c62828] font-bold">❌ {error}</p>
            <p class="text-sm text-[#c62828] mt-2">Make sure Firebase is configured in your .env file.</p>
        </div>
    {:else if chatSessions.length === 0}
        <!-- Empty State -->
        <div class="sketch-box p-8 bg-white text-center">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-xl font-bold text-[#333] mb-2">No Chat History Yet</h3>
            <p class="text-[#666] mb-6">Start a conversation with DemetriA IQ to see your history here.</p>
            <a href="/iq" class="sketch-button bg-[#2e7d32] text-white px-6 py-3 font-bold hover:bg-[#1b5e20] inline-block">
                Start Chatting
            </a>
        </div>
    {:else}
        <!-- Chat Sessions -->
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
                                <h3 class="font-bold text-[#333]">Chat Session</h3>
                                <p class="text-sm text-[#666]">{session.date} at {session.time}</p>
                                <p class="text-xs text-[#999] mt-1">{session.messageCount} message{session.messageCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div class="text-2xl transform transition-transform {expandedSession === session.id ? 'rotate-180' : ''}">
                            ▼
                        </div>
                    </button>

                    {#if expandedSession === session.id}
                        <div class="mt-4 space-y-4 border-t-2 border-[#333] pt-4" style="border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;">
                            {#each session.messages as message}
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
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <div class="mt-6 text-center">
        <a href="/iq" class="sketch-button bg-[#2e7d32] text-white px-6 py-3 font-bold hover:bg-[#1b5e20] inline-block">
            ← Back to Chat
        </a>
    </div>
</div>
