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
  CheckCircle2
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div id="architecture-guide-root" className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            System Design &amp; Architecture
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          CrewAI Production Blueprint Architecture
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Separating cognitive reasoning from deterministic execution. Specialized LLM agents analyze, strategize, and formulate prompts, while deterministic custom tools handle media manipulation (Gemini Multimodal, Imagen 3, Lyria, and FFmpeg).
        </p>
      </div>

      {/* 3 Phases Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Phase 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-extrabold text-sm">
            01
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 1: Ingestion (Sequential)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Only one agent (the Multimodal Analyst) watches the video via Gemini to conserve API costs and time. It produces a comprehensive <strong className="text-blue-600 dark:text-blue-400 font-bold">Creative Brief</strong> with emotional beats, visual color motifs, tempo (BPM), and retention hooks.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
            Agent 1 → GeminiVideoAnalysisTool
          </div>
        </div>

        {/* Phase 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
            02
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 2: Parallel Async Fan-Out</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Creative Brief is broadcast to 4 creative agents concurrently with <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">async_execution=True</code>. Copywriting, thumbnail prompt generation, and Lyria music synthesis run simultaneously, reducing latency by 60–75%.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Agents 2, 3, 4, 5 (4 Concurrent Tasks)
          </div>
        </div>

        {/* Phase 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-sm">
            03
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Phase 3: Assembly &amp; Muxing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Post-Production Engineer waits for all parallel tasks to finish, collects the generated audio track, and triggers the deterministic FFmpeg Audio Ducking Muxer tool to output the final video and metadata package.
          </p>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
            Agent 6 → VideoAudioMuxerTool
          </div>
        </div>

      </div>

      {/* 4 Core Best Practices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>CrewAI Production Best Practices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-blue-600 dark:text-blue-400">1. Strict Pydantic Output Validation</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every agent returns a strongly typed schema via <code className="text-amber-600 dark:text-amber-400 font-mono font-bold">output_pydantic</code>. This eliminates formatting hallucinations and guarantees downstream compatibility.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">2. Deterministic Tool Boundaries</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Never let the LLM generate raw FFmpeg shell commands or manipulate media bytes. The LLM only verifies file paths and parameters; the tool executes deterministic binary processing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">3. The "Director" Pattern</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Agent 1 acts as the Director. Its prompt explicitly extracts vibe/mood (for Lyria), visual motifs (for Imagen 3), and core topics (for TikTok &amp; YouTube SEO).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 text-xs shadow-2xs">
            <span className="font-bold text-rose-600 dark:text-rose-400">4. Audio Ducking with FFmpeg amix</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              The filter <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first</code> attenuates background music so dialogue remains crystal clear.
            </p>
          </div>
        </div>
      </div>

      {/* Pro-Tips Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pro-Tips for Real-World Deployment</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[11px]">Area</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Recommended Practice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-3 pr-4 font-bold text-blue-600 dark:text-blue-400 font-mono whitespace-nowrap">Audio Ducking</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">
                  The FFmpeg <code className="text-blue-600 dark:text-blue-400 font-mono font-bold">amix=inputs=2:duration=first</code> filter keeps the voice track crisp while lowering background music to 20–25% volume.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-purple-600 dark:text-purple-400 font-mono whitespace-nowrap">Aspect Ratio Safety</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">
                  Configure thumbnail generation prompts specifically for <code className="text-purple-600 dark:text-purple-400 font-mono font-bold">9:16</code> (vertical Shorts/TikTok) or <code className="text-purple-600 dark:text-purple-400 font-mono font-bold">16:9</code> landscape posts.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">API Caching</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">
                  Disable tool caching on <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">LyriaMusicGenTool</code> and <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">ThumbnailGeneratorTool</code> so new runs generate fresh variations, but enable caching on Gemini analysis if reprocessing the same file.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap">Large Video Handling</td>
                <td className="py-3 leading-relaxed text-slate-500 dark:text-slate-400">
                  Use Gemini File API upload directly rather than passing raw base64 strings to prevent memory bottlenecks.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
