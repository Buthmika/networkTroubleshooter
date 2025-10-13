import React from 'react';

interface SolutionCardProps {
  problem: string;
  solutions: string[];
  timestamp: Date;
  aiReasoning?: string;
  followUpQuestions?: string[];
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  problem, 
  solutions, 
  timestamp,
  aiReasoning,
  followUpQuestions = []
}) => {
  return (
    <div className="solution-card">
      <div className="problem-header">
        <h3>❓ Your Problem: {problem}</h3>
        <span className="timestamp">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      {aiReasoning && (
        <div className="ai-reasoning">
          <h4>🧠 AI Analysis & Reasoning:</h4>
          <div className="reasoning-content">
            {aiReasoning.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
      
      <div className="solutions">
        <h4>💡 AI-Generated Solutions (Smart Order):</h4>
        <ol>
          {solutions.map((solution, index) => (
            <li key={index} className="solution-item">
              {solution}
            </li>
          ))}
        </ol>
      </div>

      {followUpQuestions.length > 0 && (
        <div className="follow-up-questions">
          <h4>🤔 AI Follow-up Questions:</h4>
          <ul className="questions-list">
            {followUpQuestions.map((question, index) => (
              <li key={index} className="question-item">
                {question}
              </li>
            ))}
          </ul>
          <p className="questions-note">
            💬 Answer these to help AI provide even better solutions!
          </p>
        </div>
      )}
    </div>
  );
};