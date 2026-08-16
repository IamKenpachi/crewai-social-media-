import React from 'react';
import { 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Sparkles, 
  Terminal, 
  Flame, 
  SlidersHorizontal,
  CheckCircle2,
  Music2,
  Film,
  Subtitles,
  Share2,
  Code2,
  Workflow,
  Wand2
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div id="architecture-guide-root" className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            System Design &amp; Architecture Specification
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          CrewAI Production Media Pipeline Blueprint
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Separating cognitive multi-agent reasoning from deterministic media execution. Specialized LLM agents analyze, strategize, and formulate prompts across Gemini models, while deterministic custom tools handle video slicing, WebAudio synthesis, Liricle synchronized lyrics, and FFmpeg audio ducking.
        </p>
      </div>

      {/* 3 Core Execution Phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Phase 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-extrabold text-sm">
            01
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 1: Sequential Ingestion</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Only one agent (the <strong>Multimodal Analyst</strong>) watches the raw media via Gemini 1-FPS frame slicing to conserve API costs and latency. It outputs a <strong className="text-blue-600 dark:text-blue-400">Creative Brief</strong> with emotional beats, visual color motifs, suggested BPM tempo, 3 OpusClip virality segments, and lyric themes.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
            <span>Agent 1 → GeminiVideoAnalysisTool</span>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">Sequential</span>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
            02
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 2: Parallel Async Fan-Out</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Creative Brief is broadcast concurrently to 4 specialized strategy agents using <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">async_execution=True</code>. TikTok copy, YouTube SEO, CTR thumbnail generation, and Lyria soundtrack/lyric synthesis run simultaneously, slashing pipeline latency by <strong>60–75%</strong>.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Agents 2, 3, 4, 5 (4 Concurrent Tasks)</span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">Promise.all</span>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-sm">
            03
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 3: Assembly &amp; Muxing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Post-Production Engineer collects generated audio, synchronizes word-level Liricle lyric subtitles, loops the video seamlessly over the full song duration, and triggers the deterministic <strong>FFmpeg Audio Ducking Muxer</strong> tool to render the final release package.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>Agent 6 → VideoAudioMuxerTool</span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">Final Gate</span>
          </div>
        </div>

      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Liricle Lyric & Remotion Engine */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Subtitles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Liricle &amp; Enhanced LRC Lyric Engine</h3>
              <span className="text-[10px] font-mono text-slate-400">Remotion-Style Kinetic Subtitles</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Parses raw Lyria AI range timestamps (e.g. <code className="text-amber-600 dark:text-amber-400 font-mono">[0.0:2.6] Sunlight on the kitchen floor</code>) and standard LRC format into sub-millisecond word arrays. During video playback, the subtitle overlay bouncily scales active words on exact syllable intervals.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-300">
            [0.0:2.6] Spinning in red under summer sun 💃<br />
            [2.6:5.6] Catching the rhythm having fun ✨
          </div>
        </div>

        {/* OpusClip 5-Pillar Virality Scoring */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">OpusClip 5-Pillar Virality Intelligence</h3>
              <span className="text-[10px] font-mono text-slate-400">Automated Short-Form Segmentation</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Segments raw footage into 3 high-retention clips (<em>Curiosity Pattern Interrupt</em>, <em>Climax Drop</em>, and <em>Infinite Loop Hook</em>) with a 5-pillar breakdown score:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <span className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-700 dark:text-slate-300">Hook: 98%</span>
            <span className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-700 dark:text-slate-300">Climax: 94%</span>
            <span className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-700 dark:text-slate-300">Loop: 98%</span>
          </div>
        </div>

      </div>

      {/* 4 Core Production Best Practices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>CrewAI Production Engineering Best Practices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-blue-600 dark:text-blue-400">1. Strict Pydantic Output Validation</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every agent returns a strongly typed schema via <code className="text-amber-600 dark:text-amber-400 font-mono font-bold">output_pydantic</code>. This eliminates formatting hallucinations and guarantees downstream pipeline compatibility.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">2. Deterministic Tool Boundaries</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Never let LLMs generate raw unverified FFmpeg commands or manipulate media bytes. LLMs verify file paths and parameters; deterministic binary tools execute the operations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">3. The "Director" Ingestion Pattern</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Agent 1 acts as the Director. Its prompt explicitly extracts vibe/mood (for Lyria), visual motifs (for Gemini Image), and search intent (for TikTok &amp; YouTube SEO).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-rose-600 dark:text-rose-400">4. Intelligent Audio Ducking (FFmpeg amix)</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              The filter <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first</code> attenuates background music so spoken voice remains crystal clear.
            </p>
          </div>
        </div>
      </div>

      {/* Pro-Tips Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Deployment &amp; Model Selection Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[11px]">Model / Component</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Recommended Role</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Key Benefit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-3 pr-4 font-bold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap">Gemini 3.7 Flash</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">Default Multimodal Video Ingestion &amp; Creative Planning</td>
                <td className="py-3 font-medium text-slate-700 dark:text-slate-200">Sub-second latency with high multimodal perceptual accuracy</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-purple-600 dark:text-purple-400 font-mono whitespace-nowrap">Gemini 3.1 Pro</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">Deep SEO Keyword Architecture &amp; Long-Form Narrative</td>
                <td className="py-3 font-medium text-slate-700 dark:text-slate-200">Maximum cognitive reasoning for search ranking and compliance</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">Gemini 3.5 Flash Lite</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">High-Throughput Batch Copywriting &amp; Hashtags</td>
                <td className="py-3 font-medium text-slate-700 dark:text-slate-200">Lowest latency &amp; compute footprint</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap">Liricle Sync Engine</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">Real-time lyric timestamping &amp; subtitle rendering</td>
                <td className="py-3 font-medium text-slate-700 dark:text-slate-200">Word-level animated karaoke timing across loop cycles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
