import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, PhoneOff, Users, Radio } from 'lucide-react';
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
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Radio className={`w-4 h-4 ${inCall ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
          <span>Live Audio Room</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-500" />
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
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-bounce" />}
              <span>{isMuted ? 'Mic Off' : 'Speaking'}</span>
            </button>

            <button
              onClick={toggleCall}
              className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Voice</span>
            </button>
          </>
        ) : (
          <button
            onClick={toggleCall}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-cyan-600/20"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Join Audio Room</span>
          </button>
        )}
      </div>
    </div>
  );
};
