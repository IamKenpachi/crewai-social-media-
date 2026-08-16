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
  CheckCircle2
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
}) => {
  const currentModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const currentModelName = currentModelObj?.name || 'Gemini 3.7 Flash';

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-700/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>CREWAI</span>
                <span className="text-blue-600 font-light tracking-normal">STUDIO</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                  v2.4 Production
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Gemini Multimodal • Lyria Audio • Imagen 3 • FFmpeg Ducking
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav id="nav-tab-container" className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="nav-tab-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dag'
                ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Architecture DAG</span>
          </button>

          <button
            id="nav-tab-deliverables"
            onClick={() => setActiveTab('deliverables')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'deliverables'
                ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Export Deliverables</span>
            {hasResults && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            id="nav-tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Code</span>
          </button>

          <button
            id="nav-tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>System Guide</span>
          </button>
        </nav>

        {/* Live Status & API Parameters Button */}
        <div className="flex items-center gap-2.5">
          {/* Parameter Settings Icon & Model Dropdown Trigger */}
          <button
            id="btn-api-parameters"
            onClick={onOpenApiSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300 cursor-pointer group"
            title="Configure Gemini API Key & Model parameters"
          >
            <div className="relative">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform" />
              {hasCustomKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-slate-700">
                {currentModelName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100/60 text-blue-700 font-bold">
                {hasCustomKey ? 'Custom Key' : 'Parameters'}
              </span>
            </div>
          </button>

          {/* Metric Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>6 Agents</span>
          </div>
        </div>

      </div>
    </header>
  );
};
