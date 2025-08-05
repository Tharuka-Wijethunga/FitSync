import React, { useState } from 'react';
import apiClient from '@/api/client';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am FitBot. How can I help you with your fitness journey today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/conversation', { message: inputValue });
      const botMessage = { sender: 'bot', text: response.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Sorry, I seem to be having some trouble right now. Please try again later.' };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={toggleOpen} style={styles.bubble}>
        🤖
      </button>
    );
  }

  return (
    <div style={styles.widgetContainer}>
      <div style={styles.header}>
        <h3>FitBot Assistant</h3>
        <button onClick={toggleOpen} style={styles.closeButton}>×</button>
      </div>
      <div style={styles.messageArea}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.sender === 'bot' ? styles.botMessage : styles.userMessage}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={styles.botMessage}><i>Typing...</i></div>}
      </div>
      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about fitness..."
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.sendButton} disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}

const styles = {
    bubble: { position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#007bff', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    widgetContainer: { position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px', background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', zIndex: 1000 },
    header: { padding: '15px', background: '#007bff', color: 'white', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeButton: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' },
    messageArea: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
    botMessage: { alignSelf: 'flex-start', background: '#f1f0f0', padding: '10px 15px', borderRadius: '20px 20px 20px 5px', maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', background: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '20px 20px 5px 20px', maxWidth: '80%' },
    inputForm: { display: 'flex', padding: '10px', borderTop: '1px solid #eee' },
    input: { flex: 1, border: '1px solid #ccc', padding: '10px', borderRadius: '20px', marginRight: '10px' },
    sendButton: { background: '#007bff', color: 'white', border: 'none', borderRadius: '20px', padding: '0 15px', cursor: 'pointer' }
};

export default ChatbotWidget;