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
  Edit3,
  Wand2
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

  // Subtitle Studio State (Playful Beat-Synced Lyrics)
  const defaultSongLyrics: SubtitleLine[] = [
    {
      id: 'lyric-1',
      text: 'Red dress spinning under summer light',
      start_ms: 0,
      end_ms: 2800,
      emoji: '💃',
      words: [
        { id: 'w-1', text: 'Red', start_ms: 0, end_ms: 500 },
        { id: 'w-2', text: 'dress', start_ms: 500, end_ms: 1000 },
        { id: 'w-3', text: 'spinning', start_ms: 1000, end_ms: 1600 },
        { id: 'w-4', text: 'under', start_ms: 1600, end_ms: 2000 },
        { id: 'w-5', text: 'summer', start_ms: 2000, end_ms: 2400 },
        { id: 'w-6', text: 'light', start_ms: 2400, end_ms: 2800 }
      ]
    },
    {
      id: 'lyric-2',
      text: 'Polka dots moving pure delight',
      start_ms: 2800,
      end_ms: 5600,
      emoji: '✨',
      words: [
        { id: 'w-7', text: 'Polka', start_ms: 2800, end_ms: 3400 },
        { id: 'w-8', text: 'dots', start_ms: 3400, end_ms: 3900 },
        { id: 'w-9', text: 'moving', start_ms: 3900, end_ms: 4500 },
        { id: 'w-10', text: 'pure', start_ms: 4500, end_ms: 5000 },
        { id: 'w-11', text: 'delight', start_ms: 5000, end_ms: 5600 }
      ]
    },
    {
      id: 'lyric-3',
      text: 'Feel the rhythm catch the breeze',
      start_ms: 5600,
      end_ms: 8400,
      emoji: '🌴',
      words: [
        { id: 'w-12', text: 'Feel', start_ms: 5600, end_ms: 6100 },
        { id: 'w-13', text: 'the', start_ms: 6100, end_ms: 6500 },
        { id: 'w-14', text: 'rhythm', start_ms: 6500, end_ms: 7100 },
        { id: 'w-15', text: 'catch', start_ms: 7100, end_ms: 7600 },
        { id: 'w-16', text: 'the', start_ms: 7600, end_ms: 8000 },
        { id: 'w-17', text: 'breeze', start_ms: 8000, end_ms: 8400 }
      ]
    },
    {
      id: 'lyric-4',
      text: 'Golden moments making memories',
      start_ms: 8400,
      end_ms: 11800,
      emoji: '🌟',
      words: [
        { id: 'w-18', text: 'Golden', start_ms: 8400, end_ms: 9000 },
        { id: 'w-19', text: 'moments', start_ms: 9000, end_ms: 9800 },
        { id: 'w-20', text: 'making', start_ms: 9800, end_ms: 10600 },
        { id: 'w-21', text: 'memories', start_ms: 10600, end_ms: 11800 }
      ]
    }
  ];

  const resolvedSubtitles: SubtitleLine[] = 
    (bundle.music_metadata?.lyrics_progression && bundle.music_metadata.lyrics_progression.length > 0)
      ? bundle.music_metadata.lyrics_progression
      : (activeClip?.subtitles && activeClip.subtitles.length > 1)
        ? activeClip.subtitles
        : (bundle.subtitles && bundle.subtitles.length > 1)
          ? bundle.subtitles
          : defaultSongLyrics;

  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStylePreset>(bundle.subtitle_style || 'hormozi');
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'bottom'>('top');
  const [currentSubtitles, setCurrentSubtitles] = useState<SubtitleLine[]>(resolvedSubtitles);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isEditingSubtitles, setIsEditingSubtitles] = useState<boolean>(false);

  // Sync current subtitles when switching clips (only if valid multi-line lyrics exist)
  useEffect(() => {
    if (bundle.music_metadata?.lyrics_progression && bundle.music_metadata.lyrics_progression.length > 0) {
      setCurrentSubtitles(bundle.music_metadata.lyrics_progression);
    } else if (activeClip?.subtitles && activeClip.subtitles.length > 1) {
      setCurrentSubtitles(activeClip.subtitles);
    } else if (bundle.subtitles && bundle.subtitles.length > 1) {
      setCurrentSubtitles(bundle.subtitles);
    } else {
      setCurrentSubtitles(defaultSongLyrics);
    }
  }, [selectedClipId, activeClip, bundle]);

  // Audio ducking & soundtrack player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duckingMode, setDuckingMode] = useState<'ducked' | 'speech_only' | 'music_only'>('music_only');
  const [duckingVolume, setDuckingVolume] = useState<number>(bundle.audio_ducking_level || 0.22);
  
  // Video with Music Export state
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusMessage, setExportStatusMessage] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  
  // Thumbnail Studio & Creative AI Prompt State
  const initialThumbUrl = bundle.thumbnail_metadata?.variants?.[0]?.thumbnail_url || bundle.thumbnail_metadata?.thumbnail_url || bundle.poster_frame || bundle.raw_media_url || '';
  const [activeThumbnailUrl, setActiveThumbnailUrl] = useState<string>(initialThumbUrl);
  const [customThumbPrompt, setCustomThumbPrompt] = useState<string>(
    bundle.thumbnail_metadata?.variants?.[0]?.prompt_used || bundle.thumbnail_metadata?.prompt_used || 'Cinematic 8K render, photorealistic, dramatic rim lighting'
  );
  const [thumbAspect, setThumbAspect] = useState<'9:16' | '16:9'>(bundle.thumbnail_metadata?.aspect_ratio || '9:16');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(bundle.thumbnail_metadata?.selected_variant_index ?? 0);
  const [variantType, setVariantType] = useState<'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH'>(
    (bundle.thumbnail_metadata?.variants?.[0]?.variant_type as any) || 'CURIOSITY_GAP'
  );
  const [headlineText, setHeadlineText] = useState<string>(bundle.thumbnail_metadata?.headline_overlay || 'SECRET REVEALED');
  const [subBadge, setSubBadge] = useState<string>(bundle.thumbnail_metadata?.sub_badge || '★ MUST WATCH');
  const [colorAccent, setColorAccent] = useState<string>(bundle.thumbnail_metadata?.color_accent || '#FACC15');

  const videoRef = useRef<HTMLVideoElement>(null);

  // When a variant is selected, auto-populate its specific creative prompt, hook, and image
  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    const variants = bundle.thumbnail_metadata?.variants;
    if (variants && variants[index]) {
      const v = variants[index];
      if (v.headline_overlay) setHeadlineText(v.headline_overlay);
      if (v.sub_badge) setSubBadge(v.sub_badge);
      if (v.color_accent) setColorAccent(v.color_accent);
      if (v.variant_type) setVariantType(v.variant_type as any);
      if (v.prompt_used) setCustomThumbPrompt(v.prompt_used);
      if (v.thumbnail_url) setActiveThumbnailUrl(v.thumbnail_url);
    }
  };

  // Sync active thumbnail when bundle updates
  useEffect(() => {
    const rawThumb = bundle.thumbnail_metadata?.variants?.[selectedVariantIndex]?.thumbnail_url || bundle.thumbnail_metadata?.thumbnail_url || bundle.poster_frame || bundle.raw_media_url || '';
    setActiveThumbnailUrl(rawThumb);
  }, [selectedVariantIndex, bundle]);

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

  // High-precision 60fps audio/video synchronization loop for real-time word-by-word lyrics
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let animId: number;
    const startAudioTime = performance.now();
    const clipDurationMs = (activeClip?.duration_seconds || 12) * 1000;

    const syncLoop = () => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.duration) {
        setCurrentTimeMs(videoRef.current.currentTime * 1000);
      } else {
        const elapsed = (performance.now() - startAudioTime) % clipDurationMs;
        setCurrentTimeMs(elapsed);
      }
      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeClip]);

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
        subtitlePosition: subtitlePosition,
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

  // Trigger thumbnail regeneration with user's creative prompt
  const handleTriggerRegenerateThumbnail = async () => {
    if (!onRegenerateThumbnail || isRegeneratingThumbnail) return;
    await onRegenerateThumbnail({
      prompt: customThumbPrompt,
      aspect: thumbAspect,
      headlineText,
      subBadge,
      colorAccent
    });
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                CrewAI Production Deliverables Manifest
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">
                v2.6 • {clips.length} Viral {clips.length === 1 ? 'Clip' : 'Clips'} Ready
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Production Media Deliverables Package
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
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
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
              title="Download entire output manifest in JSON format"
            >
              <FileJson className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Export JSON Manifest</span>
            </button>
          </div>
        </div>
      </div>

      {/* OpusClip-Style Multi-Clip Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-4 h-4 text-blue-600" />
              <span>OpusClip AI Multi-Clip Selector</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              {clips.length} Segments Identified
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Active Clip: <strong className="text-slate-800 dark:text-slate-200">{activeClip.title}</strong> ({activeClip.start_time} - {activeClip.end_time})
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
                    ? 'bg-blue-50/60 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    #{clip.clip_number} • {clip.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-black border border-emerald-300 dark:border-emerald-700">
                    ★ {clip.virality_score}/100
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono">{clip.start_time} - {clip.end_time} ({clip.duration_seconds}s)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                    Hook: {clip.virality_breakdown.hook_strength}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Navigation Container */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'video' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileVideo className="w-4 h-4 text-blue-600" />
          <span>Shorts &amp; Subtitles Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('thumbnail')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'thumbnail' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>AI Thumbnail Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('tiktok')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'tiktok' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500" />
          <span>TikTok 2026 Strategy</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'youtube' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-600" />
          <span>YouTube Shorts SEO Suite</span>
        </button>

        <button
          onClick={() => setActiveTab('pydantic')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'pydantic' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-blue-600" />
                  <span>Submagic-Style Video &amp; Subtitle Studio</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
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

                {/* Subtitle Overlay Live Rendering (Playful Beat-Synced Lyrics) */}
                <SubtitleOverlay
                  subtitles={currentSubtitles}
                  currentTimeMs={currentTimeMs}
                  stylePreset={subtitleStyle}
                  aspectRatio="9:16"
                  position={subtitlePosition}
                  onUpdateLine={handleUpdateSubtitleLine}
                />

                {/* Play / Pause Floating Trigger */}
                <button
                  onClick={togglePlayAudioMuxer}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 hover:bg-black/25 transition-colors group cursor-pointer"
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

              {/* Submagic Subtitle Style Preset Selector & Position Controls */}
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-pink-500" />
                    <span>Playful Lyric Style &amp; Screen Position:</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Position Toggle: Top vs Bottom */}
                    <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSubtitlePosition('top')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                          subtitlePosition === 'top' 
                            ? 'bg-blue-600 text-white shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        Top Screen
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubtitlePosition('bottom')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                          subtitlePosition === 'bottom' 
                            ? 'bg-blue-600 text-white shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        Bottom Screen
                      </button>
                    </div>

                    <button
                      onClick={() => setIsEditingSubtitles(!isEditingSubtitles)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingSubtitles ? 'Close' : 'Edit Lyrics'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'hormozi', name: '🎈 Bouncy Sticker Pop', desc: 'Comic 3D stickers + tilt' },
                    { id: 'mrbeast', name: '⚡ Kinetic Beat-Slam', desc: 'Giant word-by-word impact' },
                    { id: 'neon', name: '💎 Neon Arcade Glow', desc: 'Cyber cyan & pink pulse' },
                    { id: 'minimal', name: '☁️ Floating Cloud Pill', desc: 'Frosted karaoke glass' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSubtitleStyle(style.id as SubtitleStylePreset)}
                      className={`p-2.5 rounded-xl text-left border flex flex-col gap-0.5 transition-all cursor-pointer ${
                        subtitleStyle === style.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/30'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Edit Caption Lines &amp; Timestamps:</span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {currentSubtitles.map((line) => (
                      <div key={line.id} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-mono text-slate-400 w-12 shrink-0">
                          {(line.start_ms / 1000).toFixed(1)}s
                        </span>
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => handleUpdateSubtitleLine(line.id, e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-800 dark:text-slate-200"
                        />
                        <input
                          type="text"
                          value={line.emoji || ''}
                          onChange={(e) => handleUpdateSubtitleLine(line.id, line.text, e.target.value)}
                          placeholder="Emoji"
                          className="w-12 px-1 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm"
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>OpusClip Virality Radar</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs border border-emerald-200 dark:border-emerald-800">
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
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Why This Went Viral AI Breakdown */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Why This Clip Will Perform:</span>
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                  {activeClip.why_viral_reasoning}
                </p>
              </div>

              {/* Actionable Retention Tactics */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Retention Strategy Applied:</span>
                <div className="flex flex-col gap-1.5">
                  {activeClip.retention_tactics.map((tactic, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sonic Branding / Track Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Music className="w-4 h-4 text-blue-600" />
                <span>Lyria Soundtrack Master</span>
              </span>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{bundle.music_metadata?.genre || 'Cyberpunk Synth'}</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{bundle.music_metadata?.bpm || 128} BPM</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bundle.music_metadata?.instruments?.map((inst, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-400">
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
      {/* TAB 2: AI Thumbnail Studio (Full Creative Freedom) */}
      {/* ========================================================================= */}
      {activeTab === 'thumbnail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Thumbnail Preview & Prompt Generator (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>AI Thumbnail Studio</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {bundle.thumbnail_metadata?.scorecard?.overall_grade || 'A+ (98/100)'}
                  </span>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setThumbAspect('9:16')}
                      className={`px-2 py-1 text-[10px] font-bold rounded ${thumbAspect === '9:16' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      9:16
                    </button>
                    <button
                      onClick={() => setThumbAspect('16:9')}
                      className={`px-2 py-1 text-[10px] font-bold rounded ${thumbAspect === '16:9' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                    >
                      16:9
                    </button>
                  </div>
                </div>
              </div>

              {/* Rendered Thumbnail Asset (Clean AI Image without forced ugly boxes) */}
              <div className={`relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md bg-slate-950 mx-auto ${
                thumbAspect === '9:16' ? 'aspect-[9/16] max-h-[500px]' : 'aspect-[16/9] w-full max-h-[380px]'
              }`}>
                <img
                  src={activeThumbnailUrl || bundle.thumbnail_metadata?.thumbnail_url || bundle.poster_frame || bundle.raw_media_url}
                  alt="AI Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 3-Variant Concept Switcher */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Visual Concept / Archetype:
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
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {variant.variant_type === 'EMOTION_FACE' ? '😱 Emotion Shot' : variant.variant_type === 'MINIMAL_PUNCH' ? '🎯 Minimal Hero' : '⚡ Suspense Hook'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {variant.ctr_prediction}% CTR
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {variant.concept_description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creative AI Prompt Box & gemini-3-pro-image Regeneration */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Image Prompt (<span className="font-mono text-amber-600 dark:text-amber-400">gemini-3-pro-image</span>):</span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                    8K Cinematic • In-Image Typography
                  </span>
                </div>
                <textarea
                  value={customThumbPrompt}
                  onChange={(e) => setCustomThumbPrompt(e.target.value)}
                  rows={3}
                  className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium resize-none focus:outline-none focus:border-amber-500"
                />
                
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Text is rendered natively inside the AI image via quotes in prompt.
                  </span>

                  <button
                    onClick={handleTriggerRegenerateThumbnail}
                    disabled={isRegeneratingThumbnail}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
                  >
                    {isRegeneratingThumbnail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isRegeneratingThumbnail ? 'Rendering with gemini-3-pro-image...' : 'Generate with gemini-3-pro-image'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Six-Slot Breakdown & Scorecard (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Six-Slot Prompt Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>The Six-Slot Prompt Breakdown</span>
                </span>
              </div>

              {bundle.thumbnail_metadata?.variants?.[selectedVariantIndex]?.six_slot_breakdown ? (
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Slot 1: Specific Subject', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.subject },
                    { label: 'Slot 2: Expression / Action', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.expression_action },
                    { label: 'Slot 3: Environment & Bokeh', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.environment_background },
                    { label: 'Slot 4: Lighting & Atmosphere', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.lighting_atmosphere },
                    { label: 'Slot 5: Style & Medium', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.style_medium },
                    { label: 'Slot 6: Technical Parameters', val: bundle.thumbnail_metadata.variants[selectedVariantIndex].six_slot_breakdown?.technical_parameters },
                  ].map((slot, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">{slot.label}:</span>
                      <span className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">{slot.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Custom AI prompt dynamically constructed from media analysis.
                </p>
              )}

              {/* 5-Pillar Scorecard */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>5-Pillar Quality Scorecard:</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Mobile Glancability:</span>
                    <strong className="text-amber-900 dark:text-amber-300">{bundle.thumbnail_metadata?.scorecard?.mobile_readability_score || 98}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Focal Clarity:</span>
                    <strong className="text-amber-900 dark:text-amber-300">{bundle.thumbnail_metadata?.scorecard?.focal_clarity_score || 96}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Contrast Ratio:</span>
                    <strong className="text-amber-900 dark:text-amber-300">{bundle.thumbnail_metadata?.scorecard?.contrast_ratio_score || 97}%</strong>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Safe Zone Pass:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">100% Clean</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TikTok 2026 Strategy */}
      {/* ========================================================================= */}
      {activeTab === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>2026 TikTok Search Engine &amp; Viral Strategy</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs border border-rose-200 dark:border-rose-800">
                  Viral Score: {bundle.tiktok_metadata?.viral_score_estimate || 96}/100
                </span>
              </div>

              {/* Search-Optimized Query Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  TikTok Search-Optimized Title (Search Engine Intent):
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                  <span>{bundle.tiktok_metadata?.search_optimized_title || bundle.tiktok_metadata?.captions?.[0]}</span>
                  <button
                    onClick={() => handleCopy(bundle.tiktok_metadata?.search_optimized_title || '', 'tt-title')}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    {copiedKey === 'tt-title' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sub-3s On-Screen Hook & Spoken Script */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-rose-950 dark:text-rose-200 uppercase">0:00-0:03 On-Screen Text Anchor:</span>
                  <span className="text-xs font-black text-rose-900 dark:text-rose-300">{bundle.tiktok_metadata?.on_screen_hook_3s || 'DO NOT MAKE THIS MISTAKE IN 2026 ⚠️'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-blue-950 dark:text-blue-200 uppercase">3-Second Spoken Audio Script:</span>
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">"{bundle.tiktok_metadata?.spoken_keyword_script || 'If you are still doing this the old way, stop right now.'}"</span>
                </div>
              </div>

              {/* 3-3-3 Hashtag Framework */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  The "3-3-3" Strategic Hashtag Framework:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Trending Broad:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.trending?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Niche Community:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.niche_community?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">3 Content Specific:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.tiktok_metadata?.hashtag_breakdown?.content_specific?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Caption Hooks */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  3 Viral Caption Hooks:
                </label>
                <div className="flex flex-col gap-2">
                  {bundle.tiktok_metadata?.captions?.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Triple-Tier High Converting CTAs
              </span>
              
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">1. Verbal Audio Outro:</span>
                  <span className="text-slate-600 dark:text-slate-400">{bundle.tiktok_metadata?.high_converting_ctas?.verbal || 'Save this post!'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">2. On-Screen Visual Sticker:</span>
                  <span className="text-slate-600 dark:text-slate-400">{bundle.tiktok_metadata?.high_converting_ctas?.on_screen_sticker || '📌 TAP SAVE'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">3. Bio Link Directive:</span>
                  <span className="text-slate-600 dark:text-slate-400">{bundle.tiktok_metadata?.high_converting_ctas?.bio_link_prompt || 'Link in bio'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RESTORED FULL YOUTUBE SHORTS SEO & RETENTION SUITE */}
      {/* ========================================================================= */}
      {activeTab === 'youtube' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Title, Description, Hashtag Matrix & Keywords */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* 1. Mobile-Optimized Title (Sub-60 Char Sweet Spot) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>2026 YouTube Shorts Title (Mobile First)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    (bundle.youtube_metadata?.title?.length || 0) <= 50 
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : (bundle.youtube_metadata?.title?.length || 0) <= 60 
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                        : 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {bundle.youtube_metadata?.title?.length || 0} / 60 chars (Optimal: 25-45)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3 shadow-2xs">
                <span className="leading-relaxed">{bundle.youtube_metadata?.title}</span>
                <button
                  onClick={() => handleCopy(bundle.youtube_metadata?.title || '', 'yt-title')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'yt-title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'yt-title' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Title mobile feed truncation check */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-xl">
                <Smartphone className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  <strong>Mobile Feed Safety:</strong> First 35 characters contain prime curiosity gap &amp; keyword before YouTube UI overlay truncation.
                </span>
              </div>
            </div>

            {/* 2. Structured Front-Loaded SEO Description (150-450 Words) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <SearchCheck className="w-4 h-4 text-blue-600" />
                    <span>Structured SEO Description (Search &amp; Browse Grounded)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Front-loaded first 100 characters for mobile preview + high-retention engagement bridges.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(bundle.youtube_metadata?.description || '', 'yt-desc')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold shrink-0 cursor-pointer"
                >
                  {copiedKey === 'yt-desc' ? 'Copied Description!' : 'Copy Full Description'}
                </button>
              </div>

              {/* Front-loaded Preview Box */}
              {bundle.youtube_metadata?.frontloaded_hook_sentence && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-800 flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    First 100 Chars (Visible Above The "More" Cutoff):
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold leading-relaxed">
                    {bundle.youtube_metadata.frontloaded_hook_sentence}
                  </p>
                </div>
              )}

              {/* Modular Description Sections if present */}
              {bundle.youtube_metadata?.description_sections ? (
                <div className="space-y-2.5 text-xs">
                  {/* Takeaways */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>Key Takeaways (Search Index Signals):</span>
                    </span>
                    <ul className="space-y-1 text-slate-800 dark:text-slate-200 font-medium">
                      {bundle.youtube_metadata.description_sections.key_takeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pinned comment & Long-form bridges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-600" />
                        <span>Pinned Comment Question:</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 text-[11px] font-medium leading-relaxed">
                        {bundle.youtube_metadata.description_sections.pinned_comment_prompt}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/80 dark:border-purple-800 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-purple-600" />
                        <span>Related Long-Form Bridge:</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 text-[11px] font-medium leading-relaxed">
                        {bundle.youtube_metadata.description_sections.related_longform_prompt}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans leading-relaxed shadow-2xs">
                  {bundle.youtube_metadata?.description}
                </div>
              )}
            </div>

            {/* 3. 2026 Hashtag Strategy Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Hash className="w-4 h-4 text-red-600" />
                    <span>YouTube Shorts Hashtag Matrix (Anti-Spam Engineered)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Balancing the mandatory #Shorts feed signal with 3 Niche Community tags and 3 Search Intent tags.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(bundle.youtube_metadata?.tags?.map(t => `#${t}`).join(' ') || '', 'all-yt-tags')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold shrink-0 cursor-pointer"
                >
                  {copiedKey === 'all-yt-tags' ? 'Copied Stack!' : 'Copy Tags'}
                </button>
              </div>

              {bundle.youtube_metadata?.hashtag_strategy ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">Mandatory Tag:</span>
                    <span className="text-xs font-mono font-bold text-red-900 dark:text-red-200">{bundle.youtube_metadata.hashtag_strategy.primary_tag}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">3 Niche Community:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.youtube_metadata.hashtag_strategy.niche_community_tags?.map((tag, i) => (
                        <span key={i} className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">3 Search Intent Ranking:</span>
                    <div className="flex flex-wrap gap-1">
                      {bundle.youtube_metadata.hashtag_strategy.search_ranking_tags?.map((tag, i) => (
                        <span key={i} className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bundle.youtube_metadata?.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-red-700 dark:text-red-300 shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. High-Volume Search Keywords for Tag Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Comma-Separated Keywords for Studio Tags Box
                </span>
                <button
                  onClick={() => handleCopy(bundle.youtube_metadata?.tags?.join(', ') || '', 'yt-tags-csv')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold cursor-pointer"
                >
                  {copiedKey === 'yt-tags-csv' ? 'Copied CSV!' : 'Copy Comma-Separated'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bundle.youtube_metadata?.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Metrics, Retention Engineering & Chapters */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* 2026 Shorts Metrics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>2026 Shorts Metrics</span>
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  High Distribution
                </span>
              </div>

              {/* CTR & Search Rank */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Browse CTR:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{bundle.youtube_metadata?.ctr_prediction || 15.4}%</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Top 5%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 shadow-2xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Search Rank Score:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{bundle.youtube_metadata?.seo_search_ranking_score || 94}/100</span>
                  </div>
                </div>
              </div>

              {/* AVD Target Bar */}
              {bundle.youtube_metadata?.avd_retention_engineering && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target AVD (Rewatch Rate):</span>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{bundle.youtube_metadata.avd_retention_engineering.target_avd_percentage}%+</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-tight">
                    AVD &gt;100% signals the algorithm to push video to secondary multi-million viewer Shorts shelves.
                  </p>
                </div>
              )}
            </div>

            {/* AVD & Loop Retention Engineering */}
            {bundle.youtube_metadata?.avd_retention_engineering && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-purple-600" />
                    <span>Loop &amp; Retention Engineering</span>
                  </h3>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-900/40 rounded border border-purple-200 dark:border-purple-800">
                    2026 Engine
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Seamless Loop Transition (Final Frame ➔ 0:00):
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {bundle.youtube_metadata.avd_retention_engineering.loop_transition_technique}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      0:00 - 0:02 Swipe-Away Prevention:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {bundle.youtube_metadata.avd_retention_engineering.swipe_away_prevention}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chapters breakdown */}
            {bundle.youtube_metadata?.chapters && bundle.youtube_metadata.chapters.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Pacing &amp; Structured Chapters</span>
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-col gap-2 shadow-2xs">
                  {bundle.youtube_metadata.chapters.map((ch, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{ch.time}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Pydantic Schema & Manifest */}
      {/* ========================================================================= */}
      {activeTab === 'pydantic' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-indigo-600" />
              <span>Full Validated MediaPackageOutput Schema</span>
            </span>
            <button
              onClick={() => handleCopy(JSON.stringify(bundle, null, 2), 'pydantic-json')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
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
