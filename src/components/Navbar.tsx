import React from 'react';
import { 
  Sparkles, 
  Workflow, 
  Package, 
  Code2, 
  BookOpen, 
  Cpu,
  Layers,
  SlidersHorizontal,
  KeyRound,
  CheckCircle2,
  Moon,
  Sun,
  History,
  Command,
  HelpCircle
} from 'lucide-react';
import { AVAILABLE_MODELS } from './ApiSettingsModal';

interface NavbarProps {
  activeTab: 'studio' | 'dag' | 'deliverables' | 'code' | 'guide';
  setActiveTab: (tab: 'studio' | 'dag' | 'deliverables' | 'code' | 'guide') => void;
  isRunning: boolean;
  hasResults: boolean;
  latencySaved?: number;
  selectedModel: string;
  hasCustomKey: boolean;
  onOpenApiSettings: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenHistory?: () => void;
  onOpenShortcuts?: () => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  hasResults,
  latencySaved,
  selectedModel,
  hasCustomKey,
  onOpenApiSettings,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenHistory,
  onOpenShortcuts,
  savedCount = 0
}) => {
  const currentModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const currentModelName = currentModelObj?.name || 'Gemini 3.7 Flash';

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-700/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>CREWAI</span>
                <span className="text-blue-600 dark:text-blue-400 font-light tracking-normal">STUDIO</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold border border-blue-200 dark:border-blue-800">
                  v2.6 2026
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Multimodal Ingestion • OpusClip Virality • Submagic Subtitles • Lyria
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav id="nav-tab-container" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <button
            id="nav-tab-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Runner</span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            )}
          </button>

          <button
            id="nav-tab-dag"
            onClick={() => setActiveTab('dag')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dag'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Interactive DAG</span>
          </button>

          <button
            id="nav-tab-deliverables"
            onClick={() => setActiveTab('deliverables')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'deliverables'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Deliverables</span>
            {hasResults && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            id="nav-tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Code</span>
          </button>

          <button
            id="nav-tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
        </nav>

        {/* Right Tools Bar */}
        <div className="flex items-center gap-2">
          
          {/* History Modal Trigger */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Saved Projects History"
            >
              <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Runs</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts Cheatsheet (Press ?)"
            >
              <Command className="w-4 h-4" />
            </button>
          )}

          {/* Dark / Light Mode Switcher */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* Model Parameters Modal Trigger */}
          <button
            id="btn-api-parameters"
            onClick={onOpenApiSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer group"
            title="Configure Gemini API Key & Parameters"
          >
            <div className="relative">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
              {hasCustomKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {currentModelName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                {hasCustomKey ? 'Custom Key' : 'Config'}
              </span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
