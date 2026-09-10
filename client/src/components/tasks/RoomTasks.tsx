import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { CheckSquare, Plus, Square, CheckSquare2 } from 'lucide-react';

export const RoomTasks: React.FC = () => {
  const { tasks, addTask, toggleTask } = useRoom();
  const [taskTitle, setTaskTitle] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask(taskTitle.trim());
    setTaskTitle('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/80 select-none border-b border-slate-800">
      {/* Header */}
      <div className="h-8 border-b border-slate-800 px-3 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Room Goals</span>
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">
          {tasks.filter((t) => t.completed).length}/{tasks.length} Done
        </span>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="p-2 border-b border-slate-800/80 flex items-center space-x-1.5">
        <input
          type="text"
          placeholder="Add team task or todo..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
          title="Add Task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 p-2 overflow-y-auto space-y-1">
        {tasks.length === 0 ? (
          <p className="text-center text-xs text-slate-600 italic py-4">No tasks defined for this room yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id, !task.completed)}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                task.completed ? 'bg-slate-900/40 text-slate-500 line-through' : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {task.completed ? (
                <CheckSquare2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              )}
              <span className="truncate flex-1">{task.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
