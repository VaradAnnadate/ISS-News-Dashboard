import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function Chatbot({ issData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Hello! I am your Mission Control AI. I can answer questions about the current ISS location, speed, astronauts, or latest news on the dashboard. What would you like to know?' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const clearChat = () => {
    const initialMsg = { role: 'assistant', content: 'Chat cleared. How can I help you today?' };
    setMessages([initialMsg]);
    localStorage.setItem('chat_history', JSON.stringify([initialMsg]));
  };

  const getDashboardContext = () => {
    const { speed, nearestPlace, astronauts, positions } = issData;
    const currentPos = positions.length > 0 ? positions[positions.length - 1] : { lat: 0, lon: 0 };
    
    let newsContext = 'No news available.';
    const cachedNews = localStorage.getItem('news_cache');
    if (cachedNews) {
      const { data } = JSON.parse(cachedNews);
      if (data && data.length > 0) {
        newsContext = data.map(n => `- ${n.title} (Source: ${n.source})`).join('\n');
      }
    }

    return `You are an AI assistant for a Real-Time ISS & News Dashboard.
CRITICAL RULES:
1. You MUST ONLY use the EXACT data provided below.
2. DO NOT use your pre-trained knowledge (e.g., if asked for speed, reply ONLY with the exact speed in the ISS DATA section).
3. If the data is not in the context below, say "I don't have that information on the dashboard."
4. Keep your answers extremely concise and direct (1-2 sentences maximum). Do not add fluff, trivia, or conversational filler.

ISS DATA:
- Location: Latitude ${currentPos.lat.toFixed(4)}, Longitude ${currentPos.lon.toFixed(4)}
- Speed: ${speed.toFixed(2)} km/h
- Nearest Place: ${nearestPlace}
- Number of Astronauts: ${astronauts.number}
- Astronaut Names: ${astronauts.names.join(', ')}

LATEST NEWS:
${newsContext}
`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const hfToken = import.meta.env.VITE_AI_TOKEN;
      if (!hfToken) {
        throw new Error('VITE_AI_TOKEN is not configured.');
      }

      const systemPrompt = { role: 'system', content: getDashboardContext() };
      
      // Mistral strictly requires the sequence to be: System (optional) -> User -> Assistant -> User...
      // We must strip our initial assistant greeting and ensure proper alternating roles.
      let historyToSend = [...messages].slice(-10);
      
      // Remove initial greeting
      historyToSend = historyToSend.filter(m => !(m.role === 'assistant' && m.content.includes('Hello! I am your Mission Control AI')));
      
      // Ensure history starts with 'user'
      while (historyToSend.length > 0 && historyToSend[0].role !== 'user') {
         historyToSend.shift();
      }

      // Ensure strict alternation and ends with 'assistant' so the new userMsg fits perfectly
      const validHistory = [];
      let expectedRole = 'user';
      for (const m of historyToSend) {
         if (m.role === expectedRole) {
            validHistory.push(m);
            expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
         }
      }
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
         validHistory.pop(); // Remove trailing user message if it didn't get an assistant reply
      }

      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
          messages: [systemPrompt, ...validHistory, userMsg],
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
         console.error('HF API Error Response:', data);
         let errorMsg = data.error || 'Unknown API Error';
         if (typeof errorMsg === 'object') {
           // Handle case where error is an array or object
           errorMsg = JSON.stringify(errorMsg);
         }
         throw new Error(errorMsg);
      }
      
      let aiContent = 'Sorry, I could not process that.';
      if (data.choices && data.choices[0] && data.choices[0].message) {
         aiContent = data.choices[0].message.content;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-[#fdfaf5] dark:bg-[#252525] w-[350px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col mb-4 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-white dark:bg-[#1f1f1f] border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              AI Assistant
            </h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">Clear</button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-3 text-sm bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-gray-800 text-gray-500 rounded-bl-none flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-[#1f1f1f] border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask from dashboard data only..."
                className="flex-grow p-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button 
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-500 text-white rounded-full shadow-xl hover:bg-red-600 transition flex items-center justify-center transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
