import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { Users } from 'lucide-react';
import { VoiceCallBar } from '../voice/VoiceCallBar';

export const RoomMembersBar: React.FC = () => {
  const { room, activeMembers, socket } = useRoom();
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between text-xs select-none shadow-xs">
      {/* Left Room Info */}
      <div className="h-9 px-4 flex items-center space-x-3">
        <span className="font-bold text-slate-900 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{room?.name || 'Coding Room'}</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-indigo-700 font-bold border border-slate-200">
          CODE: {room?.roomCode}
        </span>
        <span className="text-[10px] text-slate-500 uppercase font-mono">{room?.language}</span>
      </div>

      {/* Voice Controls Bar */}
      {room && user && (
        <div className="border-t md:border-t-0 md:border-l border-slate-200">
          <VoiceCallBar
            socket={socket}
            roomId={room.id}
            currentUser={{ userId: user.id, name: user.name }}
            members={activeMembers}
          />
        </div>
      )}
    </div>
  );
};
