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
import { MediaPackageOutput, AgentLogEntry, SampleMedia, SavedProject } from './types';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'dag' | 'deliverables' | 'code' | 'guide'>('studio');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [activeAgentId, setActiveAgentId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [bundle, setBundle] = useState<MediaPackageOutput | null>(null);
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState<boolean>(false);

  // Dark / Light Studio Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crewai_studio_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
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
    const newProject: SavedProject = {
      id: `proj_${Date.now()}`,
      name: bundle.creative_brief?.summary?.substring(0, 36) || 'Untitled Production Run',
      savedAt: new Date().toISOString(),
      thumbnailUrl: bundle.thumbnail_metadata?.thumbnail_url || bundle.poster_frame || '',
      bundle: bundle,
      model: selectedModel,
      viralityScore: bundle.clips?.[0]?.virality_score || 96
    };

    setSavedProjects(prev => {
      const updated = [newProject, ...prev];
      localStorage.setItem('crewai_saved_projects', JSON.stringify(updated));
      return updated;
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleLoadProject = (project: SavedProject) => {
    setBundle(project.bundle);
    setActiveTab('deliverables');
  };

  const handleDeleteProject = (projectId: string) => {
    setSavedProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('crewai_saved_projects', JSON.stringify(updated));
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
        detected_topics: ['Cyberpunk', 'Futuristic City', 'Cinematic Motion', 'VFX CGI'],
        peak_energy_timestamp: '0:07',
        peak_visual_climax: 'High-speed drone dive into neon holographic canyon'
      },
      clips: [
        {
          id: 'clip-1',
          clip_number: 1,
          title: 'The Curiosity Pattern Interrupt',
          hook_summary: 'Disrupts feed scrolling in first 1.2s with high-stakes visual suspense.',
          start_time: '0:00',
          end_time: '0:12',
          start_seconds: 0,
          end_seconds: 12,
          duration_seconds: 12,
          virality_score: 96,
          virality_breakdown: {
            hook_strength: 98,
            visual_climax: 94,
            topic_novelty: 92,
            audio_sync: 96,
            loop_continuity: 98
          },
          why_viral_reasoning: 'Combines an immediate cognitive curiosity gap with rapid pacing, forcing viewer dwell time beyond the 3-second algorithm test.',
          retention_tactics: [
            'Visual pattern interrupt at 0:00.8',
            'Sub-3s spoken audio hook synced with on-screen text',
            'Loop transition technique bridging the final frame back to 0:00'
          ],
          subtitles: [
            {
              id: 'sub-1',
              text: 'Wait until you see what happens next',
              start_ms: 200,
              end_ms: 2800,
              emoji: '🤯',
              words: [
                { id: 'w-1', text: 'Wait', start_ms: 200, end_ms: 600 },
                { id: 'w-2', text: 'until', start_ms: 600, end_ms: 1000 },
                { id: 'w-3', text: 'you', start_ms: 1000, end_ms: 1400 },
                { id: 'w-4', text: 'see', start_ms: 1400, end_ms: 1800 },
                { id: 'w-5', text: 'what', start_ms: 1800, end_ms: 2200 },
                { id: 'w-6', text: 'happens', start_ms: 2200, end_ms: 2500 },
                { id: 'w-7', text: 'next', start_ms: 2500, end_ms: 2800 }
              ]
            },
            {
              id: 'sub-2',
              text: 'This one technique changed everything',
              start_ms: 2900,
              end_ms: 6200,
              emoji: '⚡',
              words: [
                { id: 'w-8', text: 'This', start_ms: 2900, end_ms: 3400 },
                { id: 'w-9', text: 'one', start_ms: 3400, end_ms: 3900 },
                { id: 'w-10', text: 'technique', start_ms: 3900, end_ms: 4500 },
                { id: 'w-11', text: 'changed', start_ms: 4500, end_ms: 5300 },
                { id: 'w-12', text: 'everything', start_ms: 5300, end_ms: 6200 }
              ]
            },
            {
              id: 'sub-3',
              text: 'Look closely at the hidden detail',
              start_ms: 6300,
              end_ms: 9800,
              emoji: '👀',
              words: [
                { id: 'w-13', text: 'Look', start_ms: 6300, end_ms: 6900 },
                { id: 'w-14', text: 'closely', start_ms: 6900, end_ms: 7600 },
                { id: 'w-15', text: 'at', start_ms: 7600, end_ms: 8100 },
                { id: 'w-16', text: 'the', start_ms: 8100, end_ms: 8600 },
                { id: 'w-17', text: 'hidden', start_ms: 8600, end_ms: 9200 },
                { id: 'w-18', text: 'detail', start_ms: 9200, end_ms: 9800 }
              ]
            },
            {
              id: 'sub-4',
              text: 'Save this before you try it yourself!',
              start_ms: 9900,
              end_ms: 12000,
              emoji: '🚀',
              words: [
                { id: 'w-19', text: 'Save', start_ms: 9900, end_ms: 10400 },
                { id: 'w-20', text: 'this', start_ms: 10400, end_ms: 10800 },
                { id: 'w-21', text: 'before', start_ms: 10800, end_ms: 11200 },
                { id: 'w-22', text: 'you', start_ms: 11200, end_ms: 11500 },
                { id: 'w-23', text: 'try', start_ms: 11500, end_ms: 11800 },
                { id: 'w-24', text: 'it!', start_ms: 11800, end_ms: 12000 }
              ]
            }
          ]
        },
        {
          id: 'clip-2',
          clip_number: 2,
          title: 'The High-Speed Climax Drop',
          hook_summary: 'Focuses on the visual drop and rapid transition at second 0:07.',
          start_time: '0:05',
          end_time: '0:18',
          start_seconds: 5,
          end_seconds: 18,
          duration_seconds: 13,
          virality_score: 91,
          virality_breakdown: {
            hook_strength: 92,
            visual_climax: 98,
            topic_novelty: 88,
            audio_sync: 96,
            loop_continuity: 90
          },
          why_viral_reasoning: 'Peak visual motion triggers dopamine response, driving high replay rates and shares.',
          retention_tactics: [
            'Beat drop audio synchronization at 0:02 of the clip',
            'High contrast color saturation flare on transition',
            'Call-to-action placed right as climax resolves'
          ],
          subtitles: []
        },
        {
          id: 'clip-3',
          clip_number: 3,
          title: 'The Infinite Loop Breakdown',
          hook_summary: 'Engineered for >100% Average View Duration by connecting the end directly to the beginning.',
          start_time: '0:10',
          end_time: '0:22',
          start_seconds: 10,
          end_seconds: 22,
          duration_seconds: 12,
          virality_score: 88,
          virality_breakdown: {
            hook_strength: 86,
            visual_climax: 88,
            topic_novelty: 90,
            audio_sync: 92,
            loop_continuity: 99
          },
          why_viral_reasoning: 'Perfect audio-visual loop creates re-watch loops, signaling high engagement to the algorithm.',
          retention_tactics: [
            'Sentence beginning in outro finishes in intro',
            'Unresolved audio cadence at 0:11.5 resolves at 0:00'
          ],
          subtitles: []
        }
      ],
      selected_clip_id: 'clip-1',
      subtitles: [],
      subtitle_style: 'hormozi',
      tiktok_metadata: {
        captions: [
          'Wait for the drop at 0:08… my jaw literally dropped! 🤯 #cyberpunk',
          'Is this what cities will look like in 2077? 👀 #future',
          '3 hidden easter eggs you missed in the first 5 seconds ⚡'
        ],
        hashtags: ['#fyp', '#viral', '#cyberpunk', '#synthwave', '#scifi', '#futurecity', '#cinematic', '#trending'],
        cta: 'Comment your favorite vehicle model! Follow for Part 2 🚀',
        hook_technique: 'Visual Disruption + Suspense Curve',
        viral_score_estimate: 96,
        search_optimized_title: 'How futuristic cyberpunk cities are built in 4K 60FPS in 2026',
        on_screen_hook_3s: 'DO NOT MISS THIS DROP AT 0:08 ⚠️',
        spoken_keyword_script: 'Look at the holographic skyline before the camera dives down.',
        hashtag_breakdown: {
          trending: ['#ShortsViral', '#TechTok', '#CreatorEconomy'],
          niche_community: ['#CyberAesthetic', '#VFX', '#SciFiArt'],
          content_specific: ['#FutureCity', '#NeonLights', '#4K60FPS']
        },
        high_converting_ctas: {
          verbal: 'Save this video before you build your next render!',
          on_screen_sticker: '📌 TAP SAVE + SHARE TO YOUR STORY',
          bio_link_prompt: 'Drop a comment below and check the link in bio for the raw 4K preset.'
        },
        algorithm_retention_tactics: [
          'Visual pattern interrupt at second 0:01',
          'Spoken keyword match with on-screen subtitle',
          'Infinite loop hook'
        ]
      },
      youtube_metadata: {
        title: 'I Built a Cyberpunk City in 4K 60FPS! 🔥 #Shorts',
        description: 'Take a flight through the high-density holographic towers of Neo-Metropolis.\n\n⏱️ TIMESTAMPS:\n0:00 - High-Speed Dive\n0:06 - Holographic Plaza\n0:12 - Night Traffic Grid\n\n🎵 Soundtrack: Lyria Synthwave Track (128 BPM)\n🔔 Subscribe for daily futuristic render shorts!\n#Shorts #Cyberpunk #SciFi #VFX',
        tags: ['shorts', 'cyberpunk', 'synthwave', 'sci-fi', 'futuristic', 'future tech', '4k 60fps', 'vfx', 'cgi render', 'trending'],
        chapters: [
          { time: '0:00', title: 'High-Speed Dive' },
          { time: '0:06', title: 'Holographic Plaza' },
          { time: '0:12', title: 'Night Traffic Grid' }
        ],
        search_keywords: ['cyberpunk shorts', 'future city pov', 'high speed drone 4k'],
        ctr_prediction: 15.6,
        title_character_count: 48,
        frontloaded_hook_sentence: 'Discover the secret to rendering photorealistic holographic cities at 60FPS.',
        description_sections: {
          hook_and_summary: 'Discover the secret to rendering photorealistic holographic cities at 60FPS.',
          key_takeaways: [
            'Volumetric lighting and rain reflection passes',
            'Sub-bass audio sync with camera acceleration',
            'Seamless loop transition for maximum replay rate'
          ],
          pinned_comment_prompt: 'Which building design was your favorite? Let me know below!',
          related_longform_prompt: 'Watch the full 20-minute behind the scenes breakdown on our channel.',
          social_links_and_sources: 'Subscribe for daily CGI and futuristic tech shorts.'
        },
        hashtag_strategy: {
          primary_tag: '#Shorts',
          niche_community_tags: ['#Cyberpunk', '#SciFiArt', '#VFX'],
          search_ranking_tags: ['#4K60FPS', '#FutureCityPOV', '#BlenderRender']
        },
        avd_retention_engineering: {
          loop_transition_technique: 'Seamless camera acceleration connects final frame to opening dive.',
          target_avd_percentage: 112,
          swipe_away_prevention: 'Immediate high-speed visual drop in first 0.5 seconds.'
        }
      },
      thumbnail_metadata: {
        prompt_used: 'YouTube thumbnail style, 9:16 vertical high contrast, neon holographic skyscraper canyon, flying neon hovercraft diving straight down, rain reflections, volumetric lighting, ultra-detailed 8K render',
        thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
        aspect_ratio: '9:16',
        visual_style: 'Hyper-detailed 3D cinematic render with high rim-lighting',
        headline_overlay: 'FUTURE REVEALED ⚡',
        sub_badge: '★ MUST WATCH',
        color_accent: '#FACC15',
        ctr_prediction: 19.4,
        scorecard: {
          overall_grade: 'A+ (98/100)',
          mobile_readability_score: 98,
          focal_clarity_score: 96,
          contrast_ratio_score: 97,
          text_economy_pass: true,
          safe_zone_audit_pass: true,
          psychological_triggers: [
            'Curiosity Gap (Open Psychological Loop)',
            'Selective Vibrancy & Matte Shadow Separation',
            'Biological Gaze Alignment',
            'Electric Yellow Salience (+19% CTR)'
          ],
          recommendations: [
            'Electric Yellow (#FACC15) variant provides maximum contrast against YouTube Dark Mode feeds',
            'Text is kept under 4 words (<18 characters) for instantaneous comprehension on mobile'
          ]
        },
        variants: [
          {
            id: 'var-a',
            variant_type: 'EMOTION_FACE',
            title: 'Variant A: High Emotion & Reaction (Shock/Disbelief)',
            concept_description: 'Captures maximum emotional intensity and high-stakes disbelief (+42% curiosity click lift).',
            headline_overlay: 'DON\'T PANIC 🚨',
            sub_badge: '⚡ SHOCKING',
            color_accent: '#EF4444',
            ctr_prediction: 18.6,
            focal_point_focus: 'Peak reaction moment at 0:07',
            prompt_used: 'Expressive creator reaction to cyberpunk dive',
            thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
            six_slot_breakdown: {
              subject: 'Creator staring in disbelief at holographic city skyline',
              expression_action: 'Wide-eyed shock with jaw dropped',
              environment_background: 'Cinematic blurred neon skyscrapers in rain',
              lighting_atmosphere: 'Intense crimson red 3D rim-lighting and volumetric haze',
              style_medium: 'Hyper-detailed cinematic photography, 8K octane render',
              technical_parameters: 'Rule of thirds, off-center placement, --ar 9:16 --v 7'
            }
          },
          {
            id: 'var-b',
            variant_type: 'CURIOSITY_GAP',
            title: 'Variant B: Curiosity Gap / Open Loop (+19% Browse CTR)',
            concept_description: 'Opens an unresolved narrative question paired with high-contrast electric yellow.',
            headline_overlay: 'FUTURE REVEALED ⚡',
            sub_badge: '★ MUST WATCH',
            color_accent: '#FACC15',
            ctr_prediction: 20.4,
            focal_point_focus: 'Climactic turn at 0:07',
            prompt_used: 'Neon hovercraft diving into canyon',
            thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
            six_slot_breakdown: {
              subject: 'Futuristic vehicle diving vertically through holographic clouds',
              expression_action: 'High-speed kinetic motion blur and light trails',
              environment_background: 'Cyberpunk metropolis canyon with glowing billboards',
              lighting_atmosphere: 'Electric yellow and cyan dual rim-lighting',
              style_medium: 'Ultra-detailed 3D digital art, raytraced reflections',
              technical_parameters: 'Top-down dynamic perspective, --ar 9:16 --v 7'
            }
          },
          {
            id: 'var-c',
            variant_type: 'MINIMAL_PUNCH',
            title: 'Variant C: Selective Minimalist Punch (3-Second Glancability)',
            concept_description: 'Ultra-clean single subject on deep matte black, engineered for instant comprehension.',
            headline_overlay: 'THE 1% HACK 🎯',
            sub_badge: 'PRO TIP',
            color_accent: '#38BDF8',
            ctr_prediction: 17.2,
            focal_point_focus: 'High-contrast hero silhouette',
            prompt_used: 'Single glowing cyberpunk spire',
            thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
            six_slot_breakdown: {
              subject: 'Monolithic cyber tower silhouette with central glowing core',
              expression_action: 'Static epic scale and symmetry',
              environment_background: 'Deep matte black background with clean vignette',
              lighting_atmosphere: 'Cyber cyan high-intensity edge glow',
              style_medium: 'Minimalist graphic poster art, vector precision',
              technical_parameters: 'Dead center hero focus, --ar 9:16 --v 7'
            }
          }
        ]
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
        agentName: 'Agent 1: Multimodal Perception & Clip Analyst',
        role: 'Perception Agent & Director',
        phase: 1,
        status: 'completed',
        toolUsed: 'GeminiVideoAnalysisTool (gemini-3.7-flash)',
        durationMs: 820,
        timestamp: '12:00:01',
        outputSummary: 'Extracted Creative Brief & 3 segmented viral clips: Cyberpunk Synthwave @ 128 BPM.'
      },
      {
        id: 'init-2',
        agentId: 'tiktok_strategist',
        agentName: 'Agent 2: TikTok SEO & Viral Strategist',
        role: 'Short-form Retention Specialist',
        phase: 2,
        status: 'completed',
        toolUsed: 'TikTok 2026 SEO Engine & 3-3-3 Hashtag Optimizer',
        durationMs: 640,
        timestamp: '12:00:02',
        outputSummary: 'Generated search query title, 3 viral hooks & 3-3-3 hashtags (Viral Score: 96/100).'
      },
      {
        id: 'init-3',
        agentId: 'yt_strategist',
        agentName: 'Agent 3: YouTube Shorts SEO & AVD Architect',
        role: 'Search & Algorithm Strategist',
        phase: 2,
        status: 'completed',
        toolUsed: 'YouTubeMetadataEngine & AVDRetentionRanker',
        durationMs: 680,
        timestamp: '12:00:02',
        outputSummary: 'Frontloaded title: "I Built a Cyberpunk City in 4K 60FPS!" with 112% AVD infinite loop.'
      },
      {
        id: 'init-4',
        agentId: 'art_director',
        agentName: 'Agent 4: AI Thumbnail Art Director',
        role: 'AI Visuals & Click-Through Lead',
        phase: 2,
        status: 'completed',
        toolUsed: 'SixSlotPromptArchitect + gemini-3-pro-image',
        durationMs: 710,
        timestamp: '12:00:02',
        outputSummary: 'Engineered 3 Six-Slot A/B/C archetypes with 5-Pillar Scorecard (A+ 98/100).'
      },
      {
        id: 'init-5',
        agentId: 'audio_director',
        agentName: 'Agent 5: Audio Maestro & Sound Producer',
        role: 'Soundtrack & Sonic Producer',
        phase: 2,
        status: 'completed',
        toolUsed: 'LyriaMusicGenTool',
        durationMs: 690,
        timestamp: '12:00:02',
        outputSummary: 'Composed Lyria soundtrack: Cyberpunk Synthwave @ 128 BPM.'
      },
      {
        id: 'init-6',
        agentId: 'production_engineer',
        agentName: 'Agent 6: Post-Production Packaging Engineer',
        role: 'Media Packager & Subtitle Burner',
        phase: 3,
        status: 'completed',
        toolUsed: 'VideoAudioMuxerTool (FFmpeg Audio Ducking @ 22% Volume)',
        durationMs: 230,
        timestamp: '12:00:03',
        outputSummary: 'Rendered ducked MP4 master with Submagic animated karaoke captions burned-in.'
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
            apiKey={apiKey}
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

    </div>
  );
}
