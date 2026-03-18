const express = require('express');
const router  = express.Router();

// POST /api/chat  — Gemini proxy (keeps API key server-side)
router.post('/', async (req, res) => {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const model = 'gemini-2.5-flash';
    const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const geminiRes = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt || '' }] },
                contents: messages,
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({ error: data.error?.message || 'Gemini API error' });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        res.json({ text });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
