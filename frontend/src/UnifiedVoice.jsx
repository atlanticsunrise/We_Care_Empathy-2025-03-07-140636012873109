// UnifiedVoice.jsx
import React, { useState, useEffect } from 'react';

const UnifiedVoice = ({ onVoiceResult, botResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize speech recognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Pass the transcript to the parent handler
      if (onVoiceResult && transcript.trim()) {
        onVoiceResult(transcript);
      }
    };

    recog.onerror = (error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);
  }, [onVoiceResult]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  // Function to speak the bot response
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Whenever botResponse changes, speak it aloud
  useEffect(() => {
    if (botResponse && botResponse.trim()) {
      speakText(botResponse);
    }
  }, [botResponse]);

  return (
    <div className="flex flex-col items-center my-4">
      <button 
        onClick={startListening} 
        disabled={isListening || isSpeaking}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        {isListening ? "Listening..." : "Speak"}
      </button>
      {isSpeaking && <div className="mt-2 text-sm text-gray-600">Bot is speaking...</div>}
    </div>
  );
};

export default UnifiedVoice;
