import React from 'react';
import { X, Command, Sparkles, Play, Download, Sliders, Layers, Layout, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', label: 'Play / Pause Video & Soundtrack', icon: Play },
    { key: 'Ctrl + Enter', label: 'Kickoff CrewAI Multi-Agent Pipeline', icon: Sparkles },
    { key: '1', label: 'Switch to Studio Runner Tab', icon: Layout },
    { key: '2', label: 'Switch to Architecture DAG Tab', icon: Layers },
    { key: '3', label: 'Switch to Export Deliverables Tab', icon: Download },
    { key: '4', label: 'Switch to Python Code Tab', icon: Command },
    { key: '5', label: 'Switch to System Architecture Guide', icon: HelpCircle },
    { key: 'T', label: 'Cycle Subtitle Style (Hormozi / MrBeast / Neon / Minimal)', icon: Sliders },
    { key: 'E', label: 'Trigger Video Export (with Muted Original Audio + Music)', icon: Download },
    { key: '?', label: 'Open Keyboard Shortcuts Cheatsheet', icon: HelpCircle }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Studio Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Boost your workflow with instant hotkeys</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => {
            const Icon = sc.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{sc.label}</span>
                </div>
                <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close Cheatsheet
          </button>
        </div>

      </div>
    </div>
  );
};
