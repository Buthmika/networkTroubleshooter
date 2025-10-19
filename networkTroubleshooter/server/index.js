import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. /api/ai will return 502.');
}

app.post('/api/ai', async (req, res) => {
  try {
    const { problem } = req.body;
    if (!problem) return res.status(400).json({ error: 'missing problem field' });

    if (!OPENAI_KEY) return res.status(502).json({ error: 'OpenAI key not configured on server' });

    const systemPrompt = `You are a helpful network troubleshooting assistant. When given a user's problem, return a JSON object with fields: solutions (array of short, practical step-by-step actions), reasoning (short plain-text explanation), confidence (number 0-100), followUpQuestions (array of up to 3 questions), detectedIssues (array of short tags). Only return valid JSON.`;

    const userPrompt = `Problem: "${problem}"\n\nRespond only with JSON matching the schema: {\"solutions\": [..], \"reasoning\": \"..\", \"confidence\": <number>, \"followUpQuestions\": [..], \"detectedIssues\": [..] }`;

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 700,
      temperature: 0.15
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI error', text);
      return res.status(502).json({ error: 'OpenAI API error', details: text });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;

    // Try to extract JSON from content
    const jsonMatch = content && content.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : content;

    const parsed = JSON.parse(jsonText);

    return res.json(parsed);
  } catch (err) {
    console.error('Server /api/ai error', err);
    return res.status(500).json({ error: 'server_error', details: String(err) });
  }
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`AI proxy listening on http://localhost:${port}`));
