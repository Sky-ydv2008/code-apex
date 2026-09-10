import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { Users, Crown, Shield } from 'lucide-react';

export const RoomMembersBar: React.FC = () => {
  const { room, activeMembers } = useRoom();

  return (
    <div className="h-9 px-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs select-none">
      {/* Room Details */}
      <div className="flex items-center space-x-3">
        <span className="font-bold text-slate-200 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{room?.name || 'Coding Room'}</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-indigo-300 font-semibold border border-slate-700">
          CODE: {room?.roomCode}
        </span>
        <span className="text-[10px] text-slate-500 uppercase font-mono">{room?.language}</span>
      </div>

      {/* Online Active Members Avatars */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-medium mr-1">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{activeMembers.length} Online</span>
        </div>

        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {activeMembers.map((member) => {
            const isOwner = member.userId === room?.ownerId;
            return (
              <div
                key={member.socketId}
                className="relative group"
                title={`${member.name} ${isOwner ? '(Owner)' : '(Editor)'}`}
              >
                <img
                  src={member.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`}
                  alt={member.name}
                  className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950"></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
