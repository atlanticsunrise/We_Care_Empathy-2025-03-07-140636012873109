// components/VoiceFeatures.jsx

import React, { useState, useEffect, useRef } from 'react';

const VoiceFeatures = ({ 
  isEnabled, 
  onUserSpeech, 
  onListeningStart, 
  onListeningEnd,
  botResponse,
  onSpeakingStart,
  onSpeakingEnd,
  voiceOptions = {
    rate: 1.0,      // Speed of speech (0.1 to 10)
    pitch: 1.0,     // Pitch of voice (0 to 2)
    volume: 1.0,    // Volume (0 to 1)
    voiceName: null // Optional preferred voice name
  }
}) => {
  // State variables
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentVoice, setCurrentVoice] = useState(null);
  const [recognition, setRecognition] = useState(null);
  
  // Refs
  const speechSynthesisRef = useRef(null);
  const microphoneRef = useRef(null);
  const speakerRef = useRef(null);
  
  // Check for browser support on mount
  useEffect(() => {
    const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 
                                        'webkitSpeechRecognition' in window;
    const isSpeechSynthesisSupported = 'speechSynthesis' in window;
    
    setIsSupported(isSpeechRecognitionSupported && isSpeechSynthesisSupported);
    
    if (isSpeechSynthesisSupported) {
      // Initialize speech synthesis
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Get available voices
      const loadVoices = () => {
        const voices = speechSynthesisRef.current.getVoices();
        setAvailableVoices(voices);
        
        // Set default voice
        if (voices.length > 0) {
          // Look for a female voice as default for VentBot
          const femaleVoice = voices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha') ||
            voice.name.includes('Siri')
          );
          
          const defaultVoice = femaleVoice || voices.find(voice => voice.default) || voices[0];
          setCurrentVoice(defaultVoice);
        }
      };
      
      // Chrome loads voices asynchronously
      if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
        speechSynthesisRef.current.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
    
    if (isSpeechRecognitionSupported) {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onUserSpeech && transcript.trim()) {
          onUserSpeech(transcript);
        }
      };
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        if (onListeningStart) onListeningStart();
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (onListeningEnd) onListeningEnd();
        
        // Auto restart if it's still enabled and wasn't paused by user
        if (isEnabled && !pausedByUser && !isSpeaking) {
          setTimeout(() => {
            if (isEnabled && !pausedByUser && !isSpeaking) {
              recognitionInstance.start();
            }
          }, 500);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (onListeningEnd) onListeningEnd();
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Cleanup
    return () => {
      if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [onUserSpeech, onListeningStart, onListeningEnd]);
  
  // Handle voice feature toggling
  useEffect(() => {
    if (!isSupported || !recognition) return;
    
    if (isEnabled && !isListening && !pausedByUser && !isSpeaking) {
      // Start listening
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition', error);
      }
    } else if (!isEnabled && isListening) {
      // Stop listening
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition', error);
      }
    }
  }, [isEnabled, isListening, pausedByUser, isSpeaking, isSupported, recognition]);
  
  // Speak bot response when it changes
  useEffect(() => {
    if (!isSupported || !speechSynthesisRef.current || !botResponse || !isEnabled) return;
    
    // Cancel any ongoing speech
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
    }
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(botResponse);
    
    // Set voice options
    if (currentVoice) {
      utterance.voice = currentVoice;
    }
    
    utterance.rate = voiceOptions.rate;
    utterance.pitch = voiceOptions.pitch;
    utterance.volume = voiceOptions.volume;
    
    // Handle events
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onSpeakingStart) onSpeakingStart();
      
      // Stop listening while speaking
      if (isListening && recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error('Error stopping recognition while speaking', error);
        }
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeakingEnd) onSpeakingEnd();
      
      // Resume listening after speaking if still enabled
      if (isEnabled && !pausedByUser && recognition) {
        setTimeout(() => {
          if (isEnabled && !pausedByUser) {
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting recognition after speaking', error);
            }
          }
        }, 500);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
      if (onSpeakingEnd) onSpeakingEnd();
    };
    
    // Speak the response
    speechSynthesisRef.current.speak(utterance);
  }, [botResponse, isEnabled, currentVoice, voiceOptions, isListening, recognition, onSpeakingStart, onSpeakingEnd, pausedByUser, isSupported]);
  
  // Toggle listening manually
  const toggleListening = () => {
    if (!isSupported || !recognition) return;
    
    if (isListening) {
      setPausedByUser(true);
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition', error);
      }
    } else {
      setPausedByUser(false);
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition', error);
      }
    }
  };
  
  // Toggle speaking manually
  const toggleSpeaking = () => {
    if (!isSupported || !speechSynthesisRef.current) return;
    
    if (isSpeaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      if (onSpeakingEnd) onSpeakingEnd();
    }
  };
  
  // Select a different voice
  const changeVoice = (voiceName) => {
    const newVoice = availableVoices.find(voice => voice.name === voiceName);
    if (newVoice) {
      setCurrentVoice(newVoice);
    }
  };
  
  if (!isSupported) {
    return (
      <div className="voice-features-warning">
        <p>Speech features are not supported in your browser. 
        Please try using Chrome, Edge, or Safari for full functionality.</p>
      </div>
    );
  }
  
  return (
    <div className="voice-features">
      <div className="voice-controls">
        <button 
          ref={microphoneRef}
          className={`microphone-button ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          disabled={!isEnabled || isSpeaking}
        >
          <span className="icon">🎤</span>
          <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
        </button>
        
        <button 
          ref={speakerRef}
          className={`speaker-button ${isSpeaking ? 'active' : ''}`}
          onClick={toggleSpeaking}
          aria-label={isSpeaking ? "Stop speaking" : "Speaker"}
          disabled={!isEnabled || !isSpeaking}
        >
          <span className="icon">🔊</span>
          <span className="sr-only">{isSpeaking ? "Stop speaking" : "Speaker"}</span>
        </button>
      </div>
      
      {isListening && (
        <div className="listening-indicator" aria-live="polite">
          Listening...
        </div>
      )}
      
      {isSpeaking && (
        <div className="speaking-indicator" aria-live="polite">
          Speaking...
        </div>
      )}
      
      <style jsx>{`
        .voice-features {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 10px 0;
        }
        
        .voice-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .microphone-button,
        .speaker-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: #f0f0f0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .microphone-button:hover,
        .speaker-button:hover {
          background-color: #e0e0e0;
        }
        
        .microphone-button.active {
          background-color: #ff5555;
          color: white;
          animation: pulse 1.5s infinite;
        }
        
        .speaker-button.active {
          background-color: #4A90E2;
          color: white;
          animation: pulse 1.5s infinite;
        }
        
        .microphone-button:disabled,
        .speaker-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .listening-indicator,
        .speaking-indicator {
          margin-top: 5px;
          font-size: 14px;
          color: #555;
        }
        
        .listening-indicator {
          color: #ff5555;
        }
        
        .speaking-indicator {
          color: #4A90E2;
        }
        
        .voice-features-warning {
          color: #ff5555;
          text-align: center;
          padding: 10px;
          font-size: 14px;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceFeatures;