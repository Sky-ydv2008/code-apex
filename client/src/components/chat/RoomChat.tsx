import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { MessageSquare, Send } from 'lucide-react';

export const RoomChat: React.FC = () => {
  const { messages, sendChatMessage } = useRoom();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/80 select-none">
      {/* Header */}
      <div className="h-8 border-b border-slate-800 px-3 bg-slate-900/60 flex items-center space-x-2">
        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Team Chat</span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-600 italic py-6">No chat messages yet. Start conversation!</p>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex space-x-2 text-xs">
                <img
                  src={msg.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user?.name || 'User'}`}
                  alt={msg.user?.name}
                  className="w-6 h-6 rounded-full border border-slate-700 bg-slate-800 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span className="font-semibold text-slate-200 text-[11px]">{msg.user?.name || 'Member'}</span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800/60 break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Send message to room..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
