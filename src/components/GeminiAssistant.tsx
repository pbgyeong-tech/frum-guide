
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Bot, ChevronDown } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { HANDBOOK_CONTENT, COMPANY_NAME } from '../constants';
import { ChatMessage } from '../types';

const getContextString = () => {
  return HANDBOOK_CONTENT.map(section => {
    const subContent = section.subSections.map(sub => 
      `Title: ${sub.title}\nContent: ${Array.isArray(sub.content) ? sub.content.join(', ') : sub.content}\n${sub.codeBlock ? `Info: ${sub.codeBlock}` : ''}`
    ).join('\n\n');
    return `[Section: ${section.title}]\n${subContent}`;
  }).join('\n\n---\n\n');
};

const SYSTEM_INSTRUCTION = `
You are the Chief Onboarding Strategy Consultant for ${COMPANY_NAME}, a world-class digital agency.
Your persona is highly professional, sophisticated, and authoritative, yet approachable—resembling a partner at a top-tier consulting firm.
You embody the company's values of "Data-driven Insight" and "Creative Excellence".

Guidelines:
1. **Tone & Manner**: Use refined, formal Korean (e.g., "~합니다", "~하십시오"). Avoid casual language. Your tone should convey trust, expertise, and leadership.
2. **Role**: You are not just a chatbot; you are a strategic partner helping new talent integrate into a high-performance culture.
3. **Context Use**: Base your answers strictly on the provided [Onboarding Guide]. If information is missing, guide them professionally: "해당 내용은 현재 가이드에 명시되어 있지 않습니다. 리소스 관리 담당자에게 문의하시면 신속하게 안내받으실 수 있습니다."
4. **Style**: Be concise but insightful. Use bullet points for procedures. Avoid emojis; use clean formatting.

[Onboarding Guide]
${getContextString()}
`;

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `안녕하십니까. ${COMPANY_NAME}에 합류하신 것을 환영합니다.\n저는 귀하의 성공적인 온보딩을 지원할 Strategy Consultant입니다.\n\n업무 환경, 조직 문화, 또는 보안 규정과 관련하여 궁금한 사항이 있으시면 언제든지 문의해 주십시오. 최고의 성과를 낼 수 있도록 지원하겠습니다.`,
      timestamp: Date.now()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize chat session
  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Correcting model name to 'gemini-3-flash-preview' for basic text tasks
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          }
        });
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };

    initChat();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Correcting model name to 'gemini-3-flash-preview' for basic text tasks
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          }
        });
      }

      const response: GenerateContentResponse = await chatSessionRef.current.sendMessage({
        message: userText
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "시스템 응답 지연이 발생했습니다. 잠시 후 다시 시도해 주십시오.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "일시적인 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주십시오.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      
      // Reset chat session on error to be safe
      chatSessionRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="chat-fab"
        style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`chat-window ${!isOpen ? 'closed' : ''}`}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(10px)'
        }} className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(231,0,18,0.4)' }}>
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', letterSpacing: '0.02em' }}>FRUM AI</div>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>Strategic Consultant</div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ color: '#888', padding: '4px' }}>
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '24px'
              }}
            >
              <div style={{
                maxWidth: '90%',
                padding: '14px 18px',
                borderRadius: '18px',
                borderTopRightRadius: msg.role === 'user' ? '2px' : '18px',
                borderTopLeftRadius: msg.role === 'user' ? '18px' : '2px',
                background: msg.role === 'user' ? '#E70012' : '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user' ? '0 4px 20px rgba(231,0,18,0.3)' : '0 4px 20px rgba(0,0,0,0.2)',
                border: msg.role === 'user' ? 'none' : '1px solid #333'
              }}>
                {msg.text}
              </div>
              {msg.role === 'model' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', marginLeft: '4px', opacity: 0.6 }}>
                  <Sparkles size={12} color="#E70012" />
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Consultant</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="전략적 가이드가 필요하시면 문의해 주십시오."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.5',
                outline: 'none',
                resize: 'none',
                padding: '10px 0',
                maxHeight: '100px'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                color: input.trim() ? '#E70012' : '#333',
                transition: 'all 0.3s',
                padding: '10px',
                background: input.trim() ? 'rgba(231,0,18,0.1)' : 'transparent',
                borderRadius: '8px'
              }}
            >
              <Send size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
