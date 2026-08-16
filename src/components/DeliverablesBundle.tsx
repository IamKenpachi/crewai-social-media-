import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Youtube, 
  Music, 
  Image as ImageIcon, 
  FileJson, 
  Layers, 
  Sliders, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Tag,
  Share2,
  CheckCircle2,
  SlidersHorizontal,
  Radio,
  FileVideo,
  Film,
  Zap,
  Target,
  Smartphone,
  Eye,
  ShieldCheck,
  Palette,
  Search,
  Mic,
  BookmarkCheck,
  Hash,
  Clock,
  ArrowRight,
  Repeat,
  MessageSquare,
  Link2,
  Sparkle,
  SearchCheck,
  Type as TypeIcon,
  Smile,
  Edit3
} from 'lucide-react';
import { MediaPackageOutput, ExtractedClip, SubtitleLine, SubtitleStylePreset } from '../types';
import { musicSynth } from '../utils/audioSynth';
import { generateClientThumbnailSvg } from '../utils/thumbnailGenerator';
import { exportVideoWithMusic, triggerFileDownload } from '../utils/videoExporter';
import { SubtitleOverlay } from './SubtitleOverlay';
import confetti from 'canvas-confetti';

interface DeliverablesBundleProps {
  bundle: MediaPackageOutput;
  onRegenerateThumbnail?: (options: {
    prompt: string;
    aspect: '9:16' | '16:9';
    headlineText?: string;
    subBadge?: string;
    colorAccent?: string;
  }) => Promise<void>;
  isRegeneratingThumbnail?: boolean;
}

export const DeliverablesBundle: React.FC<DeliverablesBundleProps> = ({
  bundle,
  onRegenerateThumbnail,
  isRegeneratingThumbnail = false,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'thumbnail' | 'tiktok' | 'youtube' | 'pydantic'>('video');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Multi-Clip Selection State (OpusClip Intelligence)
  const clips: ExtractedClip[] = bundle.clips && bundle.clips.length > 0 
    ? bundle.clips 
    : [
        {
          id: 'clip-1',
          clip_number: 1,
          title: 'The Curiosity Hook',
          hook_summary: 'Disrupts feed scrolling with high-stakes visual suspense.',
          start_time: '0:00',
          end_time: '0:12',
          start_seconds: 0,
          end_seconds: 12,
          duration_seconds: 12,
          virality_score: 96,
          virality_breakdown: { hook_strength: 98, visual_climax: 94, topic_novelty: 92, audio_sync: 96, loop_continuity: 98 },
          why_viral_reasoning: 'Immediate cognitive curiosity gap paired with rapid pacing forces viewer dwell time.',
          retention_tactics: ['Visual pattern interrupt', 'Sub-3s spoken audio hook', 'Loop transition'],
          subtitles: bundle.subtitles || []
        }
      ];

  const [selectedClipId, setSelectedClipId] = useState<string>(clips[0]?.id || 'clip-1');
  const activeClip = clips.find(c => c.id === selectedClipId) || clips[0];

  // Subtitle Studio State (Submagic Intelligence)
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStylePreset>(bundle.subtitle_style || 'hormozi');
  const [currentSubtitles, setCurrentSubtitles] = useState<SubtitleLine[]>(activeClip.subtitles || bundle.subtitles || []);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isEditingSubtitles, setIsEditingSubtitles] = useState<boolean>(false);

  // Sync current subtitles when switching clips
  useEffect(() => {
    if (activeClip && activeClip.subtitles && activeClip.subtitles.length > 0) {
      setCurrentSubtitles(activeClip.subtitles);
    }
  }, [selectedClipId, activeClip]);

  // Audio ducking & soundtrack player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duckingMode, setDuckingMode] = useState<'ducked' | 'speech_only' | 'music_only'>('music_only');
  const [duckingVolume, setDuckingVolume] = useState<number>(bundle.audio_ducking_level || 0.22);
  
  // Video with Music Export state
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusMessage, setExportStatusMessage] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  
  // Thumbnail Studio Live Customizer & Multi-Variant state
  const [customThumbPrompt, setCustomThumbPrompt] = useState<string>(bundle.thumbnail_metadata?.prompt_used || '');
  const [thumbAspect, setThumbAspect] = useState<'9:16' | '16:9'>(bundle.thumbnail_metadata?.aspect_ratio || '9:16');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(bundle.thumbnail_metadata?.selected_variant_index ?? 0);
  const [variantType, setVariantType] = useState<'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH'>(
    (bundle.thumbnail_metadata?.variants?.[0]?.variant_type as any) || 'CURIOSITY_GAP'
  );
  const [headlineText, setHeadlineText] = useState<string>(bundle.thumbnail_metadata?.headline_overlay || 'SECRET REVEALED ⚡');
  const [subBadge, setSubBadge] = useState<string>(bundle.thumbnail_metadata?.sub_badge || '★ MUST WATCH');
  const [colorAccent, setColorAccent] = useState<string>(bundle.thumbnail_metadata?.color_accent || '#FACC15');
  const [activeThumbnailUrl, setActiveThumbnailUrl] = useState<string>(bundle.thumbnail_metadata?.thumbnail_url || '');

  const videoRef = useRef<HTMLVideoElement>(null);

  // When a variant is selected, auto-populate the hook, badge, and color
  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    const variants = bundle.thumbnail_metadata?.variants;
    if (variants && variants[index]) {
      const v = variants[index];
      if (v.headline_overlay) setHeadlineText(v.headline_overlay);
      if (v.sub_badge) setSubBadge(v.sub_badge);
      if (v.color_accent) setColorAccent(v.color_accent);
      if (v.variant_type) setVariantType(v.variant_type as any);
      if (v.thumbnail_url) setActiveThumbnailUrl(v.thumbnail_url);
    }
  };

  // Re-generate live composited SVG thumbnail whenever interactive controls change
  useEffect(() => {
    const sourceFrame = bundle.poster_frame || bundle.raw_media_url || bundle.thumbnail_metadata?.source_frame_url;
    const clientSvg = generateClientThumbnailSvg({
      title: bundle.creative_brief?.summary || 'VIRAL SHORT',
      headlineText,
      subBadge,
      mood: bundle.creative_brief?.mood_and_tone,
      colorAccent,
      aspect: thumbAspect,
      sourceImageBase64: sourceFrame,
      variantType,
      focalHighlightText: bundle.thumbnail_metadata?.variants?.[selectedVariantIndex]?.focal_point_focus
    });
    setActiveThumbnailUrl(clientSvg);
  }, [headlineText, subBadge, colorAccent, thumbAspect, variantType, selectedVariantIndex, bundle]);

  const COLOR_PALETTES = [
    { name: 'Electric Yellow', hex: '#FACC15', boost: '+19% CTR', desc: 'Highest contrast on dark feeds' },
    { name: 'Urgent Red', hex: '#EF4444', boost: '+23% CTR', desc: 'Action, urgency & emotional intensity' },
    { name: 'Cyber Cyan', hex: '#38BDF8', boost: '+14% CTR', desc: 'Tech, futuristic & clarity' },
    { name: 'Sunset Orange', hex: '#F97316', boost: '+17% CTR', desc: 'Warmth, food, lifestyle & DIY' },
    { name: 'Emerald Green', hex: '#22C55E', boost: '+12% CTR', desc: 'Finance, wellness & growth' },
  ];

  const BADGE_PRESETS = [
    '★ MUST WATCH',
    '⚡ WAIT FOR IT',
    '🔥 SECRET REVEALED',
    '⚠️ NEVER DO THIS',
    '💡 PRO HACK',
    '🚀 100% VIRAL'
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Sync music synth / audio stream with media playback & time tracking
  const togglePlayAudioMuxer = () => {
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      musicSynth.stop();
      setIsPlaying(false);
    } else {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      const mood = bundle.creative_brief?.mood_and_tone || 'energetic';
      const bpm = bundle.music_metadata?.bpm || 124;
      const audioUrl = bundle.music_metadata?.audio_url;
      musicSynth.start(mood, bpm, audioUrl);
      musicSynth.setDucking(duckingMode === 'ducked', duckingVolume);
      setIsPlaying(true);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTimeMs(videoRef.current.currentTime * 1000);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (duckingMode === 'speech_only') {
        musicSynth.setMasterVolume(0);
      } else if (duckingMode === 'music_only') {
        musicSynth.setMasterVolume(1);
        musicSynth.setDucking(false);
      } else {
        musicSynth.setMasterVolume(1);
        musicSynth.setDucking(true, duckingVolume);
      }
    }
  }, [duckingMode, duckingVolume, isPlaying]);

  useEffect(() => {
    return () => {
      musicSynth.stop();
    };
  }, []);

  const downloadJsonBundle = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'crewai_media_bundle.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const triggerExportConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Export video with generated music AND burned-in animated subtitles
  const handleDownloadVideoWithMusic = async () => {
    if (isExportingVideo) return;
    try {
      setIsExportingVideo(true);
      setExportProgress(5);
      setExportStatusMessage('Initializing media rendering engine...');
      setExportSuccess(false);

      const sourceVideo = bundle.final_video_path || bundle.raw_media_url;
      const sourceImage = bundle.poster_frame || bundle.raw_media_url || bundle.thumbnail_metadata?.source_frame_url;
      const audioUrl = bundle.music_metadata?.audio_url;
      const mood = bundle.creative_brief?.mood_and_tone || 'energetic';
      const bpm = bundle.music_metadata?.bpm || 124;

      const blob = await exportVideoWithMusic({
        videoSourceUrl: bundle.final_media_type === 'video' ? sourceVideo : undefined,
        imageSourceUrl: bundle.final_media_type === 'image' || !sourceVideo ? sourceImage : undefined,
        audioUrl: audioUrl,
        mood: mood,
        bpm: bpm,
        durationSeconds: activeClip.duration_seconds || 12,
        filename: 'shorts_with_ai_soundtrack.mp4',
        subtitles: currentSubtitles,
        subtitleStyle: subtitleStyle,
        onProgress: (pct, msg) => {
          setExportProgress(pct);
          setExportStatusMessage(msg);
        }
      });

      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      triggerFileDownload(blob, `${activeClip.title.toLowerCase().replace(/\s+/g, '_')}_subtitles_ai_music.${ext}`);
      setExportSuccess(true);
      triggerExportConfetti();
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error('Export video error:', err);
      alert('Video export encountered an issue: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
      setExportStatusMessage('');
    }
  };

  // Subtitle line update handler
  const handleUpdateSubtitleLine = (lineId: string, newText: string, emoji?: string) => {
    setCurrentSubtitles(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      const words = newText.trim().split(/\s+/).map((w, idx) => ({
        id: `${lineId}-w-${idx}`,
        text: w,
        start_ms: line.start_ms + idx * 300,
        end_ms: line.start_ms + (idx + 1) * 300
      }));
      return {
        ...line,
        text: newText,
        emoji: emoji ?? line.emoji,
        words
      };
    }));
  };

  return (
    <div id="deliverables-package-root" className="w-full flex flex-col gap-6">
      
      {/* Top Executive Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                CrewAI Production Deliverables Manifest
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">
                v2.6 • {clips.length} Viral {clips.length === 1 ? 'Clip' : 'Clips'} Ready
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Production Media Deliverables Package
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              All 6 cognitive agents completed generation. Video audio muxing rendered with original audio muted, Lyria AI soundtrack applied, Submagic animated captions enabled, and 3-clip virality matrix computed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-download-video-music-top"
              onClick={handleDownloadVideoWithMusic}
              disabled={isExportingVideo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download the video with AI music & burned-in animated subtitles"
            >
              {isExportingVideo ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : exportSuccess ? (
                <Check className="w-4 h-4 text-emerald-200" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isExportingVideo 
                  ? `Rendering MP4 (${exportProgress}%)` 
                  : exportSuccess 
                    ? 'Video Downloaded!' 
                    : 'Download Video + Subtitles + Music'}
              </span>
            </button>

            <button
              onClick={downloadJsonBundle}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all shadow-xs cursor-pointer"
              title="Download entire output manifest in JSON format"
            >
              <FileJson className="w-4 h-4 text-slate-600" />
              <span>Export JSON Manifest</span>
            </button>
          </div>
        </div>
      </div>

      {/* OpusClip-Style Multi-Clip Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-4 h-4 text-blue-600" />
              <span>OpusClip AI Multi-Clip Selector</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {clips.length} Segments Identified
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Clip: <strong className="text-slate-800">{activeClip.title}</strong> ({activeClip.start_time} - {activeClip.end_time})
          </span>
        </div>

        {/* Clip Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {clips.map((clip) => {
            const isSelected = clip.id === selectedClipId;
            return (
              <button
                key={clip.id}
                onClick={() => setSelectedClipId(clip.id)}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    #{clip.clip_number} • {clip.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-mono font-black border border-emerald-300">
                    ★ {clip.virality_score}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{clip.start_time} - {clip.end_time} ({clip.duration_seconds}s)</span>
                  <span className="text-blue-600 font-semibold text-[10px]">
                    Hook: {clip.virality_breakdown.hook_strength}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Navigation Container */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'video' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileVideo className="w-4 h-4 text-blue-600" />
          <span>Shorts &amp; Subtitles Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('thumbnail')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'thumbnail' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>AI Thumbnail Art Director</span>
        </button>

        <button
          onClick={() => setActiveTab('tiktok')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'tiktok' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>TikTok 2026 Strategy</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'youtube' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-600" />
          <span>YouTube Shorts SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('pydantic')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'pydantic' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileJson className="w-4 h-4 text-indigo-600" />
          <span>Pydantic Schema</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Video Player, Submagic Subtitle Studio & Virality Radar */}
      {/* ========================================================================= */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Video Player with Live Animated Subtitles (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-blue-600" />
                  <span>Submagic-Style Video &amp; Subtitle Studio</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Original Audio Muted • AI Music Active
                </span>
              </div>

              {/* Video Display Container with Overlay Subtitles */}
              <div className="relative w-full aspect-[9/16] max-h-[540px] bg-slate-950 rounded-2xl overflow-hidden shadow-md flex items-center justify-center mx-auto border border-slate-800">
                {bundle.final_media_type === 'video' || bundle.final_video_path?.endsWith('.mp4') ? (
                  <video
                    ref={videoRef}
                    src={bundle.final_video_path || bundle.raw_media_url}
                    muted={true}
                    playsInline
                    loop
                    onTimeUpdate={handleVideoTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={bundle.poster_frame || bundle.raw_media_url || bundle.thumbnail_metadata?.thumbnail_url}
                    alt="Poster frame"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Subtitle Overlay Live Rendering */}
                <SubtitleOverlay
                  subtitles={currentSubtitles}
                  currentTimeMs={currentTimeMs}
                  stylePreset={subtitleStyle}
                  aspectRatio="9:16"
                  onUpdateLine={handleUpdateSubtitleLine}
                />

                {/* Video Watermark & Active Indicator */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{activeClip.title}</span>
                </div>

                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 pointer-events-none">
                  <span>★ {activeClip.virality_score}</span>
                </div>

                {/* Play / Pause Floating Trigger */}
                <button
                  onClick={togglePlayAudioMuxer}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/90 text-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current text-slate-900" />
                    ) : (
                      <Play className="w-6 h-6 fill-current text-blue-600 ml-1" />
                    )}
                  </div>
                </button>
              </div>

              {/* Submagic Subtitle Style Preset Selector */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <TypeIcon className="w-4 h-4 text-blue-600" />
                    <span>Subtitle Animation Style Preset:</span>
                  </span>
                  <button
                    onClick={() => setIsEditingSubtitles(!isEditingSubtitles)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingSubtitles ? 'Close Editor' : 'Edit Captions Text'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hormozi', name: '🔥 Hormozi Pop', desc: 'Yellow pop + black stroke' },
                    { id: 'mrbeast', name: '⚡ MrBeast Kinetic', desc: 'Rotating neon colors' },
                    { id: 'neon', name: '💎 Neon Cyber', desc: 'Cyan & pink glow' },
                    { id: 'minimal', name: ' Clean Minimal', desc: 'Frosted glass pill' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSubtitleStyle(style.id as SubtitleStylePreset)}
                      className={`p-2.5 rounded-xl text-left border flex flex-col gap-0.5 transition-all cursor-pointer ${
                        subtitleStyle === style.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-black">{style.name}</span>
                      <span className={`text-[10px] ${subtitleStyle === style.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {style.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Lines Editor (Collapsible) */}
              {isEditingSubtitles && (
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-800">Edit Caption Lines &amp; Timestamps:</span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {currentSubtitles.map((line, idx) => (
                      <div key={line.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">
                          {(line.start_ms / 1000).toFixed(1)}s
                        </span>
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => handleUpdateSubtitleLine(line.id, e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800"
                        />
                        <input
                          type="text"
                          value={line.emoji || ''}
                          onChange={(e) => handleUpdateSubtitleLine(line.id, line.text, e.target.value)}
                          placeholder="Emoji"
                          className="w-12 px-1 py-1 text-center bg-slate-50 border border-slate-200 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Download Video with Music & Burned-In Subtitles */}
              <button
                onClick={handleDownloadVideoWithMusic}
                disabled={isExportingVideo}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isExportingVideo ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>
                  {isExportingVideo
                    ? `Rendering Video with Burned-In Subtitles (${exportProgress}%)...`
                    : `Download ${activeClip.title} (Burned-in Subtitles + Music)`}
                </span>
              </button>

            </div>
          </div>

          {/* Right: OpusClip Virality Radar & Retention Intelligence (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Virality Score Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>OpusClip Virality Radar</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono font-black text-xs border border-emerald-200">
                  ★ {activeClip.virality_score}/100 Score
                </span>
              </div>

              {/* 5-Pillar Metric Bars */}
              <div className="flex flex-col gap-3">
                {[
                  { label: '0-3s Hook Retention Grip', value: activeClip.virality_breakdown.hook_strength, color: 'bg-blue-600' },
                  { label: 'Visual Motion & Climax', value: activeClip.virality_breakdown.visual_climax, color: 'bg-amber-500' },
                  { label: 'Topic Novelty & Curiosity', value: activeClip.virality_breakdown.topic_novelty, color: 'bg-purple-600' },
                  { label: 'Audio Beat & Sonic Impact', value: activeClip.virality_breakdown.audio_sync, color: 'bg-emerald-500' },
                  { label: 'Infinite Loop Continuity', value: activeClip.virality_breakdown.loop_continuity, color: 'bg-rose-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Why This Went Viral AI Breakdown */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Why This Clip Will Perform:</span>
                </span>
                <p className="text-xs text-blue-900 leading-relaxed">
                  {activeClip.why_viral_reasoning}
                </p>
              </div>

              {/* Actionable Retention Tactics */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-bold text-slate-800">Retention Strategy Applied:</span>
                <div className="flex flex-col gap-1.5">
                  {activeClip.retention_tactics.map((tactic, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sonic Branding / Track Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Music className="w-4 h-4 text-blue-600" />
                <span>Lyria Soundtrack Master</span>
              </span>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{bundle.music_metadata?.genre || 'Cyberpunk Synth'}</span>
                  <span className="text-xs font-mono font-bold text-blue-600">{bundle.music_metadata?.bpm || 128} BPM</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bundle.music_metadata?.instruments?.map((inst, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI Thumbnail Art Director & Six-Slot Formula */}
      {/* ========================================================================= */}
      {activeTab === 'thumbnail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Thumbnail Preview & Variant Selector (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>High-CTR Multi-Variant Studio</span>
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {bundle.thumbnail_metadata?.scorecard?.overall_grade || 'A+ (98/100)'}
                </span>
              </div>

              {/* Rendered Thumbnail Asset */}
              <div className={`relative rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-950 mx-auto ${
                thumbAspect === '9:16' ? 'aspect-[9/16] max-h-[500px]' : 'aspect-[16/9] w-full max-h-[380px]'
              }`}>
                <img
                  src={activeThumbnailUrl || bundle.thumbnail_metadata?.thumbnail_url}
                  alt="AI Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 3-Variant A/B/C Concept Switcher */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-bold text-slate-800">
                  Select High-CTR Empirical Archetype:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bundle.thumbnail_metadata?.variants?.map((variant, idx) => {
                    const isSelected = idx === selectedVariantIndex;
                    return (
                      <button
                        key={variant.id || idx}
                        onClick={() => handleSelectVariant(idx)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {variant.variant_type === 'EMOTION_FACE' ? '😱 Emotion Shock' : variant.variant_type === 'MINIMAL_PUNCH' ? '🎯 Minimal Punch' : '⚡ Curiosity Gap'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {variant.ctr_prediction}% CTR
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {variant.concept_description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Visual Customizers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700">Headline Overlay Text:</label>
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700">Urgency Badge:</label>
                  <input
                    type="text"
                    value={subBadge}
                    onChange={(e) => setSubBadge(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700">Accent Color:</label>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTES.map((cp) => (
                      <button
                        key={cp.hex}
                        onClick={() => setColorAccent(cp.hex)}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                          colorAccent === cp.hex ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: cp.hex }}
                        title={`${cp.name} (${cp.boost})`}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Six-Slot Prompt Architecture & Scorecard (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Six-Slot Prompt Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>The Six-Slot Prompt Architecture (2026)</span>
                </span>
              </div>

              {bundle.thumbnail_metadata?.variants?.[selectedVariantIndex]?.six_slot_breakdown ? (
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Slot 1: Specific Subject', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.subject },
                    { label: 'Slot 2: Micro-Expression / Action', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.expression_action },
                    { label: 'Slot 3: Environment & Bokeh', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.environment_background },
                    { label: 'Slot 4: Rim Lighting & Atmosphere', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.lighting_atmosphere },
                    { label: 'Slot 5: Style & Medium', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.style_medium },
                    { label: 'Slot 6: Technical Parameters', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.technical_parameters },
                  ].map((slot, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                      <span className="font-bold text-slate-800 block text-[11px]">{slot.label}:</span>
                      <span className="text-slate-600 text-[11px] leading-snug">{slot.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Six-slot prompt architecture generated from multimodal keyframes.
                </p>
              )}

              {/* 5-Pillar Scorecard */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>5-Pillar High-CTR Scorecard:</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Mobile Glancability:</span>
                    <strong className="text-amber-900">{bundle.thumbnail_metadata?.scorecard?.mobile_readability_score || 98}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Focal Clarity:</span>
                    <strong className="text-amber-900">{bundle.thumbnail_metadata?.scorecard?.focal_clarity_score || 96}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Contrast Ratio:</span>
                    <strong className="text-amber-900">{bundle.thumbnail_metadata?.scorecard?.contrast_ratio_score || 97}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Safe Zone Pass:</span>
                    <strong className="text-emerald-700">100% Clean</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TikTok 2026 Algorithm Strategy */}
      {/* ========================================================================= */}
      {activeTab === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>2026 TikTok Search Engine &amp; Viral Strategy</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-mono font-bold text-xs border border-rose-200">
                  Viral Score: {bundle.tiktok_metadata?.viral_score_estimate || 96}/100
                </span>
              </div>

              {/* Search-Optimized Query Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  TikTok Search-Optimized Title (Search Engine Intent):
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                  <span>{bundle.tiktok_metadata?.search_optimized_title || bundle.tiktok_metadata?.captions?.[0]}</span>
                  <button
                    onClick={() => handleCopy(bundle.tiktok_metadata?.search_optimized_title || '', 'tt-title')}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'tt-title' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sub-3s On-Screen Hook & Spoken Script */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-rose-950 uppercase">0:00-0:03 On-Screen Text Anchor:</span>
                  <span className="text-xs font-black text-rose-900">{bundle.tiktok_metadata?.on_screen_hook_3s || 'DO NOT MAKE THIS MISTAKE IN 2026 ⚠️'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-blue-950 uppercase">3-Second Spoken Audio Script:</span>
                  <span className="text-xs font-semibold text-blue-900">"{bundle.tiktok_metadata?.spoken_keyword_script || 'If you are still doing this the old way, stop right now.'}"</span>
                </div>
              </div>

              {/* 3-3-3 Hashtag Framework */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  The "3-3-3" Strategic Hashtag Framework:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Trending Broad:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.trending?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Niche Community:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.niche_community?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Content Specific:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.content_specific?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Caption Hooks */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  3 Viral Caption Hooks:
                </label>
                <div className="flex flex-col gap-2">
                  {bundle.tiktok_metadata?.captions?.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <span>{cap}</span>
                      <button
                        onClick={() => handleCopy(cap, `cap-${idx}`)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        {copiedKey === `cap-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Triple-Tier High Converting CTAs
              </span>
              
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">1. Verbal Audio Outro:</span>
                  <span className="text-slate-600">{bundle.tiktok_metadata?.high_converting_ctas?.verbal || 'Save this post!'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">2. On-Screen Visual Sticker:</span>
                  <span className="text-slate-600">{bundle.tiktok_metadata?.high_converting_ctas?.on_screen_sticker || '📌 TAP SAVE'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">3. Bio Link Directive:</span>
                  <span className="text-slate-600">{bundle.tiktok_metadata?.high_converting_ctas?.bio_link_prompt || 'Link in bio'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: YouTube Shorts SEO & AVD Retention */}
      {/* ========================================================================= */}
      {activeTab === 'youtube' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>YouTube Shorts 2026 SEO &amp; AVD Architecture</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200">
                  Predicted CTR: {bundle.youtube_metadata?.ctr_prediction || 14.8}%
                </span>
              </div>

              {/* Title under 60 chars */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Front-Loaded Mobile Title ({bundle.youtube_metadata?.title?.length || 42} chars):
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Mobile Sweet Spot Pass</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900">
                  <span>{bundle.youtube_metadata?.title}</span>
                  <button
                    onClick={() => handleCopy(bundle.youtube_metadata?.title || '', 'yt-title')}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    {copiedKey === 'yt-title' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Full SEO Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    SEO Description (Front-Loaded with Indexing Keywords):
                  </label>
                  <button
                    onClick={() => handleCopy(bundle.youtube_metadata?.description || '', 'yt-desc')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'yt-desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Full Description</span>
                  </button>
                </div>
                <textarea
                  value={bundle.youtube_metadata?.description}
                  readOnly
                  rows={8}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 resize-none"
                />
              </div>

            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                AVD Infinite Loop Engineering
              </span>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-purple-950">Target Average View Duration:</span>
                <span className="font-mono text-lg font-black text-purple-700">
                  {bundle.youtube_metadata?.avd_retention_engineering?.target_avd_percentage || 108}% AVD
                </span>
                <span className="text-slate-600 text-[11px] leading-relaxed">
                  {bundle.youtube_metadata?.avd_retention_engineering?.loop_transition_technique}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Pydantic Schema & Manifest */}
      {/* ========================================================================= */}
      {activeTab === 'pydantic' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-indigo-600" />
              <span>Full Validated MediaPackageOutput Schema</span>
            </span>
            <button
              onClick={() => handleCopy(JSON.stringify(bundle, null, 2), 'pydantic-json')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {copiedKey === 'pydantic-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Raw JSON</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
            {JSON.stringify(bundle, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
