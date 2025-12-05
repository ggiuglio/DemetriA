const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with API key from Firebase config
const getGenAI = () => {
  const apiKey = functions.config().gemini?.api_key;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Run: firebase functions:config:set gemini.api_key="YOUR_KEY"');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Gemini Chat Endpoint
 * POST /geminiChat
 * Body: { prompt: string, model?: string }
 */
exports.geminiChatV2 = functions.region('europe-west1').https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { prompt, model = 'gemini-2.0-flash-exp' } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const genAI = getGenAI();
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { 
        maxOutputTokens: 2048 
      }
    });

    console.log(`Generating content with model: ${model}`);
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      success: true, 
      text, 
      model 
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

/**
 * Gemini Models List Endpoint
 * GET /geminiModels
 */
exports.geminiModelsV2 = functions.region('europe-west1').https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const genAI = getGenAI();
    const models = await genAI.listModels();
    
    res.json({ 
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
    res.status(500).json({ 
      error: 'Failed to list models',
      details: error.message 
    });
  }
});
