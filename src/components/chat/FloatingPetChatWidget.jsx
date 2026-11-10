import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Bot, Store, X, Send, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { chatService } from '../../services/chatService';

export const FloatingPetChatWidget = () => {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const endRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [channelType, setChannelType] = useState('AI'); // 'AI' | 'STORE'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Chỉ hiển thị cho Khách hàng và không hiển thị khi đang ở trang /patient/chat hoặc /admin
  const shouldShow =
    isAuthenticated &&
    role === ROLES.PATIENT &&
    location.pathname !== '/patient/chat' &&
    !location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isOpen || !shouldShow) return;
    chatService
      .getMessages(channelType)
      .then((res) => setMessages(res.data || []))
      .catch(() => {});
  }, [isOpen, channelType, shouldShow]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!shouldShow) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      if (channelType === 'AI') {
        const res = await chatService.askAiConsultant({ question: text });
        setMessages((prev) => [...prev, res.data.userMessage, res.data.aiMessage]);
      } else {
        const res = await chatService.sendMessage({ channelType: 'STORE', content: text });
        setMessages((prev) => [...prev, res.data.userMessage, res.data.replyMessage]);
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="w-[340px] sm:w-[370px] h-[480px] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🐾</span>
              <div>
                <h4 className="text-xs font-bold">PawCare Chat & AI Tư vấn</h4>
                <p className="text-[10px] text-white/85">Hỗ trợ nhanh 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Mở trang Chat đầy đủ"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/patient/chat');
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Đóng"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 p-1 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setChannelType('AI')}
              className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                channelType === 'AI'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Trợ lý AI</span>
            </button>
            <button
              type="button"
              onClick={() => setChannelType('STORE')}
              className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                channelType === 'STORE'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Nhắn cho Quán</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <div key={msg.id || msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                      isUser
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : msg.sender === 'AI'
                        ? 'bg-indigo-50 border border-indigo-200 text-slate-800 rounded-bl-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'AI' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 mb-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Trợ lý AI PawCare</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.content.replace(/\*\*/g, '')}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={channelType === 'AI' ? 'Hỏi AI chăm sóc thú cưng...' : 'Nhắn tin cho quán...'}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-colors"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-4 py-3 text-white shadow-xl hover:scale-105 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Nhắn Quán & Tư vấn AI</span>
        </button>
      )}
    </div>
  );
};

