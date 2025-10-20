import React from 'react';

interface SolutionCardProps {
  problem: string;
  solutions: string[];
  timestamp: Date;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  problem, 
  solutions, 
  timestamp
}) => {
  return (
    <div className="solution-card">
      <div className="problem-header">
        <h3>❓ Your Problem: {problem}</h3>
        <span className="timestamp">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
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
    </div>
  );
};