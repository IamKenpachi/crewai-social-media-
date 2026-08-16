import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineStudio } from './components/PipelineStudio';
import { DagGraphViewer } from './components/DagGraphViewer';
import { DeliverablesBundle } from './components/DeliverablesBundle';
import { CodeInspector } from './components/CodeInspector';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ProjectHistoryModal } from './components/ProjectHistoryModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MediaPackageOutput, AgentLogEntry, SampleMedia, SavedProject } from './types';
import { INITIAL_DEMO_BUNDLE, INITIAL_DEMO_LOGS } from './data/demoBundle';
import { DEFAULT_EXECUTION_METRICS } from './data/demoContent';
import { Package, History, Sparkles, AlertCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

// Sanitize bundle to avoid browser LocalStorage quota limits (strip massive raw video base64 payloads)
function sanitizeBundleForStorage(bundle: MediaPackageOutput): MediaPackageOutput {
  const sanitized = { ...bundle };
  if (sanitized.raw_media_url && sanitized.raw_media_url.startsWith('data:video/')) {
    sanitized.raw_media_url = '';
  }
  if (sanitized.final_video_path && sanitized.final_video_path.startsWith('data:video/')) {
    sanitized.final_video_path = '';
  }
  if (sanitized.poster_frame && sanitized.poster_frame.length > 80000) {
    sanitized.poster_frame = '';
  }
  return sanitized;
}

// Safe LocalStorage saver with automatic quota fallback trimming
function safeSaveProjects(projects: SavedProject[]): boolean {
  try {
    localStorage.setItem('crewai_saved_projects', JSON.stringify(projects));
    return true;
  } catch (e) {
    console.warn('LocalStorage quota limit reached, trimming older runs:', e);
    try {
      const trimmed = projects.slice(0, 3);
      localStorage.setItem('crewai_saved_projects', JSON.stringify(trimmed));
      return true;
    } catch {
      return false;
    }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'dag' | 'deliverables' | 'code' | 'guide'>('studio');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [activeAgentId, setActiveAgentId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [bundle, setBundle] = useState<MediaPackageOutput | null>(null);
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState<boolean>(false);

  // Dark / Light Studio Theme State (Obsidian Dark by default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crewai_studio_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('crewai_studio_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Modals state
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Saved Projects History State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem('crewai_saved_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveCurrentProject = () => {
    if (!bundle) return;
    try {
      const sanitized = sanitizeBundleForStorage(bundle);
      const newProject: SavedProject = {
        id: `proj_${Date.now()}`,
        name: bundle.creative_brief?.summary?.substring(0, 36) || 'Untitled Production Run',
        savedAt: new Date().toISOString(),
        thumbnailUrl: bundle.thumbnail_metadata?.thumbnail_url || bundle.poster_frame || '',
        bundle: sanitized,
        model: selectedModel,
        viralityScore: bundle.clips?.[0]?.virality_score || 96
      };

      setSavedProjects(prev => {
        const updated = [newProject, ...prev];
        safeSaveProjects(updated);
        return updated;
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    if (!project || !project.bundle) return;
    try {
      const loadedBundle: MediaPackageOutput = {
        ...project.bundle,
        clips: project.bundle.clips && project.bundle.clips.length > 0 ? project.bundle.clips : [],
        subtitles: project.bundle.subtitles || [],
        execution_metrics: project.bundle.execution_metrics || DEFAULT_EXECUTION_METRICS
      };
      setBundle(loadedBundle);
      setActiveTab('deliverables');
    } catch (err) {
      console.error('Failed to load project bundle:', err);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setSavedProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      safeSaveProjects(updated);
      return updated;
    });
  };

  // API Key & Model selection state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('crewai_gemini_api_key') || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('crewai_gemini_model') || 'gemini-3.7-flash';
  });
  const [pipelineError, setPipelineError] = useState<string | null>(null);

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

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === '1') {
        setActiveTab('studio');
      } else if (e.key === '2') {
        setActiveTab('dag');
      } else if (e.key === '3') {
        setActiveTab('deliverables');
      } else if (e.key === '4') {
        setActiveTab('code');
      } else if (e.key === '5') {
        setActiveTab('guide');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-seed initial multi-clip creative brief & pipeline state on load
  useEffect(() => {
    setBundle(INITIAL_DEMO_BUNDLE);
    setLogs(INITIAL_DEMO_LOGS);
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
    setPipelineError(null);

    const clientVideoUrl = config.videoUrl || config.selectedMedia?.videoUrl;
    let p1Timer: ReturnType<typeof setTimeout> | null = null;
    let p2Timer: ReturnType<typeof setTimeout> | null = null;

    try {
      p1Timer = setTimeout(() => {
        setCurrentPhase(2);
        setActiveAgentId('tiktok_strategist');
      }, 900);

      p2Timer = setTimeout(() => {
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

      if (p1Timer) clearTimeout(p1Timer);
      if (p2Timer) clearTimeout(p2Timer);

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
        
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error(data.error || 'Failed to complete pipeline execution');
      }
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      setPipelineError(err?.message || 'Pipeline execution failed. Please verify your connection or API key settings.');
    } finally {
      if (p1Timer) clearTimeout(p1Timer);
      if (p2Timer) clearTimeout(p2Timer);
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
        const newThumb = data.thumbnailUrl;
        setBundle({
          ...bundle,
          thumbnail_metadata: {
            ...bundle.thumbnail_metadata,
            thumbnail_url: newThumb,
            prompt_used: prompt,
            aspect_ratio: aspect,
            headline_overlay: headlineText || bundle.thumbnail_metadata?.headline_overlay,
            sub_badge: subBadge || bundle.thumbnail_metadata?.sub_badge,
            color_accent: colorAccent || bundle.thumbnail_metadata?.color_accent,
            variants: bundle.thumbnail_metadata?.variants && bundle.thumbnail_metadata.variants.length > 0
              ? bundle.thumbnail_metadata.variants.map((v, i) => (i === 0 ? { ...v, thumbnail_url: newThumb, prompt_used: prompt } : v))
              : [{ id: 'var-0', variant_type: 'CURIOSITY_GAP', title: 'Custom Render', concept_description: prompt, thumbnail_url: newThumb, prompt_used: prompt, headline_overlay: headlineText || '', sub_badge: subBadge || '', color_accent: colorAccent || '#FACC15', ctr_prediction: 18.5, focal_point_focus: 'Central Hero Focus' }]
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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      
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
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        savedCount={savedProjects.length}
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

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Project History & Saved Runs Modal */}
      <ProjectHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedProjects={savedProjects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onSaveCurrentBundle={handleSaveCurrentProject}
        hasCurrentBundle={!!bundle}
      />

      {/* Main Studio Viewport with Error Boundary */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {pipelineError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-sm font-medium">{pipelineError}</span>
            </div>
            <button
              onClick={() => setPipelineError(null)}
              className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <ErrorBoundary onReset={() => setActiveTab('studio')}>
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
              apiKey={apiKey}
            />
          )}

          {activeTab === 'deliverables' && (
            bundle ? (
              <DeliverablesBundle
                bundle={bundle}
                onRegenerateThumbnail={handleRegenerateThumbnail}
                isRegeneratingThumbnail={isRegeneratingThumbnail}
              />
            ) : (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    No Active Deliverables Generated Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                    Run the multi-agent pipeline in the Studio Runner or load a previous run from your history to view the output video, thumbnails, copy, and lyrics.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('studio')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Go to Studio Runner</span>
                  </button>
                  {savedProjects.length > 0 && (
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Load Saved Run ({savedProjects.length})</span>
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {activeTab === 'code' && (
            <CodeInspector />
          )}

          {activeTab === 'guide' && (
            <ArchitectureGuide />
          )}
        </ErrorBoundary>
      </main>

    </div>
  );
}
