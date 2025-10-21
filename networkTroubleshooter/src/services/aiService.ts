/* eslint-disable @typescript-eslint/no-unused-vars */

export interface NetworkProblem {
  id: string;
  problem: string;
  solutions: string[];
  confidence: number;
  // removed detailed AI reasoning text per user request
  aiReasoning?: string;
  followUpQuestions?: string[];
  timestamp: Date;
}

export interface AIAnalysis {
  solutions: string[];
  // optional reasoning (kept for internal use but not displayed by UI)
  reasoning?: string;
  confidence: number;
  followUpQuestions?: string[];
  detectedIssues: string[];
}

export class AITroubleshooter {
  // AI is provided by server-side API; helpers removed to keep service minimal

  // Main AI analysis method that thinks and reasons (async)
  async analyzeIntelligently(userInput: string): Promise<AIAnalysis> {
    // Strict API-only flow: call server proxy /api/ai which returns structured JSON
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: userInput })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API error: ${res.status} ${res.statusText} - ${text}`);
    }

    const parsed = await res.json();

    const result: AIAnalysis = {
      solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
      reasoning: parsed.reasoning || parsed.explanation || undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : undefined,
      detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : []
    };

    return result;
  }
  // helpers removed — AI results are returned by server API
}