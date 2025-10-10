import React, { useState } from 'react';
import { AITroubleshooter } from '../services/aiService';

interface ChatBoxProps {
  onNewProblem: (problem: string, solutions: string[]) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onNewProblem }) => {
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
      <h2>🔧 What's Your Network Problem?</h2>
      <p>Tell me what's wrong and I'll help you fix it!</p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: My WiFi is connected but I have no internet..."
          rows={4}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '🔍 Finding Solutions...' : '🚀 Get Help Now!'}
        </button>
      </form>
    </div>
  );
};