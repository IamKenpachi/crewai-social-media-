import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Upload, 
  Film, 
  Sliders, 
  RefreshCw, 
  Layers, 
  ChevronRight, 
  Flame, 
  Eye, 
  Music, 
  Image as ImageIcon, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Radio,
  SlidersHorizontal,
  KeyRound,
  Cpu,
  X,
  FileVideo
} from 'lucide-react';
import { SampleMedia, AgentLogEntry, MediaPackageOutput } from '../types';
import { AVAILABLE_MODELS } from './ApiSettingsModal';

interface PipelineStudioProps {
  onRunPipeline: (config: {
    selectedMedia?: SampleMedia | null;
    customTitle: string;
    customDescription: string;
    targetMood?: string;
    bpmOverride: number | '';
    aspectRatio: '9:16' | '16:9';
    duckingVolume: number;
    imageBase64?: string;
    videoFrames?: string[];
    videoUrl?: string;
  }) => Promise<void>;
  isRunning: boolean;
  currentPhase: number;
  activeAgentId?: string;
  logs: AgentLogEntry[];
  hasResults: boolean;
  onViewResults: () => void;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
  onOpenApiSettings?: () => void;
  hasCustomKey?: boolean;
}

export const PipelineStudio: React.FC<PipelineStudioProps> = ({
  onRunPipeline,
  isRunning,
  currentPhase,
  activeAgentId,
  logs,
  hasResults,
  onViewResults,
  selectedModel = 'gemini-3.7-flash',
  onSelectModel,
  onOpenApiSettings,
  hasCustomKey = false,
}) => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [bpmOverride, setBpmOverride] = useState<number | ''>('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [duckingVolume, setDuckingVolume] = useState<number>(0.22);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | undefined>(undefined);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isProcessingVideo, setIsProcessingVideo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Extract frames from uploaded video at ~1 frame per second (capped at 30s)
  const extractFramesFromVideo = (videoFile: File): Promise<{ posterFrame: string; frames: string[]; videoBlobUrl: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      video.onloadedmetadata = async () => {
        try {
          const duration = Math.min(Math.floor(video.duration) || 1, 30);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Target standard processing resolution (e.g., 480p width for high speed)
          const targetWidth = Math.min(video.videoWidth || 640, 640);
          const targetHeight = Math.round(targetWidth * ((video.videoHeight || 360) / (video.videoWidth || 640)));
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const extractedFrames: string[] = [];

          for (let sec = 0; sec <= duration; sec += 1) {
            await new Promise<void>((resSeek) => {
              video.currentTime = Math.min(sec, video.duration);
              video.onseeked = () => {
                if (ctx) {
                  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                  const frameData = canvas.toDataURL('image/jpeg', 0.85);
                  extractedFrames.push(frameData);
                }
                resSeek();
              };
            });
          }

          resolve({
            posterFrame: extractedFrames[0] || '',
            frames: extractedFrames,
            videoBlobUrl: objectUrl,
          });
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load video file'));
      };
    });
  };

  const processFile = async (file: File) => {
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i);

    if (isVideo) {
      setIsProcessingVideo(true);
      try {
        const { posterFrame, frames, videoBlobUrl } = await extractFramesFromVideo(file);
        setUploadedImageBase64(posterFrame);
        setVideoFrames(frames);
        setUploadedVideoUrl(videoBlobUrl);
        setUploadedFileName(file.name);
        if (!customTitle) setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
      } catch (err) {
        console.error('Error slicing video frames:', err);
        const objUrl = URL.createObjectURL(file);
        setUploadedVideoUrl(objUrl);
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImageBase64(reader.result as string);
          setVideoFrames([]);
          setUploadedFileName(file.name);
          if (!customTitle) setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessingVideo(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
        setUploadedVideoUrl(undefined);
        setVideoFrames([]);
        setUploadedFileName(file.name);
        if (!customTitle) setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearUpload = () => {
    if (uploadedVideoUrl) {
      try { URL.revokeObjectURL(uploadedVideoUrl); } catch (e) {}
    }
    setUploadedImageBase64(undefined);
    setVideoFrames([]);
    setUploadedVideoUrl(undefined);
    setUploadedFileName('');
  };

  const handleKickoff = () => {
    onRunPipeline({
      selectedMedia: null,
      customTitle: customTitle || 'Autonomous Social Media Production Clip',
      customDescription: customDescription || 'Multimodal video frame and audio track analysis',
      bpmOverride,
      aspectRatio,
      duckingVolume,
      imageBase64: uploadedImageBase64,
      videoFrames: videoFrames.length > 0 ? videoFrames : undefined,
      videoUrl: uploadedVideoUrl,
    });
  };

  return (
    <div id="pipeline-studio-root" className="w-full flex flex-col gap-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                CrewAI Live Multi-Agent Execution Studio
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Autonomous Social Media Production Studio
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Feed raw media into the Crew. Watch 1 Ingestion Agent analyze narrative beats via Gemini, then 4 Async Agents concurrently generate viral TikTok copy, YouTube SEO, Imagen thumbnails, and Lyria soundtracks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasResults && (
              <button
                onClick={onViewResults}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
              >
                <span>View Generated Package</span>
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}

            <button
              id="btn-kickoff-pipeline"
              onClick={handleKickoff}
              disabled={isRunning}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Crew Running (Phase {currentPhase}/3)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Kickoff CrewAI Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>1. Upload Media Input</span>
              </span>

              {uploadedImageBase64 && (
                <button
                  type="button"
                  onClick={handleClearUpload}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Media</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[0.99]' 
                    : uploadedImageBase64
                      ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/30'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">
                  {uploadedImageBase64 ? 'Click or drop to replace media file' : 'Click or drag & drop to upload media'}
                </span>
                <span className="text-xs text-slate-400 mt-1 text-center">
                  MP4, WebM, PNG, JPG, GIF (Video frames or visual clips up to 50MB)
                </span>
                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {isProcessingVideo && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">Slicing Video at 1 Frame Per Second...</span>
                    <span className="text-amber-700 dark:text-amber-400 text-[11px]">Extracting time-indexed keyframes for Lyria audio scoring</span>
                  </div>
                </div>
              )}

              {uploadedImageBase64 && !isProcessingVideo && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={uploadedImageBase64} alt="Uploaded frame" className="w-16 h-16 rounded-lg object-cover border border-blue-200 dark:border-blue-800 shadow-2xs bg-white dark:bg-slate-900" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-xs sm:max-w-md">
                        {uploadedFileName || 'Custom Media Asset'}
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Ready for Gemini Multimodal Analysis
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">Media Title / Topic:</label>
                <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Cyberpunk Drone Shot" className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">Video Notes / Context (Optional):</label>
                <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} placeholder="Key moments or hooks..." rows={2} className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>2. Crew AI Parameters &amp; Tool Bindings</span>
              </span>

              {onOpenApiSettings && (
                <button type="button" onClick={onOpenApiSettings} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-blue-600 dark:text-blue-400 transition-all cursor-pointer">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>API Settings</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Primary Reasoning Model:</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">Gemini</span>
                  </div>
                </div>
              </div>

              <select id="studio-gemini-model-select" value={selectedModel} onChange={(e) => onSelectModel && onSelectModel(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs">
                {AVAILABLE_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">BPM Override:</label>
                <input type="number" value={bpmOverride} onChange={(e) => setBpmOverride(e.target.value ? parseInt(e.target.value) : '')} className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">Aspect Ratio:</label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
                  <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${aspectRatio === '9:16' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>9:16</button>
                  <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${aspectRatio === '16:9' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}>16:9</button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider">Ducking Level:</label>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{Math.round(duckingVolume * 100)}%</span>
                </div>
                <input type="range" min="0.10" max="0.40" step="0.01" value={duckingVolume} onChange={(e) => setDuckingVolume(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Live CrewAI Execution Stream</span>
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{log.agentName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{(log.durationMs / 1000).toFixed(2)}s</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{log.outputSummary}</p>
                </div>
              ))}
              {isRunning && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">
                    {currentPhase === 1 && 'Agent 1 extracting scene breaks & mood brief via Gemini...'}
                    {currentPhase === 2 && 'Phase 2: 4 Agents concurrently generating TikTok, YouTube SEO, Thumbnail, & Lyria track...'}
                    {currentPhase === 3 && 'Phase 3: Agent 6 coordinating FFmpeg audio ducking & packaging deliverables...'}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
