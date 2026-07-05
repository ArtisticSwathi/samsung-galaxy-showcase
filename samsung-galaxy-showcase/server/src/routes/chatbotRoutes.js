const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');

/**
 * Build a rich, structured system prompt from the live product catalog.
 * Called fresh on every request so the AI always reflects current inventory.
 */
function buildSystemPrompt(products) {
  const catalogText = products
    .map((p) => {
      const storageOptions = p.storages
        .map((s) => {
          const finalPrice = p.price + (s.priceModifier || 0);
          return '  - ' + s.size + ': Rs.' + finalPrice.toLocaleString('en-IN');
        })
        .join('\n');

      const colorOptions = p.variants.map((v) => v.colorName).join(', ');

      return [
        '---',
        'Product: ' + p.name,
        'Base Price: Rs.' + p.price.toLocaleString('en-IN'),
        'Category: ' + p.category,
        'Description: ' + (p.description || 'N/A'),
        'Display: ' + (p.specs && p.specs.display ? p.specs.display : 'N/A'),
        'Processor: ' + (p.specs && p.specs.processor ? p.specs.processor : 'N/A'),
        'Camera: ' + (p.specs && p.specs.camera ? p.specs.camera : 'N/A'),
        'Battery: ' + (p.specs && p.specs.battery ? p.specs.battery : 'N/A'),
        'Available Colors: ' + (colorOptions || 'N/A'),
        'Storage Options & Prices:\n' + storageOptions,
      ].join('\n');
    })
    .join('\n\n');

  return (
    'You are an expert Samsung Store Assistant for the Samsung Galaxy Showcase online store. ' +
    'You are knowledgeable, friendly, and enthusiastic about Samsung products.\n\n' +
    'Your responsibilities:\n' +
    '- Answer customer questions accurately about products, specs, prices, colors, and storage options.\n' +
    '- Help customers choose the right Samsung phone based on their needs and budget.\n' +
    '- Provide precise pricing including storage variant prices.\n' +
    '- Always express prices in Indian Rupees (Rs.).\n' +
    '- Be concise but informative. Use bullet points for specs comparisons.\n' +
    '- If asked about something outside the catalog, politely say you can only assist with products currently available in this store.\n' +
    '- Never fabricate products, prices, or specs. Only reference what is in the LIVE CATALOG below.\n\n' +
    '--- LIVE STORE CATALOG ---\n' +
    catalogText + '\n' +
    '--- END OF CATALOG ---\n\n' +
    'Today is ' + new Date().toDateString() + '.'
  );
}

/**
 * POST /api/chat
 * Body: { message: string, history: Array<{ role: 'user'|'model', parts: [{ text: string }] }> }
 * Returns: { reply: string }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    // Fetch live product catalog from MongoDB
    const products = await Product.find({}).lean();

    if (products.length === 0) {
      return res.status(503).json({ error: 'Product catalog is currently unavailable.' });
    }

    // Build system prompt with injected live catalog data
    const systemInstruction = buildSystemPrompt(products);

    // Initialize the @google/genai SDK (supports AQ. key format)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Build the full conversation contents array:
    // prior history turns + the new user message appended at the end
    const priorTurns = (Array.isArray(history) ? history.slice(-20) : []).map((turn) => ({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: Array.isArray(turn.parts) ? turn.parts : [{ text: String(turn.parts) }],
    }));

    const contents = [
      ...priorTurns,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    // Use generateContent() — the primary stable API that works with AQ. keys
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const reply = response.text;

    if (!reply) {
      return res.status(500).json({ error: 'The assistant returned an empty response. Please try again.' });
    }

    res.json({ reply });
  } catch (error) {
    // Log the full error object so the terminal shows the real cause
    console.error('=== CHATBOT ERROR ===');
    console.error(error);
    console.error('====================');
    const userMessage = (error && error.message) ? error.message : 'The assistant encountered an error. Please try again.';
    res.status(500).json({ error: userMessage });
  }
});

module.exports = router;
