// AuthApp.jsx 
import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import Chatbot from './Chatbot.jsx';
import VentBotEmoji from './VentBotEmoji.jsx';
import '/index.css';

const identityProvider = "https://identity.ic0.app/#authorize";

const AuthApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      if (client.isAuthenticated()) {
        setIsAuthenticated(true);
      }
    };
    initAuth();
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider,
        onSuccess: () => {
          setIsAuthenticated(true);
        },
        onError: (error) => {
          setErrorMessage(error.message);
        }
      });
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="mb-4">Please log in with Internet Identity to continue.</p>
        <button
          onClick={login}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Login with Internet Identity
        </button>
        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <button
          onClick={logout}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Logout
        </button>
      </div>
      
      <div className="flex justify-center my-4">
        <VentBotEmoji botState="idle" sentiment={0} />
      </div>
      
      <Chatbot />
    </div>
  );
};

export default AuthApp;
