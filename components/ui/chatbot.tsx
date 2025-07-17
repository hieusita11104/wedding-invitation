import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, MessageSquare } from 'lucide-react';
import { Button } from './button';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

interface ApiResponse {
  success: boolean;
  message: string;
  prompt: string;
  response: {
    message: string;
    quote: string;
    category: string;
    alternatives: Record<string, string[]>;
    context: {
      promptType: string;
      totalMatches: number;
      categories: string[];
    };
  };
  debug: {
    totalData: number;
    sampleData: Array<{ category: string; content: string }>;
    filteredData: Array<{ category: string; content: string }>;
  };
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>('http://localhost:3001/api/test-google-ai', {
        prompt: input
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response.message,
        type: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.',
        type: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-colors z-50"
        aria-label="Mở trợ lý ảo"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="sr-only">Mở trợ lý ảo</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col z-50 border border-pink-500/20">
          {/* Header */}
          <div className="p-4 border-b border-pink-500/20 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Wedding AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Đóng trợ lý ảo"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Đóng trợ lý ảo</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-pink-500/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 px-4 py-2 rounded-lg border border-pink-500/20 focus:outline-none focus:border-pink-500 dark:bg-gray-800 dark:text-white"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}