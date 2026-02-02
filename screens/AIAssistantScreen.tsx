'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getStudyBuddyResponse } from '../geminiService';
import { ChatMessage } from '../types';

interface AIAssistantScreenProps {
  onBack: () => void;
}

const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi Alex! I'm your EduFlow Study Buddy. How can I help you with your classes or assignments today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getStudyBuddyResponse(messages, userMsg);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center p-6 border-b border-gray-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="mr-4 text-gray-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white fill">smart_toy</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">EduFlow Assistant</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-4 text-sm shadow-subtle ${msg.role === 'user'
                ? 'bg-primary text-white rounded-tr-none'
                : 'bg-white text-gray-800 rounded-tl-none border border-white'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl p-4 shadow-subtle border border-white flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <footer className="p-4 shrink-0 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2 pr-4 shadow-inner">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-grow bg-transparent border-none focus:ring-0 text-sm p-2"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIAssistantScreen;
