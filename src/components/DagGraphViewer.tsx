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
  Info,
  Plus,
  Wand2,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Sliders,
  X,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Code2
} from 'lucide-react';
import { AgentLogEntry, CustomAgentConfig } from '../types';
import { AVAILABLE_MODELS } from './ApiSettingsModal';

interface DagGraphViewerProps {
  currentPhase: number;
  activeAgentId?: string;
  logs: AgentLogEntry[];
  onSelectAgent?: (agentId: string) => void;
  apiKey?: string;
}

const DEFAULT_AGENTS: CustomAgentConfig[] = [
  {
    id: 'video_analyst',
    name: '1. Multimodal Narrative Analyst',
    role: 'Principal Video Perception & Clip Director',
    goal: 'Deconstruct raw media into second-by-second narrative beats, identify the 1.5s hook, and segment 3 viral clips with 1-100 scores.',
    backstory: 'Veteran film editor and video data scientist trained on millions of hours of viral social media analytics. Specializes in 0-3s retention gates and emotional climax detection.',
    task_description: 'Analyze input frames, extract color palette, detect BPM tempo, segment 3 distinct high-retention clips, and generate synchronized karaoke subtitles.',
    expected_output: 'VideoAnalysisResult with ExtractedClip[] and SubtitleLine[] (Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.2,
    tools: ['GeminiVideoAnalysisTool', 'KaraokeSubtitleEngine'],
    phase: 1,
    isEnabled: true,
    executionType: 'sequential'
  },
  {
    id: 'tiktok_strategist',
    name: '2. TikTok Search SEO & Viral Strategist',
    role: 'Search SEO, Retention & Velocity Specialist',
    goal: 'Craft high-velocity TikTok content packages utilizing 2026 TikTok Search Engine intent, sub-3s auditory pattern interrupts, and 3-3-3 hashtags.',
    backstory: 'Growth architect specializing in the 2026 TikTok algorithm where TikTok operates as a primary search engine. Enforces spoken keyword matching and triple-tier CTAs.',
    task_description: 'Formulate search query title, 3 hook variations, 3-3-3 hashtag strategy (Trending, Niche, Content), and triple-tier conversion callouts.',
    expected_output: 'TikTokContent (2026 SEO Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.7,
    tools: ['TikTokSEOEngine', 'HashtagMatrixOptimizer'],
    phase: 2,
    isEnabled: true,
    executionType: 'async_fanout'
  },
  {
    id: 'yt_strategist',
    name: '3. YouTube Shorts SEO & AVD Architect',
    role: 'Search SEO, Browse Features & AVD Retention Lead',
    goal: 'Maximize Click-Through Rate (CTR) and Average View Duration (AVD > 100%) through front-loaded titles and infinite loop bridges.',
    backstory: 'Specialist in YouTube recommendation systems (Browse vs Shorts Shelf). Optimizes for the 25-45 character mobile title sweet spot and re-watch loops.',
    task_description: 'Generate frontloaded mobile title, SEO description with takeaways, infinite loop transition cues, and search ranking tags.',
    expected_output: 'YouTubeShortsContent (2026 SEO Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.6,
    tools: ['YouTubeMetadataEngine', 'AVDRetentionRanker'],
    phase: 2,
    isEnabled: true,
    executionType: 'async_fanout'
  },
  {
    id: 'art_director',
    name: '4. AI Thumbnail Art Director',
    role: 'Senior Viral Visual Strategist & AI Art Director',
    goal: 'Engineer high-CTR (12-18%+) thumbnail prompts and visual manifests using the Six-Slot Formula, selective vibrancy, and mobile safe zones.',
    backstory: 'Creative director with over 500M+ thumbnail views. Expert in the Six-Slot Prompt Architecture, cognitive curiosity gaps, and 3-element composition.',
    task_description: 'Construct 3 A/B/C thumbnail archetypes (Emotion Shockwave, Curiosity Gap, Minimalist Punch) with six-slot prompt slots and 5-pillar scorecard.',
    expected_output: 'ThumbnailResult with ThumbnailVariant[] and Scorecard (Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.5,
    tools: ['SixSlotPromptArchitect', 'gemini-3-pro-image'],
    phase: 2,
    isEnabled: true,
    executionType: 'async_fanout'
  },
  {
    id: 'audio_director',
    name: '5. Audio Maestro & Sound Producer',
    role: 'Sonic Branding & Audio Synchronization Maestro',
    goal: 'Compose high-energy, emotionally resonant musical prompts and arrangement blueprints that match the video BPM and climax drop.',
    backstory: 'Film score composer and sound designer for viral trailers. Translates visual pacing into exact musical parameters (BPM, analog instrumentation, bass drops).',
    task_description: 'Synthesize Lyria audio conditioning prompt and procedural arrangement curve with dynamic ducking level.',
    expected_output: 'MusicResult (Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.4,
    tools: ['LyriaMusicTool', 'WebAudioSynthesizer'],
    phase: 2,
    isEnabled: true,
    executionType: 'async_fanout'
  },
  {
    id: 'production_engineer',
    name: '6. Post-Production Packaging Engineer',
    role: 'Lead Media Systems Engineer & FFmpeg Orchestrator',
    goal: 'Package and validate all agent outputs into a unified manifest with FFmpeg audio ducking, burned-in subtitles, and execution telemetry.',
    backstory: 'Media systems architect ensuring broadcast-grade file compliance, zero audio clipping, and seamless client-side MP4 container rendering.',
    task_description: 'Render ducked audio mix (original audio muted), burn animated karaoke subtitles, and assemble final deliverables package.',
    expected_output: 'MediaPackageOutput (Pydantic)',
    model: 'gemini-3.7-flash',
    temperature: 0.1,
    tools: ['FFmpegAudioDucker', 'CanvasSubtitleBurner'],
    phase: 3,
    isEnabled: true,
    executionType: 'sequential'
  }
];

export const DagGraphViewer: React.FC<DagGraphViewerProps> = ({
  currentPhase,
  activeAgentId,
  logs,
  onSelectAgent,
  apiKey = ''
}) => {
  const [agents, setAgents] = useState<CustomAgentConfig[]>(DEFAULT_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id || null);
  const [isPromptFlowOpen, setIsPromptFlowOpen] = useState<boolean>(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState<boolean>(false);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isGeneratingFlow, setIsGeneratingFlow] = useState<boolean>(false);
  const [copiedPython, setCopiedPython] = useState<boolean>(false);

  // Active selected agent for inspector
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

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

  const handleToggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, isEnabled: !a.isEnabled } : a));
  };

  const handleUpdateActiveAgent = (field: keyof CustomAgentConfig, value: any) => {
    if (!selectedAgentId) return;
    setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, [field]: value } : a));
  };

  // Generate Python CrewAI script from current agent topology
  const generateCrewAiPythonScript = () => {
    const enabledAgents = agents.filter(a => a.isEnabled);
    return `# =========================================================================
# CrewAI Studio 2026: Autonomous Multi-Agent Production Pipeline
# Generated from Visual DAG Architecture
# =========================================================================

from crewai import Agent, Crew, Process, Task
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List, Optional

# Initialize Primary Gemini Reasoning Engine
llm = ChatGoogleGenerativeAI(
    model="${activeAgent?.model || 'gemini-3.7-flash'}",
    temperature=0.4
)

# -------------------------------------------------------------------------
# Agent Definitions (Grounded in the 80/20 Task-to-Agent Rule)
# -------------------------------------------------------------------------
${enabledAgents.map((a) => `
${a.id}_agent = Agent(
    role="${a.role}",
    goal="${a.goal.replace(/"/g, '\\"')}",
    backstory="""${a.backstory.replace(/"/g, '\\"')}""",
    verbose=True,
    allow_delegation=False,
    llm=ChatGoogleGenerativeAI(model="${a.model}", temperature=${a.temperature})
)`).join('\n')}

# -------------------------------------------------------------------------
# Task Specifications with Strict Pydantic Constraints
# -------------------------------------------------------------------------
${enabledAgents.map((a) => `
${a.id}_task = Task(
    description="""${a.task_description.replace(/"/g, '\\"')}""",
    expected_output="${a.expected_output.replace(/"/g, '\\"')}",
    agent=${a.id}_agent${a.phase > 1 ? `,
    context=[${enabledAgents.filter(other => other.phase < a.phase).map(o => `${o.id}_task`).join(', ')}]` : ''}
)`).join('\n')}

# -------------------------------------------------------------------------
# Crew Orchestration (Async Fan-Out Concurrency)
# -------------------------------------------------------------------------
media_crew = Crew(
    agents=[${enabledAgents.map(a => `${a.id}_agent`).join(', ')}],
    tasks=[${enabledAgents.map(a => `${a.id}_task`).join(', ')}],
    process=Process.sequential, # Phase 2 tasks execute asynchronously via callback
    verbose=True
)

if __name__ == "__main__":
    inputs = {
        "media_title": "Autonomous Cyberpunk Render",
        "category": "Tech & CGI",
        "aspect_ratio": "9:16"
    }
    result = media_crew.kickoff(inputs=inputs)
    print("Crew Execution Output:", result)
`;
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(generateCrewAiPythonScript());
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  // Prompt-to-Flow AI Generator
  const handleRunPromptToFlow = async () => {
    if (!promptInput.trim()) return;
    setIsGeneratingFlow(true);
    try {
      const resp = await fetch('/api/prompt-to-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput, apiKey })
      });
      const data = await resp.json();
      if (data.success && data.workflow?.nodes) {
        setAgents(data.workflow.nodes);
        setSelectedAgentId(data.workflow.nodes[0]?.id || null);
        setIsPromptFlowOpen(false);
        setPromptInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingFlow(false);
    }
  };

  const phase1Agents = agents.filter(a => a.phase === 1);
  const phase2Agents = agents.filter(a => a.phase === 2);
  const phase3Agents = agents.filter(a => a.phase === 3);

  return (
    <div id="dag-graph-root" className="w-full flex flex-col gap-6">
      
      {/* Top Banner with Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              CrewAI Studio 2026 Interactive Visual DAG
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {agents.filter(a => a.isEnabled).length} of {agents.length} Agents Active
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Multi-Agent Architecture &amp; Workflow Customizer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Click any agent node to inspect its Role, 80/20 Task specifications, and Gemini model parameters. Use "Prompt-to-Flow" to generate custom architectures on the fly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPromptFlowOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Prompt-to-Flow AI</span>
          </button>

          <button
            onClick={() => {
              const newAgent: CustomAgentConfig = {
                id: `custom_agent_${Date.now()}`,
                name: 'Custom Specialist Agent',
                role: 'Domain Specialist',
                goal: 'Execute custom post-processing or validation rules',
                backstory: 'Specialized domain expert adhering to strict quality parameters',
                task_description: 'Process inputs and produce structured deliverable',
                expected_output: 'CustomResult (Pydantic)',
                model: 'gemini-3.7-flash',
                temperature: 0.3,
                tools: ['CustomDomainTool'],
                phase: 2,
                isEnabled: true,
                isCustom: true,
                executionType: 'async_fanout'
              };
              setAgents(prev => [...prev, newAgent]);
              setSelectedAgentId(newAgent.id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Add Custom Agent</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Visual DAG Node Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Phase 1 Container */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Phase 1: Ingestion &amp; Scene Perception (Sequential)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">Step 1</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {phase1Agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const status = getAgentStatus(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      onSelectAgent?.(agent.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : agent.isEnabled
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{agent.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                            {agent.model}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{agent.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        status === 'completed' ? 'bg-emerald-500' : status === 'running' ? 'bg-blue-600 animate-ping' : 'bg-slate-300'
                      }`} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAgent(agent.id);
                        }}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={agent.isEnabled ? 'Disable agent' : 'Enable agent'}
                      >
                        {agent.isEnabled ? <ToggleRight className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <ToggleLeft className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow Arrow Down */}
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Phase 2 Container (Async Concurrency Fan-Out) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Phase 2: Autonomous Strategy Crews (Async Concurrency Fan-Out)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Promise.all Parallel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phase2Agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const status = getAgentStatus(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      onSelectAgent?.(agent.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : agent.isEnabled
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{agent.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">{agent.role}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                        status === 'completed' ? 'bg-emerald-500' : status === 'running' ? 'bg-blue-600 animate-ping' : 'bg-slate-300'
                      }`} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-mono text-slate-400">T: {agent.temperature}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAgent(agent.id);
                        }}
                        className="cursor-pointer"
                      >
                        {agent.isEnabled ? <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <ToggleLeft className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow Arrow Down */}
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Phase 3 Container */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Phase 3: Assembly, Ducking &amp; Subtitle Burn-in (Sequential)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">Final Gate</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {phase3Agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const status = getAgentStatus(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgentId(agent.id);
                      onSelectAgent?.(agent.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : agent.isEnabled
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{agent.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                            {agent.model}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{agent.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        status === 'completed' ? 'bg-emerald-500' : status === 'running' ? 'bg-blue-600 animate-ping' : 'bg-slate-300'
                      }`} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAgent(agent.id);
                        }}
                        className="cursor-pointer"
                      >
                        {agent.isEnabled ? <ToggleRight className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <ToggleLeft className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Node Inspector Drawer & Python Code Generator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Node Parameter Inspector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Agent Node Inspector</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                Phase {activeAgent.phase}
              </span>
            </div>

            {/* Editable Fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Agent Role:</label>
                <input
                  type="text"
                  value={activeAgent.role}
                  onChange={(e) => handleUpdateActiveAgent('role', e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Core Goal:</label>
                <textarea
                  value={activeAgent.goal}
                  onChange={(e) => handleUpdateActiveAgent('goal', e.target.value)}
                  rows={2}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 resize-none focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Backstory (Persona Anchor):</label>
                <textarea
                  value={activeAgent.backstory}
                  onChange={(e) => handleUpdateActiveAgent('backstory', e.target.value)}
                  rows={3}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 resize-none focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Reasoning Model:</label>
                  <select
                    value={activeAgent.model}
                    onChange={(e) => handleUpdateActiveAgent('model', e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {AVAILABLE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    <span>Temperature:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{activeAgent.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={activeAgent.temperature}
                    onChange={(e) => handleUpdateActiveAgent('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Assigned Tool Bindings:</label>
                <div className="flex flex-wrap gap-1.5">
                  {activeAgent.tools.map((t, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Python Code Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Live CrewAI Python Export</span>
              </div>
              <button
                onClick={handleCopyPython}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48">
              {generateCrewAiPythonScript()}
            </pre>
          </div>

        </div>

      </div>

      {/* Prompt-to-Flow AI Modal */}
      {isPromptFlowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Prompt-to-Flow AI Architect</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Describe any custom media workflow and Gemini will build the DAG</p>
                </div>
              </div>
              <button
                onClick={() => setIsPromptFlowOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Workflow Prompt / Requirements:</label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Create a podcast repurposing pipeline that segments 3 clips, writes LinkedIn carousels, generates Spanish subtitles, and checks brand safety..."
                rows={3}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 resize-none focus:outline-none focus:border-blue-600"
              />

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold block w-full">Quick Suggestions:</span>
                {[
                  'Podcast to TikTok clips + Spanish translation',
                  'Tech unboxing with Amazon affiliate SEO',
                  'Gaming montage with high-energy audio beats'
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromptInput(s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPromptFlowOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRunPromptToFlow}
                disabled={isGeneratingFlow || !promptInput.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                {isGeneratingFlow ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Architecting Workflow...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate DAG Architecture</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
