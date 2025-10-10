import React, { useState, useEffect } from 'react';
import { ChatBox } from './components/ChatBox';
import { SolutionCard } from './components/SolutionCard';
import { FirebaseService } from './services/firebaseService';
import type { NetworkProblem } from './services/aiService';
import './App.css';

function App() {
  const [currentSolution, setCurrentSolution] = useState<NetworkProblem | null>(null);
  const [history, setHistory] = useState<NetworkProblem[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);
  const firebaseService = new FirebaseService();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await firebaseService.getHistory();
    setHistory(historyData);
  };

  const handleNewProblem = async (problem: string, solutions: string[]) => {
    // Show AI thinking animation
    setIsAiThinking(true);
    
    // Simulate AI confidence calculation
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
    setAiConfidence(confidence);
    
    // Add slight delay for AI effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newProblem: NetworkProblem = {
      id: Date.now().toString(),
      problem,
      solutions,
      timestamp: new Date()
    };

    setCurrentSolution(newProblem);
    setIsAiThinking(false);
    
    // Save to Firebase (comment out if Firebase not setup yet)
    // await firebaseService.saveProblem(problem, solutions);
    
    // Refresh history
    // loadHistory();
  };

  return (
    <div className="App">
      <header>
        <div className="ai-logo">
          <div className="ai-brain">🧠</div>
          <div className="ai-pulse"></div>
        </div>
        <h1>
          <span className="ai-text">AI</span> Network Troubleshooter
        </h1>
        <p>Powered by Artificial Intelligence • Get instant solutions for your network problems!</p>
        <div className="ai-status">
          <div className="ai-indicator"></div>
          <span>AI Ready</span>
        </div>
      </header>

      <main>
        <ChatBox onNewProblem={handleNewProblem} isAiThinking={isAiThinking} />
        
        {isAiThinking && (
          <div className="ai-thinking">
            <div className="ai-thinking-animation">
              <div className="ai-brain-icon">🤖</div>
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p>AI is analyzing your network problem...</p>
          </div>
        )}

        {currentSolution && !isAiThinking && (
          <div className="current-solution">
            <div className="ai-solution-header">
              <h2>🎯 AI Solution Found</h2>
              <div className="ai-confidence">
                <span className="confidence-text">AI Confidence: {aiConfidence}%</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{width: `${aiConfidence}%`}}
                  ></div>
                </div>
              </div>
            </div>
            <SolutionCard
              problem={currentSolution.problem}
              solutions={currentSolution.solutions}
              timestamp={currentSolution.timestamp}
            />
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h2>📚 Previous Problems</h2>
            {history.map((item) => (
              <SolutionCard
                key={item.id}
                problem={item.problem}
                solutions={item.solutions}
                timestamp={item.timestamp}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;