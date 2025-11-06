const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
// Railway will provide the PORT environment variable
const PORT = process.env.PORT || 3000;

// Middleware to serve static files (including index.html)
app.use(express.static(path.join(__dirname))); 
app.use(express.json()); // For parsing POST request body

// --- SECURE AI COACH ENDPOINT ---
app.post('/api/ai-coach', async (req, res) => {
    // 1. Get key securely from Railway Environment Variables
    const apiKey = process.env.OPENROUTER_API_KEY; 
    
    // 2. Receive context from the client (user message, system prompt, history)
    const { prompt, system, history } = req.body;
    
    if (!apiKey) {
        console.error('OPENROUTER_API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: AI Key missing.' });
    }

    // 3. Construct the messages array for the AI API
    const messages = [
        { role: 'system', content: system },
        ...(history || []), // Ensure history is an array
        { role: 'user', content: prompt }
    ];

    // 4. Call the external AI API securely from the server
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                "HTTP-Referer": req.headers.referer || req.headers.origin || 'https://up.railway.app', // Required by OpenRouter
                "X-Title": "UNDO Habit Tracker Server" // Required by OpenRouter
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o', 
                messages: messages,
                temperature: 0.7,
                max_tokens: 300
            })
        });

        // 5. Pass API response back to the client
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('AI Coach API Call Error:', error);
        res.status(500).json({ error: 'Failed to communicate with the external AI service.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
