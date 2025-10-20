import React, { useState, useEffect, useRef } from 'react';

interface ChatBoxProps {
  onNewProblem: (problem: string) => void;
  isAiThinking?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onNewProblem, isAiThinking = false }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Web Speech API (SpeechRecognition)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recog.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recog;
  }, []);

  const toggleRecording = () => {
    const recog = recognitionRef.current;
    if (!recog) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recog.stop();
      setIsRecording(false);
    } else {
      try {
        recog.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition start error', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    // Send problem to parent component for intelligent AI analysis
    onNewProblem(input);
    
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
        <div className="input-with-mic">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: My WiFi is connected but I have no internet..."
            rows={4}
            disabled={isLoading}
            aria-label="Describe your network problem"
          />
          <button
            type="button"
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title="Toggle voice typing"
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop voice typing' : 'Start voice typing'}
          >
            <svg className="mic-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button type="submit" disabled={isLoading || !input.trim() || isAiThinking}>
          {isLoading || isAiThinking ? '🤖 AI Analyzing...' : '🚀 Ask AI Assistant'}
        </button>
      </form>
    </div>
  );
};