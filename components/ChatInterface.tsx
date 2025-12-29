import React, { useState, useRef, useEffect } from 'react';
import { CategoryConfig, ChatMessage } from '../types';
import { createDebateChat } from '../services/geminiService';
import { Icon } from './Icon';
import { GenerateContentResponse } from "@google/genai";

interface ChatInterfaceProps {
  topicContent: string;
  category: CategoryConfig;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ topicContent, category, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createDebateChat(topicContent);
    const startInteraction = async () => {
      setIsTyping(true);
      try {
        const response: GenerateContentResponse = await chatSessionRef.current.sendMessage({
           message: "Lance le débat avec une phrase courte et provocante liée au sujet." 
        });
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            text: response.text || "Prêt à débattre ?"
        }]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTyping(false);
      }
    };
    startInteraction();
  }, [topicContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({
        message: userMsg.text
      });
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "..."
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Fonction utilitaire pour nettoyer le texte avant affichage
  const formatMessageText = (text: string) => {
    return text
      .replace(/\*\*/g, '')       // Gras
      .replace(/^#+\s*/gm, '')    // Titres
      .replace(/^\*\s*/gm, '')    // Listes
      .replace(/\*/g, '')         // Étoiles isolées
      .trim();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-3xl mx-auto border border-white/50 ring-1 ring-slate-900/5 relative transition-all duration-300">
      
      {/* Background decoration (immersive feel) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${category.colors.bg} to-white opacity-50 pointer-events-none`} />

      {/* Header - Glassmorphism, floating slightly */}
      <div className="px-5 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-20 bg-white/60 border-b border-white/40">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br from-white to-white/50 shadow-sm ring-1 ring-black/5 ${category.colors.text}`}>
            <Icon name="chat" className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm md:text-base leading-tight ${category.colors.text}`}>Débat IA</h3>
            <p className="text-[10px] md:text-xs opacity-60 font-medium tracking-wide">Résonance Intelligence</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className={`p-2 hover:bg-black/5 rounded-full transition-colors ${category.colors.text}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 scroll-smooth">
        {/* Topic Context Pill - Floating styling */}
        <div className="flex justify-center mb-6 sticky top-0 z-10">
            <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-sm rounded-full px-5 py-1.5 max-w-[90%] ring-1 ring-black/5">
                 <p className="text-[10px] md:text-xs text-slate-500 truncate text-center font-medium">
                    <span className="font-bold mr-1">Sujet :</span> {formatMessageText(topicContent)}
                </p>
            </div>
        </div>

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in-up`}>
              
              {/* Avatar / Label */}
              <div className="flex items-center mb-1 space-x-2 px-1">
                 {!isUser && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${category.colors.bg} ${category.colors.text} ring-1 ring-white`}>
                        IA
                    </div>
                 )}
                 <span className="text-[10px] text-slate-400 font-medium">
                    {isUser ? 'Vous' : 'Résonance'}
                 </span>
              </div>

              {/* Bubble */}
              <div 
                className={`max-w-[85%] md:max-w-[80%] px-5 py-3 text-sm md:text-base leading-relaxed shadow-sm transition-all duration-200 relative group
                  ${isUser 
                    ? `${category.colors.chatBubbleUser} rounded-2xl rounded-tr-sm shadow-md` 
                    : `${category.colors.chatBubbleAi} rounded-2xl rounded-tl-sm shadow-sm border border-black/5`
                  }
                `}
              >
                {formatMessageText(msg.text)}
              </div>
            </div>
          );
        })}
        
        {isTyping && (
           <div className="flex flex-col items-start animate-pulse">
             <div className="flex items-center mb-1 space-x-2 px-1">
                 <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${category.colors.bg} ${category.colors.text} ring-1 ring-white`}>
                    IA
                </div>
                 <span className="text-[10px] text-slate-400 font-medium">Résonance</span>
             </div>
             
             {/* Styled Typing Indicator */}
             <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${category.colors.chatBubbleAi} border border-black/5 shadow-sm flex space-x-1.5 items-center`}>
               <div className={`w-2 h-2 rounded-full animate-bounce ${category.colors.text} opacity-60`} style={{ animationDelay: '0ms' }}></div>
               <div className={`w-2 h-2 rounded-full animate-bounce ${category.colors.text} opacity-60`} style={{ animationDelay: '150ms' }}></div>
               <div className={`w-2 h-2 rounded-full animate-bounce ${category.colors.text} opacity-60`} style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area - Floating Capsule */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white/80 to-transparent z-20">
        <div className="flex items-end space-x-2 bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-indigo-100/50 focus-within:border-indigo-200 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Écrivez votre argument..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 min-h-[48px] py-3 px-4 text-sm md:text-base"
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              !inputText.trim() 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : `${category.colors.button} ${category.colors.buttonHover} text-white shadow-lg transform hover:scale-105 active:scale-95`
            }`}
          >
            <Icon name="send" className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};