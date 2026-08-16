import React, { useState } from 'react';
import { 
  Eye, 
  Sparkles, 
  Search, 
  Image, 
  Music, 
  Film, 
  ArrowDown, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  FileCode2, 
  ShieldCheck, 
  Zap, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { AgentLogEntry } from '../types';

interface DagGraphViewerProps {
  currentPhase: number;
  activeAgentId?: string;
  logs: AgentLogEntry[];
  onSelectAgent?: (agentId: string) => void;
}

export const DagGraphViewer: React.FC<DagGraphViewerProps> = ({
  currentPhase,
  activeAgentId,
  logs,
  onSelectAgent,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getAgentStatus = (agentId: string) => {
    const log = logs.find((l) => l.agentId === agentId);
    if (!log) {
      if (currentPhase === 0) return 'idle';
      if (agentId === 'video_analyst' && currentPhase === 1) return 'running';
      if (['tiktok_strategist', 'yt_strategist', 'art_director', 'audio_director'].includes(agentId) && currentPhase === 2) return 'running';
      if (agentId === 'production_engineer' && currentPhase === 3) return 'running';
      return 'idle';
    }
    return log.status;
  };

  const getNodeDetails = (id: string) => {
    switch (id) {
      case 'video_analyst':
        return {
          name: '1. Multimodal Video Analyst',
          tool: 'GeminiVideoAnalysisTool (gemini-3.7-flash)',
          model: 'Gemini 3.7 Flash Multimodal',
          role: 'Perception Agent & Creative Director',
          desc: 'Performs frame-by-frame narrative breakdown, mood evaluation, tempo extraction (BPM), and viral retention triggers.',
          outputSchema: 'VideoAnalysisResult (Pydantic)',
          executionType: 'Sequential (Phase 1)',
        };
      case 'tiktok_strategist':
        return {
          name: '2. TikTok Search SEO & Viral Strategist',
          tool: 'TikTok 2026 Algorithm & SEO Engine',
          model: 'Gemini 3.7 Flash',
          role: 'Search SEO, Retention & Velocity Specialist',
          desc: 'Applies 2026 TikTok algorithm rules: search-intent query titles, sub-3s audio/visual matching hooks, 3-3-3 hashtag breakdown, and triple-tier CTAs.',
          outputSchema: 'TikTokContent (2026 SEO Pydantic)',
          executionType: 'Async Concurrency (Phase 2)',
        };
      case 'yt_strategist':
        return {
          name: '3. YouTube Shorts SEO & Retention Lead',
          tool: 'YouTube 2026 SEO & Retention Ranker',
          model: 'Gemini 3.7 Flash',
          role: 'Search SEO, Browse Features & AVD Retention Architect',
          desc: 'Applies 2026 YouTube Shorts rules: mobile sweet spot titles (25-45 chars), front-loaded descriptions, hashtag matrix (#Shorts + Niche + Search), and >100% AVD infinite loop engineering.',
          outputSchema: 'YouTubeShortsContent (2026 SEO Pydantic)',
          executionType: 'Async Concurrency (Phase 2)',
        };
      case 'art_director':
        return {
          name: '4. AI Thumbnail Art Director',
          tool: 'ThumbnailGeneratorTool (gemini-3-pro-image)',
          model: 'gemini-3-pro-image',
          role: 'Visual Composition & Click-Through Lead',
          desc: 'Engineers 3D visual composition prompts with dramatic rim-lighting and executes high-contrast image generation for 9:16 / 16:9 thumbnails via gemini-3-pro-image.',
          outputSchema: 'ThumbnailResult (Pydantic)',
          executionType: 'Async Concurrency (Phase 2)',
        };
      case 'audio_director':
        return {
          name: '5. Audio Maestro & Composer',
          tool: 'LyriaMusicGenTool (DeepMind Lyria)',
          model: 'Google DeepMind Lyria Music API',
          role: 'Soundtrack & Tempo Producer',
          desc: 'Translates video emotion, pacing, and BPM into rich musical prompts to synthesize dynamic background tracks.',
          outputSchema: 'MusicResult (Pydantic)',
          executionType: 'Async Concurrency (Phase 2)',
        };
      case 'production_engineer':
        return {
          name: '6. Post-Production Packaging Engineer',
          tool: 'VideoAudioMuxerTool (FFmpeg Audio Ducking)',
          model: 'Deterministic Python FFmpeg BaseTool',
          role: 'Media Packager & Muxing Coordinator',
          desc: 'Applies FFmpeg audio ducking filter (-filter_complex volume=0.22 amix) to merge background music with speech and packages deliverables.',
          outputSchema: 'MediaPackageOutput (Pydantic)',
          executionType: 'Sequential Assembly (Phase 3)',
        };
      default:
        return null;
    }
  };

  const activeDetails = selectedNode ? getNodeDetails(selectedNode) : null;

  return (
    <div id="dag-graph-view" className="w-full flex flex-col gap-6">
      
      {/* Top Architecture Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                CrewAI Multi-Agent Architecture DAG
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Directed Acyclic Graph Execution
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Cognitive Reasoning vs Deterministic Tool Separation
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Agents never manipulate media binaries directly. Specialized cognitive agents formulate strategies while deterministic tools (Gemini Multimodal, Imagen 3, Lyria, and FFmpeg) handle media synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Execution Flow</div>
              <div className="text-xs font-bold text-blue-600">
                1 Sequential → 4 Async Fan-Out → 1 Assembly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-10 relative overflow-x-auto shadow-xs">
        
        <div className="min-w-[900px] flex flex-col items-center gap-8 relative">

          {/* 1. INPUT MEDIA NODE */}
          <div className="flex flex-col items-center">
            <div className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center gap-3 border border-slate-800">
              <Film className="w-4 h-4 text-blue-400" />
              <span>Input Video / Picture Media Asset</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                H.264 / 4K
              </span>
            </div>
            <div className="w-0.5 h-8 bg-blue-400 my-1" />
          </div>

          {/* 2. PHASE 1: SEQUENTIAL INGESTION */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="text-xs uppercase tracking-widest text-blue-600 font-extrabold mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Phase 1: Ingestion (Sequential Perception)
            </div>

            <div
              onClick={() => {
                setSelectedNode('video_analyst');
                onSelectAgent?.('video_analyst');
              }}
              className={`w-full p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                selectedNode === 'video_analyst'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                  : getAgentStatus('video_analyst') === 'running'
                  ? 'bg-blue-50/40 border-blue-400 animate-pulse ring-2 ring-blue-500/20'
                  : getAgentStatus('video_analyst') === 'completed'
                  ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        1. Multimodal Video Analyst
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                        Director Persona
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tool: <code className="text-blue-600 font-mono font-bold">GeminiVideoAnalysisTool</code> (gemini-3.7-flash)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getAgentStatus('video_analyst') === 'completed' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                    </span>
                  )}
                  {getAgentStatus('video_analyst') === 'running' && (
                    <span className="flex items-center gap-1 text-xs text-blue-700 font-bold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 animate-pulse">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Ingesting
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* SHARED CONTEXT BRIDGE */}
            <div className="w-0.5 h-6 bg-slate-300 my-1" />
            <div className="px-5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900 shadow-2xs flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-blue-600" />
              <span>Structured Scene &amp; Mood Brief (Pydantic Context)</span>
            </div>
            <div className="w-0.5 h-6 bg-slate-300 my-1" />
          </div>

          {/* 3. PHASE 2: ASYNC FAN-OUT (PARALLEL CONCURRENCY) */}
          <div className="w-full flex flex-col items-center">
            <div className="text-xs uppercase tracking-widest text-emerald-700 font-extrabold mb-4 flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Phase 2: Parallel Async Fan-Out (<code className="font-mono text-emerald-800 font-bold">async_execution=True</code> • -70% Latency)
            </div>

            {/* 4 Parallel Nodes Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Agent 2: TikTok Copywriter */}
              <div
                onClick={() => {
                  setSelectedNode('tiktok_strategist');
                  onSelectAgent?.('tiktok_strategist');
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  selectedNode === 'tiktok_strategist'
                    ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                    : getAgentStatus('tiktok_strategist') === 'running'
                    ? 'bg-rose-50/40 border-rose-400 animate-pulse ring-2 ring-rose-400/20'
                    : getAgentStatus('tiktok_strategist') === 'completed'
                    ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                      Async Task 1
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">2. TikTok Viral Copywriter</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hooks, curiosity gaps &amp; trending hashtag stack.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">TikTokContent</span>
                  {getAgentStatus('tiktok_strategist') === 'completed' ? (
                    <span className="text-emerald-600 font-bold">Ready</span>
                  ) : (
                    <span className="text-slate-400">Standby</span>
                  )}
                </div>
              </div>

              {/* Agent 3: YouTube Shorts SEO */}
              <div
                onClick={() => {
                  setSelectedNode('yt_strategist');
                  onSelectAgent?.('yt_strategist');
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  selectedNode === 'yt_strategist'
                    ? 'bg-red-50/70 border-red-500 ring-2 ring-red-500/20 shadow-sm'
                    : getAgentStatus('yt_strategist') === 'running'
                    ? 'bg-red-50/40 border-red-400 animate-pulse ring-2 ring-red-400/20'
                    : getAgentStatus('yt_strategist') === 'completed'
                    ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                      Async Task 2
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">3. YouTube Shorts SEO Lead</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    High-CTR title (&lt;60c), timestamps &amp; keywords.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">ShortsContent</span>
                  {getAgentStatus('yt_strategist') === 'completed' ? (
                    <span className="text-emerald-600 font-bold">Ready</span>
                  ) : (
                    <span className="text-slate-400">Standby</span>
                  )}
                </div>
              </div>

              {/* Agent 4: Visual Art Director */}
              <div
                onClick={() => {
                  setSelectedNode('art_director');
                  onSelectAgent?.('art_director');
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  selectedNode === 'art_director'
                    ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                    : getAgentStatus('art_director') === 'running'
                    ? 'bg-purple-50/40 border-purple-400 animate-pulse ring-2 ring-purple-400/20'
                    : getAgentStatus('art_director') === 'completed'
                    ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 font-bold">
                      <Image className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                      Async Task 3
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">4. Art Director (Visuals)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tool: <code className="text-purple-700 font-mono font-bold">ThumbnailTool</code> (Imagen 3)
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Thumbnail.png</span>
                  {getAgentStatus('art_director') === 'completed' ? (
                    <span className="text-emerald-600 font-bold">Ready</span>
                  ) : (
                    <span className="text-slate-400">Standby</span>
                  )}
                </div>
              </div>

              {/* Agent 5: Audio Maestro */}
              <div
                onClick={() => {
                  setSelectedNode('audio_director');
                  onSelectAgent?.('audio_director');
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  selectedNode === 'audio_director'
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                    : getAgentStatus('audio_director') === 'running'
                    ? 'bg-amber-50/40 border-amber-400 animate-pulse ring-2 ring-amber-400/20'
                    : getAgentStatus('audio_director') === 'completed'
                    ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                      <Music className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      Async Task 4
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">5. Audio Maestro (Music)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tool: <code className="text-amber-700 font-mono font-bold">LyriaMusicGenTool</code> (Lyria API)
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Soundtrack.mp3</span>
                  {getAgentStatus('audio_director') === 'completed' ? (
                    <span className="text-emerald-600 font-bold">Ready</span>
                  ) : (
                    <span className="text-slate-400">Standby</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 4. PHASE 3: ASSEMBLY & PACKAGING */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="w-0.5 h-6 bg-slate-300 my-1" />
            <div className="text-xs uppercase tracking-widest text-blue-600 font-extrabold mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Phase 3: Assembly &amp; Muxing (Sequential Integration)
            </div>

            <div
              onClick={() => {
                setSelectedNode('production_engineer');
                onSelectAgent?.('production_engineer');
              }}
              className={`w-full p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                selectedNode === 'production_engineer'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                  : getAgentStatus('production_engineer') === 'running'
                  ? 'bg-blue-50/40 border-blue-400 animate-pulse ring-2 ring-blue-400/20'
                  : getAgentStatus('production_engineer') === 'completed'
                  ? 'bg-slate-50 border-emerald-500/60 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        6. Post-Production Packaging Engineer
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                        Deterministic Muxer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tool: <code className="text-blue-600 font-mono font-bold">VideoAudioMuxerTool</code> (FFmpeg Audio Ducking @ 22% Vol)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getAgentStatus('production_engineer') === 'completed' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-300 my-1" />
          </div>

          {/* 5. FINAL EXPORT BUNDLE */}
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">FINAL DELIVERABLES EXPORT PACKAGE</h4>
                  <p className="text-xs text-slate-500">
                    Ready for automated publishing, API webhooks, or creator dashboard review.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                  • Ducked MP4 Video
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                  • High-CTR PNG Thumbnail
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                  • TikTok Metadata
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                  • YouTube Shorts SEO
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Selected Node Details Drawer */}
      {activeDetails && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeDetails.name}</h3>
                <span className="text-xs text-blue-600 font-medium">{activeDetails.role}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-all"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">Attached Tool</span>
              <code className="text-emerald-700 font-mono font-bold break-all">{activeDetails.tool}</code>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">Underlying AI Model</span>
              <span className="text-blue-700 font-bold">{activeDetails.model}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">Pydantic Validation</span>
              <code className="text-amber-700 font-mono font-bold">{activeDetails.outputSchema}</code>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">Execution Schedule</span>
              <span className="text-slate-800 font-bold">{activeDetails.executionType}</span>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Agent Functional Directive: </span>
            {activeDetails.desc}
          </div>
        </div>
      )}

    </div>
  );
};
