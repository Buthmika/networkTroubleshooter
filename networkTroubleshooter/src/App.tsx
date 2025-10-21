import { useState, useEffect } from 'react';
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
  const [apiError, setApiError] = useState<string | null>(null);
  const firebaseService = new FirebaseService();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await firebaseService.getHistory();
    setHistory(historyData);
  };

  const handleNewProblem = async (problem: string) => {
    // Show AI thinking animation
    setIsAiThinking(true);
    
    // Import and use the intelligent AI
    const { AITroubleshooter } = await import('./services/aiService');
    const aiTroubleshooter = new AITroubleshooter();
    
    // Add delay to show AI thinking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  // Get intelligent AI analysis (await async result)
  try {
    const aiAnalysis = await aiTroubleshooter.analyzeIntelligently(problem);
    setAiConfidence(aiAnalysis.confidence ?? 75);

    const newProblem: NetworkProblem = {
      id: Date.now().toString(),
      problem,
      solutions: aiAnalysis.solutions,
      confidence: aiAnalysis.confidence,
      timestamp: new Date()
    };

    setCurrentSolution(newProblem);
    setApiError(null);
  } catch (err: any) {
    console.error('AI API error', err);
    setApiError(err?.message || 'AI API failed');
    setIsAiThinking(false);
    return;
  }
  
    setIsAiThinking(false);
    
    // Save to Firebase (comment out if Firebase not setup yet)
    // await firebaseService.saveProblem(problem, aiAnalysis.solutions);
    
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
        {apiError && (
          <div style={{background: '#ffe6e6', padding: '12px', borderRadius: 8, marginBottom: 16, color: '#b00020'}}>
            <strong>AI API Error:</strong> {apiError}
          </div>
        )}
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