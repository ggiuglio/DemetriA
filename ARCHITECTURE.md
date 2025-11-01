# DemetriA IQ - Gemini AI Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│                  /src/routes/iq/+page.svelte                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  User types question                             │      │
│  │  "How do I improve soil quality?"                │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────┐      │
│  │  sendMessage() function                          │      │
│  │  - Adds user message to chat                     │      │
│  │  - Builds conversation context                   │      │
│  │  - Includes system prompt                        │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ import { sendPromptToGemini }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Helper Function                           │
│                  /src/lib/gemini.ts                         │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  sendPromptToGemini(prompt)                      │      │
│  │  - Makes POST request to /api/gemini             │      │
│  │  - Handles errors                                │      │
│  │  - Returns response text                         │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ POST /api/gemini
                     │ { prompt: "..." }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server API Route                          │
│            /src/routes/api/gemini/+server.ts                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  POST handler                                    │      │
│  │  - Receives prompt from client                   │      │
│  │  - Gets GEMINI_API_KEY from env                  │      │
│  │  - Initializes GoogleGenerativeAI                │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ API Call
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API                         │
│                  (External Service)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Gemini Pro Model                                │      │
│  │  - Processes agricultural question               │      │
│  │  - Generates expert response                     │      │
│  │  - Returns AI-generated text                     │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Response
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server Response                           │
│            /src/routes/api/gemini/+server.ts                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Return JSON                                     │      │
│  │  { success: true, text: "...", model: "..." }   │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ JSON Response
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Client Receives                           │
│                  /src/lib/gemini.ts                         │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Parse response                                  │      │
│  │  Extract text                                    │      │
│  │  Return to component                             │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Response text
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Update UI                                 │
│                  /src/routes/iq/+page.svelte                │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Add AI message to chat                          │      │
│  │  Display response to user                        │      │
│  │  Scroll to bottom                                │      │
│  │  Hide loading indicator                          │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Request
```javascript
User Input → Component → Helper → API Route → Gemini API
```

### Response
```javascript
Gemini API → API Route → Helper → Component → UI Update
```

## Key Components

### 1. Frontend (`+page.svelte`)
- **Responsibility**: User interface and interaction
- **Features**:
  - Message display
  - Input handling
  - Loading states
  - Error display
  - Suggested questions

### 2. Helper (`gemini.ts`)
- **Responsibility**: Client-side API communication
- **Features**:
  - Fetch API wrapper
  - Error handling
  - Response parsing

### 3. API Route (`+server.ts`)
- **Responsibility**: Server-side Gemini integration
- **Features**:
  - Secure API key handling
  - Gemini SDK initialization
  - Request/response processing

### 4. Environment (`.env`)
- **Responsibility**: Configuration
- **Contains**:
  - `GEMINI_API_KEY`

## Security Model

```
┌─────────────┐
│   Browser   │  ← No API key here (secure!)
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Server    │  ← API key stored here (secure!)
└──────┬──────┘
       │ HTTPS + API Key
       ▼
┌─────────────┐
│   Gemini    │
└─────────────┘
```

## Conversation Context

The system maintains context by sending recent messages:

```javascript
// Last 6 messages (3 exchanges)
messages.slice(-6)

// Formatted as:
"User: How do I plant wheat?
Assistant: Wheat is best planted...
User: What about soil?
Assistant: For wheat, you need..."
```

## System Prompt

Every request includes this context:

```
You are DemetriA IQ, an expert agricultural AI assistant.
You provide practical, science-based advice on:
- Crop cultivation and management
- Soil health and fertilization
- Pest and disease control
- Irrigation and water management
- Sustainable farming practices
- Agricultural technology

Provide clear, actionable advice. Keep responses concise
(2-4 paragraphs) unless asked for more detail.
```

## Error Handling

```
Try to send message
  ↓
Success? → Display response
  ↓
Error? → Log to console
       → Show error to user
       → Add error message to chat
```

## File Structure

```
DemetriA/
├── .env                              # API key (not in git)
├── .env.example                      # Template
├── src/
│   ├── lib/
│   │   ├── gemini.ts                # Helper functions
│   │   └── examples/
│   │       └── GeminiExample.svelte # Usage example
│   └── routes/
│       ├── iq/
│       │   └── +page.svelte         # Chat UI (modified)
│       └── api/
│           └── gemini/
│               └── +server.ts       # API endpoint
├── GEMINI_SETUP.md                  # Setup guide
├── INTEGRATION_SUMMARY.md           # What changed
├── README_GEMINI.md                 # Quick start
├── ARCHITECTURE.md                  # This file
└── setup-gemini.sh                  # Setup script
```

## Performance Considerations

- **Request Time**: 1-3 seconds typical
- **Context Size**: Limited to last 6 messages
- **Rate Limits**: 60 requests/minute (free tier)
- **Token Limits**: ~30k tokens per request

## Future Enhancements

### Streaming Responses
```javascript
// Instead of waiting for full response
const stream = await geminiModel.generateContentStream(prompt);
for await (const chunk of stream) {
  // Display text as it arrives
}
```

### Image Analysis
```javascript
// Gemini Pro Vision for crop disease detection
const result = await model.generateContent([
  'What disease does this plant have?',
  { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
]);
```

### Conversation Persistence
```javascript
// Save to database
await db.conversations.create({
  userId,
  messages,
  timestamp
});
```
