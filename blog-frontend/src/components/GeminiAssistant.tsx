import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
}

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your Online Blogging via NLP AI assistant. I can help you brainstorm ideas, refine your writing, or explain NLP analysis results. How can I help?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are a helpful AI assistant for "Online Blogging via NLP", a blogging platform with NLP features. Help users write better blogs, brainstorm titles, and understand NLP metrics like sentiment and spam detection. Be professional, creative, and encouraging.',
        },
      });

      const response = await chat.sendMessage({
        message: input
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Sorry, I couldn\'t generate a response.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Failed to connect to Gemini. Please check your API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/40 transition-all duration-300"
          >
            <Bot size={26} />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300",
              isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[500px]"
            )}
          >
            {/* Header */}
            <div className="bg-indigo-600 px-4 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <span className="font-bold text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white",
                        msg.role === 'user' ? "bg-indigo-600" : "bg-slate-600 dark:bg-slate-500"
                      )}>
                        {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user'
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-xs"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs italic">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </div>
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <input
                      id="gemini-input"
                      type="text"
                      placeholder="Ask me anything..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeminiAssistant;
