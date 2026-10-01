import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, AtSign } from 'lucide-react';
import { ChatMessage, User as UserType } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: UserType;
  users: UserType[];
  onSendMessage: (texto: string) => void;
  onSwitchUser: (userId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentUser,
  users,
  onSendMessage,
  onSwitchUser
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleInsertMention = (nome: string) => {
    setInputText(prev => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}@${nome} `);
  };

  return (
    <div className="rounded-2xl bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E293B] overflow-hidden shadow-sm flex flex-col h-[calc(100vh-160px)] min-h-[520px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Chat Geral — PULSO95
            </h2>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {users.filter(u => u.status === 'ativo').length} membro(s) ativo(s): {users.filter(u => u.status === 'ativo').map(u => u.nome).join(', ')}
              </span>
            </span>
          </div>
        </div>

        {/* Sender Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 px-2 font-medium">Enviar como:</span>
          {users.map(u => {
            const isSelected = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {u.nome}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.autorId === currentUser.id;
          const isMaster = msg.autorRole?.includes('Master');

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <UserAvatar
                name={msg.autorNome}
                avatarUrl={msg.autorAvatar}
                size="sm"
              />

              <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px]">
                  <span className={`font-bold ${isMaster ? 'text-amber-400' : 'text-blue-400'}`}>
                    {msg.autorNome}
                  </span>
                  <span className="text-slate-500">({msg.autorRole})</span>
                  <span className="text-slate-500 font-mono tabular-nums">{msg.dataHora}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.texto}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Mention helper buttons (Section 48) */}
      <div className="px-4 py-1.5 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-2 text-xs">
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
          <AtSign className="w-3 h-3 text-blue-400" />
          <span>Mencionar:</span>
        </span>
        {users.map(u => (
          <button
            key={u.id}
            type="button"
            onClick={() => handleInsertMention(u.nome)}
            className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            @{u.nome}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Digite uma mensagem como ${currentUser.nome}...`}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
