
import { PropertyFile, User, Transaction } from "./types";

/**
 * Generates an institutional summary of a user's portfolio.
 */
export const generateSmartSummary = async (user: User, files: PropertyFile[]) => {
  const context = files.map(f => ({
    id: f.fileNo,
    owner: f.ownerName,
    size: f.plotSize,
    totalVal: f.plotValue,
    paid: f.paymentReceived,
    balance: f.balance,
    overdue: f.overdue
  }));

  const prompt = `
    Analyze this real estate portfolio for ${user.name} (${user.role}).
    REGISTRY DATA: ${JSON.stringify(context)}
    
    TASK: Provide a 3-sentence high-level executive summary. 
    Focus on financial health, upcoming milestones, and collection status.
    STRICT RULE: NO BOLDING, NO STARS, NO MARKDOWN STYLING.
    Tone: Senior Financial Auditor.
  `;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Analysis suspended. Registry synchronization required.";
  }
};

/**
 * Streams chat responses with role-based system instructions.
 * Note: This implementation makes a single request to the backend since true streaming
 * requires more complex WebSocket implementation.
 */
export async function* streamChatResponse(message: string, role: string, contextData: any[]) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, role, contextData })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;
    
    // Yield the entire response as a single chunk since we're not doing true streaming
    yield fullResponse;
  } catch (error) {
    console.error("Streaming Error:", error);
    throw error;
  }
}
