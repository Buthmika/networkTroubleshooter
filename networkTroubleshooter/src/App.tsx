import React, { useState, useEffect } from 'react';
import { ChatBox } from './components/ChatBox';
import { SolutionCard } from './components/SolutionCard';
import { FirebaseService } from './services/firebaseService';
import type { NetworkProblem } from './services/aiService';
import './App.css';

function App() {
  const [currentSolution, setCurrentSolution] = useState<NetworkProblem | null>(null);
  const [history, setHistory] = useState<NetworkProblem[]>([]);
  const firebaseService = new FirebaseService();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await firebaseService.getHistory();
    setHistory(historyData);
  };

  const handleNewProblem = async (problem: string, solutions: string[]) => {
    const newProblem: NetworkProblem = {
      id: Date.now().toString(),
      problem,
      solutions,
      timestamp: new Date()
    };

    setCurrentSolution(newProblem);
    
    // Save to Firebase (comment out if Firebase not setup yet)
    // await firebaseService.saveProblem(problem, solutions);
    
    // Refresh history
    // loadHistory();
  };

  return (
    <div className="App">
      <header>
        <h1>🌐 AI Network Troubleshooter</h1>
        <p>Get instant solutions for your network problems!</p>
      </header>

      <main>
        <ChatBox onNewProblem={handleNewProblem} />
        
        {currentSolution && (
          <div className="current-solution">
            <h2>🎯 Your Solution</h2>
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