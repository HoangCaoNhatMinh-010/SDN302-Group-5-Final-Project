import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  Store,
  Sparkles,
  CalendarPlus,
  MessageCircle,
  Loader2,
  Search,
  ChevronLeft,
  User,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { familyMemberService } from '../../services/familyMemberService';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb, Button, LoadingState } from '../../components/common';

const AI_QUICK_PROMPTS = [
  'Tư vấn gói Spa cho bé?',
  'Bé rụng lông nhiều làm sao?',
  'Lịch tiêm phòng cho bé?',
  'Bảng giá & phí PayOS 100đ?',
];

export const PetChatAndAiPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const messagesContainerRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [showMobileList, setShowMobileList] = useState(false);

  const [messages, setMessages] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load contacts and pets on mount
  useEffect(() => {
    const init = async () => {
      setIsLoadingContacts(true);
      try {
        const [contactsRes, petsRes] = await Promise.all([
          chatService.getContacts(),
          familyMemberService.getFamilyMembers().catch(() => ({ data: [] })),
        ]);
        const contactList = contactsRes.data || [];
        setContacts(contactList);
        if (contactList.length > 0) {
          setActiveContact(contactList[0]);
        }

        const petList = petsRes.data || [];
        setPets(petList);
        if (petList.length > 0) {
          setSelectedPetId(petList[0].id || petList[0]._id);
        }
      } catch (err) {
        toast.error('Không thể tải danh sách trò chuyện.');
      } finally {
        setIsLoadingContacts(false);
      }
    };
    init();
  }, []);

  // Load messages when activeContact changes
  useEffect(() => {
    if (!activeContact) return;
    const fetchMsgs = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await chatService.getMessages(activeContact.channelType, activeContact.staffId);
        setMessages(res.data || []);
      } catch (err) {
        toast.error('Không thể tải lịch sử tin nhắn.');
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMsgs();
  }, [activeContact?.key]);

  // Smooth scroll inside message container only (does not jump outer page)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoadingMessages]);

  const handleSend = async (customText = null) => {
    const text = (customText !== null ? customText : inputText).trim();
    if (!text || !activeContact || isSending) return;

    if (customText === null) setInputText('');
    setIsSending(true);

    try {
      let newLastText = text;
      if (activeContact.channelType === 'AI') {
        const res = await chatService.askAiConsultant({
          question: text,
          petId: selectedPetId || null,
        });
        const { userMessage, aiMessage } = res.data;
        setMessages((prev) => [...prev, userMessage, aiMessage]);
        newLastText = aiMessage.content.slice(0, 60) + '...';
      } else {
        const res = await chatService.sendMessage({
          channelType: activeContact.channelType,
          staffId: activeContact.staffId,
          content: text,
        });
        const { userMessage, replyMessage } = res.data;
        setMessages((prev) => [...prev, userMessage, replyMessage]);
        newLastText = replyMessage.content.slice(0, 60) + '...';
      }

      // Update preview text on left sidebar
      setContacts((prev) =>
        prev.map((c) => (c.key === activeContact.key ? { ...c, lastMessage: newLastText } : c))
      );
    } catch (err) {
      toast.error(err.message || 'Gửi tin nhắn thất bại.');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageContent = (content) => {
    return (content || '').split('\n').map((line, idx) => {
      const trimmed = line.trim();
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const isHeading = trimmed.startsWith('###') || trimmed.startsWith('##');
      const displayParts = isHeading
        ? line.replace(/^#+\s*/, '').split(/(\*\*.*?\*\*)/g)
        : parts;

      return (
        <p
          key={idx}
          className={`${idx > 0 ? 'mt-1.5' : ''} ${
            isHeading ? 'font-bold text-slate-900 text-[13px] pt-1' : ''
          }`}
        >
          {displayParts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.roleTitle?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Nhắn tin Quán / Chuyên viên & Tư vấn AI' }]} />

      {/* Main Fixed-Height Chat Window */}
      <div className="flex h-[calc(100vh-10.5rem)] min-h-[520px] rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {/* LEFT COLUMN: Contact List */}
        <div
          className={`${
            showMobileList ? 'flex w-full' : 'hidden md:flex md:w-80'
          } flex-shrink-0 flex-col h-full min-h-0 border-r border-slate-200 bg-slate-50/70`}
        >
          {/* Left Header & Search */}
          <div className="flex-shrink-0 p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <span>Kênh Trò Chuyện</span>
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {contacts.length} kênh
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Tìm chuyên viên, AI, quán..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Scrollable Contact Items */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {isLoadingContacts ? (
              <div className="p-6">
                <LoadingState text="Đang tải danh sách..." />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Không tìm thấy kênh chat phù hợp.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isActive = activeContact?.key === contact.key;
                const isAi = contact.channelType === 'AI';
                const isStore = contact.channelType === 'STORE';

                return (
                  <button
                    key={contact.key}
                    type="button"
                    onClick={() => {
                      setActiveContact(contact);
                      setShowMobileList(false);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-amber-50 border-l-4 border-amber-500'
                        : 'hover:bg-white border-l-4 border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {isAi ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                          <Bot className="w-5 h-5" />
                        </div>
                      ) : isStore ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Store className="w-5 h-5" />
                        </div>
                      ) : (
                        <img
                          src={
                            contact.avatar ||
                            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={contact.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{contact.name}</span>
                        {isAi && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold flex-shrink-0">
                            Gemini AI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-amber-800 truncate">{contact.roleTitle}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Conversation */}
        <div
          className={`${
            showMobileList ? 'hidden md:flex' : 'flex'
          } flex-1 min-w-0 flex-col h-full min-h-0 bg-white`}
        >
          {/* Fixed Chat Header */}
          {activeContact && (
            <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {activeContact.channelType === 'AI' ? (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : activeContact.channelType === 'STORE' ? (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                ) : (
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{activeContact.name}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{activeContact.roleTitle}</p>
                </div>
              </div>

              {/* Pet Selector for Personalized AI */}
              {activeContact.channelType === 'AI' && pets.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                    Hồ sơ bé:
                  </span>
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {pets.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.petType === 'Mèo' ? '🐱' : '🐶'} {p.name} ({p.weight || 3.5}kg)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Scrollable Messages Feed (Can smoothly scroll up/down!) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60"
          >
            {isLoadingMessages ? (
              <LoadingState text="Đang tải lịch sử trò chuyện..." />
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'USER';
                const isAi = msg.sender === 'AI';
                const timeStr = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={msg.id || msg._id}
                    className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs shadow-xs ${
                          isAi
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                            : 'bg-gradient-to-br from-amber-500 to-rose-500'
                        }`}
                      >
                        {isAi ? <Bot className="w-4 h-4" /> : <Store className="w-3.5 h-3.5" />}
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-amber-600 text-white rounded-br-sm'
                          : isAi
                          ? 'bg-white border border-indigo-200 text-slate-800 rounded-bl-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={`font-bold text-[11px] flex items-center gap-1 ${
                            isUser
                              ? 'text-amber-100'
                              : isAi
                              ? 'text-indigo-700'
                              : 'text-amber-800'
                          }`}
                        >
                          {isAi && <Sparkles className="w-3 h-3" />}
                          {isUser ? 'Bạn' : msg.senderName}
                        </span>
                        {timeStr && (
                          <span className={`text-[10px] ${isUser ? 'text-amber-100/80' : 'text-slate-400'}`}>
                            {timeStr}
                          </span>
                        )}
                      </div>

                      <div className="break-words">{renderMessageContent(msg.content)}</div>

                      {/* Suggested Service CTA Card */}
                      {isAi && msg.suggestedServiceName && (
                        <div className="mt-3 pt-2.5 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-2 bg-indigo-50/50 -mx-2 px-2.5 py-2 rounded-xl">
                          <span className="text-[11px] font-bold text-indigo-900">
                            ✨ Gợi ý: {msg.suggestedServiceName}
                          </span>
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                            onClick={() =>
                              navigate('/patient/book-appointment', {
                                state: {
                                  petId: selectedPetId,
                                  serviceId: msg.suggestedServiceId,
                                },
                              })
                            }
                            className="text-[11px] px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Đặt lịch ngay
                          </Button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>
                  {activeContact?.channelType === 'AI'
                    ? 'Gemini AI đang phân tích và soạn tư vấn...'
                    : 'Đang gửi tin nhắn...'}
                </span>
              </div>
            )}
          </div>

          {/* Quick AI Prompts (Wrapped cleanly, no ugly horizontal scrollbar) */}
          {activeContact?.channelType === 'AI' && (
            <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Hỏi nhanh:</span>
              {AI_QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSend(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200/80 transition-colors shadow-2xs disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Fixed Bottom Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex-shrink-0 p-3.5 border-t border-slate-200 bg-white flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              placeholder={
                activeContact?.channelType === 'AI'
                  ? 'Hỏi Trợ lý AI về chăm sóc lông, tắm spa, tiêm phòng cho bé...'
                  : `Nhắn tin cho ${activeContact?.name || 'Quán'}...`
              }
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isSending}
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white px-4 flex-shrink-0"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
