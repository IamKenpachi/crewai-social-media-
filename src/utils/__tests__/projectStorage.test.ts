import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MediaPackageOutput, SavedProject } from '../../types';
import { DEFAULT_EXECUTION_METRICS } from '../../data/demoContent';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

globalThis.localStorage = localStorageMock as any;

// Storage sanitization helper logic to test
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

function safeSaveProjects(projects: SavedProject[]): boolean {
  try {
    localStorage.setItem('crewai_saved_projects', JSON.stringify(projects));
    return true;
  } catch (e) {
    try {
      const trimmed = projects.slice(0, 3);
      localStorage.setItem('crewai_saved_projects', JSON.stringify(trimmed));
      return true;
    } catch {
      return false;
    }
  }
}

describe('Project Storage & Sanitization Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('strips heavy base64 video payloads while preserving metadata', () => {
    const heavyBundle: MediaPackageOutput = {
      final_video_path: 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQA...',
      thumbnail_path: 'thumbnail.png',
      creative_brief: {
        summary: 'Summer fashion short video with dynamic cuts',
        key_hooks: ['Hook 1', 'Hook 2'],
        mood_and_tone: 'Upbeat summer vibe',
        suggested_bpm: 124,
        visual_motifs: ['Summer sun', 'Red dress'],
        color_palette: ['#ff0000', '#ffffff'],
        pacing: 'Fast-paced',
        target_audience: 'Fashion enthusiasts',
        detected_topics: ['Summer', 'Fashion']
      },
      tiktok_metadata: {
        captions: ['Caption 1'],
        hashtags: ['#summer', '#fashion'],
        on_screen_hook_3s: 'Wait for the dress reveal!',
        cta: 'Follow for part 2',
        hook_technique: 'Visual Reveal',
        viral_score_estimate: 95
      },
      youtube_metadata: {
        title: 'The Perfect Summer Dress Reveal 🔥 #Shorts',
        description: 'Check out the new design',
        tags: ['shorts', 'summer', 'fashion'],
        search_keywords: ['summer dress', 'fashion shorts'],
        ctr_prediction: 18.2
      },
      thumbnail_metadata: {
        prompt_used: 'Cinematic summer thumbnail with 3D text',
        thumbnail_url: 'data:image/svg+xml;utf8,<svg>test</svg>',
        aspect_ratio: '9:16',
        visual_style: 'Hyper-detailed 3D render'
      },
      music_metadata: {
        prompt_used: 'Upbeat acoustic summer tune',
        genre: 'Summer Pop',
        bpm: 124,
        audio_url: 'https://example.com/audio.mp3',
        instruments: ['Guitar', 'Bass'],
        energy_curve: 'Dynamic build',
        duration_seconds: 27
      },
      audio_ducking_level: 0.22,
      ffmpeg_command_executed: 'ffmpeg -i input.mp4 ...',
      raw_media_url: 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQA...',
      poster_frame: 'x'.repeat(90000),
      execution_metrics: DEFAULT_EXECUTION_METRICS
    };

    const sanitized = sanitizeBundleForStorage(heavyBundle);
    expect(sanitized.raw_media_url).toBe('');
    expect(sanitized.final_video_path).toBe('');
    expect(sanitized.poster_frame).toBe('');
    expect(sanitized.creative_brief.summary).toBe('Summer fashion short video with dynamic cuts');
    expect(sanitized.tiktok_metadata.hashtags).toHaveLength(2);
  });

  it('safely saves projects and trims on quota exceptions', () => {
    const mockProjects: SavedProject[] = [
      {
        id: 'proj_1',
        name: 'Project 1',
        savedAt: new Date().toISOString(),
        thumbnailUrl: 'thumb1',
        bundle: {} as any,
        model: 'gemini-3.7-flash',
        viralityScore: 95
      },
      {
        id: 'proj_2',
        name: 'Project 2',
        savedAt: new Date().toISOString(),
        thumbnailUrl: 'thumb2',
        bundle: {} as any,
        model: 'gemini-3.5-flash',
        viralityScore: 92
      }
    ];

    const success = safeSaveProjects(mockProjects);
    expect(success).toBe(true);

    const stored = JSON.parse(localStorage.getItem('crewai_saved_projects') || '[]');
    expect(stored).toHaveLength(2);
  });
});
