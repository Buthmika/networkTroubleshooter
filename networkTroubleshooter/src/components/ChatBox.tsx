import React, { useState } from 'react';
import { AITroubleshooter } from '../services/aiService';

interface ChatBoxProps {
  onNewProblem: (problem: string, solutions: string[]) => void;
  isAiThinking?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onNewProblem, isAiThinking = false }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const aiTroubleshooter = new AITroubleshooter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    // Get AI solutions
    const solutions = aiTroubleshooter.analyzeProblem(input);
    
    // Send to parent component  
    onNewProblem(input, solutions);
    
    setInput('');
    setIsLoading(false);
  };

  return (
    <div className="chat-box">
      <div className="ai-chat-header">
        <div className="ai-assistant">
          <span className="ai-avatar">🤖</span>
          <div className="ai-info">
            <h2>AI Network Assistant</h2>
            <p>Describe your problem and I'll analyze it instantly!</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: My WiFi is connected but I have no internet..."
          rows={4}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim() || isAiThinking}>
          {isLoading || isAiThinking ? '🤖 AI Analyzing...' : '🚀 Ask AI Assistant'}
        </button>
      </form>
    </div>
  );
};