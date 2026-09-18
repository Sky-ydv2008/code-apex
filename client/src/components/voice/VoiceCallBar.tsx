import React, { useState } from 'react';
import { Mic, MicOff, PhoneOff, Users, Radio } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VoiceCallBarProps {
  socket: Socket | null;
  roomId: string;
  currentUser: { userId: string; name: string };
  members: Array<{ socketId: string; userId: string; name: string; isMuted?: boolean }>;
}

export const VoiceCallBar: React.FC<VoiceCallBarProps> = ({
  socket,
  roomId,
  currentUser,
  members,
}) => {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleCall = () => {
    if (!inCall) {
      setInCall(true);
      setIsMuted(false);
      if (socket) {
        socket.emit('voice:state', { roomId, isMuted: false });
      }
    } else {
      setInCall(false);
      setIsMuted(true);
      if (socket) {
        socket.emit('voice:state', { roomId, isMuted: true });
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (socket) {
      socket.emit('voice:state', { roomId, isMuted: nextMuted });
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
          <Radio className={`w-4 h-4 ${inCall ? 'animate-pulse text-emerald-600' : 'text-slate-400'}`} />
          <span>Live Audio Room</span>
        </div>

        <span className="text-slate-300">|</span>

        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{members.length} Connected</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {inCall ? (
          <>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                isMuted
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-amber-600" /> : <Mic className="w-4 h-4 text-emerald-600 animate-bounce" />}
              <span>{isMuted ? 'Mic Off' : 'Speaking'}</span>
            </button>

            <button
              onClick={toggleCall}
              className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <PhoneOff className="w-4 h-4 text-rose-600" />
              <span>Leave Voice</span>
            </button>
          </>
        ) : (
          <button
            onClick={toggleCall}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Join Audio Room</span>
          </button>
        )}
      </div>
    </div>
  );
};
