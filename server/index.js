const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get API key from environment variable
const API_KEY = process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error('Error: No API key found. Please set GOOGLE_API_KEY environment variable.');
  process.exit(1);
}

const genAI = new GoogleGenAI(API_KEY);

// AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ choices: [{ message: { content: response.text() } }] });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint specifically for streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { message, role, contextData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `
      You are the DIN Properties Secure Registry Assistant.
      CURRENT USER ROLE: ${role}

      IF ROLE IS ADMIN:
      - You are the Global Portfolio Supervisor.
      - You have full access to ALL property files and transactions.
      - You can perform global audits, identify collection trends, and list defaults across all clients.
      - Always include Owner Names in your tables.

      IF ROLE IS CLIENT:
      - You are a Private Ledger Auditor.
      - You only see the user's personal property files.
      - Focus on explaining installments, upcoming due dates, and payment history.

      STRICT FORMATTING:
      1. Use ALL CAPS for headers.
      2. NO STARS (**) or BOLDING.
      3. Use Markdown Tables for financial data.
      4. Columns for Admin: | OWNER | FILE ID | SIZE | DUE DATE | OVERDUE (PKR) |
      5. Columns for Client: | DESCRIPTION | DUE DATE | PAYABLE (PKR) | PAID (PKR) | BALANCE (PKR) |

      DATA CONTEXT: ${JSON.stringify(contextData)}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser message: ${message}` }]
      }]
    });
    
    const response = await result.response;
    
    res.json({ choices: [{ message: { content: response.text() } }] });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});