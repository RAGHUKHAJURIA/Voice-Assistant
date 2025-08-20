import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

function App() {
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Effect to call the AI model when listening stops and there's a transcript
  useEffect(() => {
    if (!listening && transcript) {
      getAIResponse(transcript);
    }
  }, [listening, transcript]);

  // Function to speak text using the browser's built-in speech synthesis
  const speak = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Function to fetch the AI response from your backend
  const getAIResponse = async (text) => {
    setIsLoading(true);
    try {
      // IMPORTANT: Changed the URL to a relative path for Vercel deployment
      const res = await fetch('https://voice-assistant-rouge-beta.vercel.app/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      setResponseText(data.response);
      speak(data.response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponseText("Sorry, something went wrong.");
    } finally {
      setIsLoading(false);
      resetTranscript();
    }
  };

  // Handler to start recording user's voice
  const handleAsk = () => {
    setResponseText('');
    SpeechRecognition.startListening();
  };

  // Handler to stop the AI from speaking
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Handler to clear the screen and reset the state
  const handleClear = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setResponseText('');
    resetTranscript();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Voice Assistant</h1>
        <p className="app-subheader">Ask me anything!</p>
      </header>

      <main className="app-main">
        <div className="controls-area">
          <button
            className={`mic-button ${listening ? 'listening' : ''}`}
            onClick={handleAsk}
            disabled={listening || isLoading || isSpeaking}
          >
            {listening ? 'Listening...' : 'Start Recording'}
          </button>

          {isSpeaking && (
            <button onClick={handleStop} className="stop-button">
              Stop Speech
            </button>
          )}

          {(responseText || transcript) && !isSpeaking && (
            <button onClick={handleClear} className="clear-button">
              Clear
            </button>
          )}
        </div>

        {transcript && (
          <div className="transcript-area">
            <p className="transcript-label">You said:</p>
            <p className="transcript-text">{transcript}</p>
          </div>
        )}

        {isLoading && <div className="loading-indicator">Processing...</div>}

        {responseText && (
          <div className="response-wrapper">
            <p className="response-label">Response:</p>
            <textarea
              className="response-text-area"
              value={responseText}
              readOnly
              rows={8}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>A Modern Voice Assistant</p>
      </footer>
    </div>
  );
}

export default App;
