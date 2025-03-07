// VentBotEmoji.jsx
import React from 'react';

const VentBotEmoji = ({ botState, sentiment = 0 }) => {
  const getExpression = () => {
    if (botState === 'listening') return '👂';
    if (botState === 'thinking') return '🤔';
    if (botState === 'speaking') return '🗣️';
    
    // Idle state: choose based on sentiment
    if (sentiment > 0.3) return '😊';
    if (sentiment < -0.3) return '😔';
    return '😐';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px'
    }}>
      <span style={{ fontSize: '4rem' }}>
        {getExpression()}
      </span>
    </div>
  );
};

export default VentBotEmoji;
