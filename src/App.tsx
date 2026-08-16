import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineStudio } from './components/PipelineStudio';
import { DagGraphViewer } from './components/DagGraphViewer';
import { DeliverablesBundle } from './components/DeliverablesBundle';
import { CodeInspector } from './components/CodeInspector';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { MediaPackageOutput, AgentLogEntry, SampleMedia } from './types';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'dag' | 'deliverables' | 'code' | 'guide'>('studio');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [activeAgentId, setActiveAgentId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [bundle, setBundle] = useState<MediaPackageOutput | null>(null);
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState<boolean>(false);

  // API Key & Model selection state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('crewai_gemini_api_key') || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('crewai_gemini_model') || 'gemini-3.7-flash';
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('crewai_gemini_api_key', newKey);
    } else {
      localStorage.removeItem('crewai_gemini_api_key');
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('crewai_gemini_model', modelId);
  };

  // Auto-seed initial creative brief & pipeline state on load
  useEffect(() => {
    const initialBundle: MediaPackageOutput = {
      final_video_path: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-at-night-41584-large.mp4',
      thumbnail_path: './exports/youtube_thumbnail.png',
      creative_brief: {
        summary: 'High-speed cinematic visual sequence with dynamic motion, neon accents, and crisp pacing.',
        key_hooks: [
          'First 2 seconds feature high-retention visual dive',
          'Dynamic atmospheric lighting with bass drop timing',
          'Climactic camera motion creating curiosity loop'
        ],
        mood_and_tone: 'Cyberpunk, High Energy, Synthwave, Dark Electronic',
        suggested_bpm: 128,
        visual_motifs: ['Holographic light', 'Reflective surfaces', 'High-contrast neon', 'Dynamic motion'],
        color_palette: ['#0f172a', '#38bdf8', '#e11d48', '#22c55e'],
        pacing: 'Fast-paced rhythmic cut transitions',
        target_audience: 'Social media creators, tech enthusiasts, and viral gaming audiences',
        detected_topics: ['Cyberpunk', 'Futuristic City', 'Cinematic Motion', 'VFX CGI']
      },
      tiktok_metadata: {
        captions: [
          'Wait for the drop at 0:08… my jaw literally dropped! 🤯 #cyberpunk',
          'Is this what cities will look like in 2077? 👀 #future',
          '3 hidden easter eggs you missed in the first 5 seconds ⚡'
        ],
        hashtags: ['#fyp', '#viral', '#cyberpunk', '#synthwave', '#scifi', '#futurecity', '#cinematic', '#trending'],
        cta: 'Comment your favorite vehicle model! Follow for Part 2 🚀',
        hook_technique: 'Visual Disruption + Suspense Curve',
        viral_score_estimate: 96
      },
      youtube_metadata: {
        title: 'I Built a Cyberpunk City in 4K 60FPS! 🔥 #Shorts',
        description: 'Take a flight through the high-density holographic towers of Neo-Metropolis.\n\n⏱️ TIMESTAMPS:\n0:00 - High-Speed Dive\n0:06 - Holographic Plaza\n0:12 - Night Traffic Grid\n\n🎵 Soundtrack: Google Lyria Synthwave Track (128 BPM)\n🔔 Subscribe for daily futuristic render shorts!\n#Shorts #Cyberpunk #SciFi #VFX',
        tags: ['shorts', 'cyberpunk', 'synthwave', 'sci-fi', 'futuristic', 'future tech', '4k 60fps', 'vfx', 'cgi render', 'trending'],
        chapters: [
          { time: '0:00', title: 'High-Speed Dive' },
          { time: '0:06', title: 'Holographic Plaza' },
          { time: '0:12', title: 'Night Traffic Grid' }
        ],
        search_keywords: ['cyberpunk shorts', 'future city pov', 'high speed drone 4k'],
        ctr_prediction: 13.6
      },
      thumbnail_metadata: {
        prompt_used: 'YouTube thumbnail style, 9:16 vertical high contrast, neon holographic skyscraper canyon, flying neon hovercraft diving straight down, rain reflections, volumetric lighting, ultra-detailed 8K render',
        thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
        aspect_ratio: '9:16',
        visual_style: 'Hyper-detailed 3D cinematic render with high rim-lighting',
        headline_overlay: 'FUTURE REVEALED ⚡'
      },
      music_metadata: {
        prompt_used: 'Cyberpunk synthwave track with punchy 808 sub-bass, driving 16th-note analog arpeggios, and atmospheric vocal chops at 128 BPM.',
        genre: 'Cyberpunk Synthwave & Electronic Beat',
        bpm: 128,
        audio_url: '/audio/ambient-beat.mp3',
        instruments: ['Moog Bass', '808 Drums', 'Synth Arpeggiator', 'Analog Lead', 'Cyber Reverb'],
        energy_curve: 'Punchy intro building into dynamic beat drop at 0:04',
        duration_seconds: 30
      },
      audio_ducking_level: 0.22,
      ffmpeg_command_executed: 'ffmpeg -y -i input_video.mp4 -stream_loop -1 -i bg_music_lyria.mp3 -filter_complex "[1:a]volume=0.22[bg];[0:a][bg]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -shortest ./exports/final_video_with_lyria_music.mp4',
      execution_metrics: {
        total_latency_ms: 2420,
        sequential_estimate_ms: 8650,
        latency_saved_percent: 72,
        tokens_consumed: 1740,
        timestamp: new Date().toISOString()
      }
    };

    setBundle(initialBundle);
    setLogs([
      {
        id: 'init-1',
        agentId: 'video_analyst',
        agentName: 'Agent 1: Multimodal Analyst',
        role: 'Perception Agent',
        phase: 1,
        status: 'completed',
        toolUsed: 'GeminiVideoAnalysisTool (gemini-3.7-flash)',
        durationMs: 820,
        timestamp: '12:00:01',
        outputSummary: 'Extracted Creative Brief: Cyberpunk Synthwave @ 128 BPM with 3 visual hooks.'
      },
      {
        id: 'init-2',
        agentId: 'tiktok_strategist',
        agentName: 'Agent 2: TikTok Copywriter',
        role: 'Short-form Retention Specialist',
        phase: 2,
        status: 'completed',
        toolUsed: 'Pydantic TikTokContent Validator',
        durationMs: 640,
        timestamp: '12:00:02',
        outputSummary: 'Generated 3 viral hooks & 8 hashtags (Viral Score: 96/100).'
      },
      {
        id: 'init-3',
        agentId: 'yt_strategist',
        agentName: 'Agent 3: YouTube SEO Lead',
        role: 'Search & Algorithm Strategist',
        phase: 2,
        status: 'completed',
        toolUsed: 'YouTubeMetadataEngine & SEO Ranker',
        durationMs: 680,
        timestamp: '12:00:02',
        outputSummary: 'Title: "I Built a Cyberpunk City in 4K 60FPS!" with 13.6% CTR prediction.'
      },
      {
        id: 'init-4',
        agentId: 'art_director',
        agentName: 'Agent 4: Art Director',
        role: 'AI Visuals & Thumbnail Lead',
        phase: 2,
        status: 'completed',
        toolUsed: 'ThumbnailGeneratorTool (Imagen 3 / Nano Banana)',
        durationMs: 710,
        timestamp: '12:00:02',
        outputSummary: 'Rendered 9:16 high-CTR thumbnail asset with volumetric lighting.'
      },
      {
        id: 'init-5',
        agentId: 'audio_director',
        agentName: 'Agent 5: Audio Maestro',
        role: 'Soundtrack & Mood Producer',
        phase: 2,
        status: 'completed',
        toolUsed: 'LyriaMusicGenTool (Google DeepMind Lyria)',
        durationMs: 690,
        timestamp: '12:00:02',
        outputSummary: 'Composed Lyria soundtrack: Cyberpunk Synthwave @ 128 BPM.'
      },
      {
        id: 'init-6',
        agentId: 'production_engineer',
        agentName: 'Agent 6: Post-Production Engineer',
        role: 'Media Packager & FFmpeg Muxer',
        phase: 3,
        status: 'completed',
        toolUsed: 'VideoAudioMuxerTool (FFmpeg Audio Ducking @ 22% Volume)',
        durationMs: 230,
        timestamp: '12:00:03',
        outputSummary: 'Rendered ducked MP4 master and packaged full export bundle.'
      }
    ]);
  }, []);

  const handleRunPipeline = async (config: {
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
  }) => {
    setIsRunning(true);
    setCurrentPhase(1);
    setActiveAgentId('video_analyst');
    setLogs([]);

    const clientVideoUrl = config.videoUrl || config.selectedMedia?.videoUrl;

    try {
      // Step simulation for visual state progress
      const p1Timer = setTimeout(() => {
        setCurrentPhase(2);
        setActiveAgentId('tiktok_strategist');
      }, 900);

      const p2Timer = setTimeout(() => {
        setCurrentPhase(3);
        setActiveAgentId('production_engineer');
      }, 2200);

      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaTitle: config.customTitle,
          mediaDescription: config.customDescription,
          category: config.selectedMedia?.category || 'General',
          targetMood: config.targetMood,
          bpmOverride: config.bpmOverride,
          aspectRatio: config.aspectRatio,
          duckingVolume: config.duckingVolume,
          videoUrl: clientVideoUrl,
          imageBase64: config.imageBase64 || config.selectedMedia?.thumbnailUrl,
          videoFrames: config.videoFrames,
          apiKey: apiKey.trim(),
          model: selectedModel,
        }),
      });

      clearTimeout(p1Timer);
      clearTimeout(p2Timer);

      const data = await response.json();

      if (data.success && data.bundle) {
        const enrichedBundle = {
          ...data.bundle,
          final_video_path: clientVideoUrl || data.bundle.final_video_path,
          final_media_type: clientVideoUrl ? 'video' : (data.bundle.final_media_type || (config.imageBase64 ? 'image' : 'video')),
          poster_frame: config.imageBase64 || data.bundle.poster_frame,
          raw_media_url: clientVideoUrl || config.imageBase64 || data.bundle.raw_media_url,
        };
        setBundle(enrichedBundle);
        setLogs(data.logs || []);
        setCurrentPhase(3);
        
        // Trigger celebratory confetti on completion
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error(data.error || 'Failed to complete execution');
      }
    } catch (err: any) {
      console.warn('Backend execution note:', err?.message);
    } finally {
      setIsRunning(false);
      setActiveAgentId(undefined);
    }
  };

  const handleRegenerateThumbnail = async (
    promptOrOptions: string | {
      prompt: string;
      aspect: '9:16' | '16:9';
      headlineText?: string;
      subBadge?: string;
      colorAccent?: string;
    }, 
    aspectFallback: '9:16' | '16:9' = '9:16'
  ) => {
    setIsRegeneratingThumbnail(true);
    const prompt = typeof promptOrOptions === 'string' ? promptOrOptions : promptOrOptions.prompt;
    const aspect = typeof promptOrOptions === 'string' ? aspectFallback : promptOrOptions.aspect;
    const headlineText = typeof promptOrOptions === 'object' ? promptOrOptions.headlineText : undefined;
    const subBadge = typeof promptOrOptions === 'object' ? promptOrOptions.subBadge : undefined;
    const colorAccent = typeof promptOrOptions === 'object' ? promptOrOptions.colorAccent : undefined;
    const sourceFrame = bundle?.poster_frame || bundle?.raw_media_url || bundle?.thumbnail_metadata?.source_frame_url;

    try {
      const resp = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: aspect,
          title: bundle?.creative_brief?.summary?.substring(0, 20) || 'VIRAL MASTER',
          mood: bundle?.creative_brief?.mood_and_tone || 'CINEMATIC',
          apiKey: apiKey.trim(),
          sourceFrame,
          headlineText,
          subBadge,
          colorAccent
        })
      });
      const data = await resp.json();
      if (data.success && data.thumbnailUrl && bundle) {
        setBundle({
          ...bundle,
          thumbnail_metadata: {
            ...bundle.thumbnail_metadata,
            thumbnail_url: data.thumbnailUrl,
            prompt_used: prompt,
            aspect_ratio: aspect,
            headline_overlay: headlineText || bundle.thumbnail_metadata?.headline_overlay,
            sub_badge: subBadge || bundle.thumbnail_metadata?.sub_badge,
            color_accent: colorAccent || bundle.thumbnail_metadata?.color_accent,
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingThumbnail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        hasResults={!!bundle}
        latencySaved={bundle?.execution_metrics?.latency_saved_percent}
        selectedModel={selectedModel}
        hasCustomKey={!!apiKey}
        onOpenApiSettings={() => setIsApiModalOpen(true)}
      />

      {/* API Key & Model Parameters Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {activeTab === 'studio' && (
          <PipelineStudio
            onRunPipeline={handleRunPipeline}
            isRunning={isRunning}
            currentPhase={currentPhase}
            activeAgentId={activeAgentId}
            logs={logs}
            hasResults={!!bundle}
            onViewResults={() => setActiveTab('deliverables')}
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
            onOpenApiSettings={() => setIsApiModalOpen(true)}
            hasCustomKey={!!apiKey}
          />
        )}

        {activeTab === 'dag' && (
          <DagGraphViewer
            currentPhase={currentPhase}
            activeAgentId={activeAgentId}
            logs={logs}
            onSelectAgent={(agentId) => setActiveAgentId(agentId)}
          />
        )}

        {activeTab === 'deliverables' && bundle && (
          <DeliverablesBundle
            bundle={bundle}
            onRegenerateThumbnail={handleRegenerateThumbnail}
            isRegeneratingThumbnail={isRegeneratingThumbnail}
          />
        )}

        {activeTab === 'code' && (
          <CodeInspector />
        )}

        {activeTab === 'guide' && (
          <ArchitectureGuide />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CrewAI Media Production Studio</span>
            <span className="text-slate-300">•</span>
            <span>Powered by Gemini 3.7 Flash &amp; DeepMind Lyria</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Async Fan-Out Concurrency
            </span>
            <span className="text-slate-300">•</span>
            <span>Strict Pydantic Contracts</span>
            <span className="text-slate-300">•</span>
            <span>FFmpeg Audio Ducking</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
