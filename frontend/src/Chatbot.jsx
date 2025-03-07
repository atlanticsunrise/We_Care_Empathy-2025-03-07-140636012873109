import React, { useState, useRef, useEffect } from 'react';
import { backend } from 'declarations/backend';
import botImg from '/Head.svg';
import userImg from '/user.svg';
import VentBotEmoji from './VentBotEmoji.jsx';
import '/index.css';

// Function to start voice input using the Web Speech API
const startVoiceInput = (setInputValue) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in your browser.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputValue(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error: ", event.error);
  };

  recognition.start();
};

// Function to speak text using the SpeechSynthesis API
const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  let voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
    };
  }
  // Try to select a female voice; if not found, fallback to the first voice
  const femaleVoice = voices.find(voice =>
    voice.name.toLowerCase().includes("female") ||
    voice.name.toLowerCase().includes("samantha")
  ) || voices.find(voice => voice.lang === "en-US") || voices[0];

  utterance.voice = femaleVoice;
  utterance.rate = 0.9;
  // Increase pitch slightly for a more feminine tone (adjust as needed)
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
};

const Chatbot = () => {
  const [chat, setChat] = useState([
    { role: { system: null }, content: "Express Freely, No Judgement" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [botResponse, setBotResponse] = useState('');
  const [botState, setBotState] = useState('idle'); // 'idle', 'listening', 'thinking', 'speaking'
  // New sentiment state
  const [sentiment, setSentiment] = useState(0);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  // Simple sentiment analysis function based on keywords in the response
  const analyzeSentiment = (response) => {
    const positiveWords = ['happy', 'great', 'good', 'awesome', 'fantastic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'sorry'];
    const responseLower = response.toLowerCase();

    // Count occurrences of positive/negative words
    let posCount = positiveWords.reduce((count, word) => count + (responseLower.includes(word) ? 1 : 0), 0);
    let negCount = negativeWords.reduce((count, word) => count + (responseLower.includes(word) ? 1 : 0), 0);

    // Determine sentiment value
    if (posCount > negCount) {
      return 0.5;  // positive sentiment
    } else if (negCount > posCount) {
      return -0.5; // negative sentiment
    } else {
      return 0;    // neutral
    }
  };

  const askAgent = async (messages) => {
    try {
      setBotState('thinking'); // Update avatar: bot is thinking
      const response = await backend.chat(messages);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop(); // Remove the "Thinking..." message
        newChat.push({ role: { system: null }, content: response });
        return newChat;
      });
      // Analyze sentiment and update state
      const newSentiment = analyzeSentiment(response);
      setSentiment(newSentiment);
      
      // Speak the response
      setBotState('speaking'); // Update avatar: bot is speaking
      speakText(response);
      setBotResponse(response);
      // After speaking, revert to idle after a short delay
      setTimeout(() => setBotState('idle'), 2000);
    } catch (e) {
      console.error(e);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        return newChat;
      });
      setBotState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: { user: null }, content: inputValue };
    const thinkingMessage = { role: { system: null }, content: 'Thinking ...' };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);
    askAgent(chat.slice(1).concat(userMessage));
  };

  // Wrapper for voice input: update botState and then start voice recognition
  const handleVoiceInput = () => {
    setBotState('listening'); // Update avatar: bot is listening
    startVoiceInput(setInputValue);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        {/* Display the interactive emoji avatar */}
        <div className="p-4">
          <VentBotEmoji botState={botState} sentiment={sentiment} />
        </div>
        <div className="flex-1 overflow-y-auto rounded-t-lg bg-gray-100 p-4" ref={chatBoxRef}>
          {chat.map((message, index) => {
            const isUser = 'user' in message.role;
            const img = isUser ? userImg : botImg;
            const name = isUser ? 'User' : 'System';
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isUser && (
                  <div
                    className="mr-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
                <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                  <div className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}>
                    <div>{name}</div>
                    <div className="mx-2">{formatDate(new Date())}</div>
                  </div>
                  <div>{message.content}</div>
                </div>
                {isUser && (
                  <div
                    className="ml-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
        <form className="flex rounded-b-lg border-t bg-white p-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask anything ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          {/* Voice input button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 mr-2"
          >
            🎤
          </button>
          <button
            type="submit"
            className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
