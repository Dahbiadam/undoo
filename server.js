const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files (your HTML, CSS, JS)
app.use(express.static(__dirname)); 
app.use(express.json()); // For parsing POST request body

// --- SECURE AI COACH ENDPOINT ---
app.post('/api/ai-coach', async (req, res) => {
    // 1. Get key securely from Railway Environment Variables
    const apiKey = process.env.OPENROUTER_API_KEY; 
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured.' });
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o', // Or whatever model you use
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('AI Coach Error:', error);
        res.status(500).json({ error: 'Failed to fetch response from AI service.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
