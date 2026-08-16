import { ExtractedClip, SubtitleLine, ExecutionMetrics, VideoAnalysisResult } from '../types';

export const DEFAULT_EXECUTION_METRICS: ExecutionMetrics = {
  total_latency_ms: 2420,
  sequential_estimate_ms: 8650,
  latency_saved_percent: 72,
  tokens_consumed: 1740,
  timestamp: '2026-08-16T12:00:00.000Z',
};

export const DEFAULT_SONG_LYRICS: SubtitleLine[] = [
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

export const DEFAULT_CLIPS: ExtractedClip[] = [
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
    subtitles: [
      {
        id: 'sub-2-1',
        text: 'Watch what happens on the beat drop',
        start_ms: 200,
        end_ms: 3200,
        emoji: '🔥',
        words: [
          { id: 'w2-1', text: 'Watch', start_ms: 200, end_ms: 700 },
          { id: 'w2-2', text: 'what', start_ms: 700, end_ms: 1200 },
          { id: 'w2-3', text: 'happens', start_ms: 1200, end_ms: 1800 },
          { id: 'w2-4', text: 'on', start_ms: 1800, end_ms: 2200 },
          { id: 'w2-5', text: 'the', start_ms: 2200, end_ms: 2600 },
          { id: 'w2-6', text: 'beat', start_ms: 2600, end_ms: 2900 },
          { id: 'w2-7', text: 'drop', start_ms: 2900, end_ms: 3200 }
        ]
      },
      {
        id: 'sub-2-2',
        text: 'Absolute perfection in motion',
        start_ms: 3300,
        end_ms: 7500,
        emoji: '⚡',
        words: [
          { id: 'w2-8', text: 'Absolute', start_ms: 3300, end_ms: 4200 },
          { id: 'w2-9', text: 'perfection', start_ms: 4200, end_ms: 5400 },
          { id: 'w2-10', text: 'in', start_ms: 5400, end_ms: 6200 },
          { id: 'w2-11', text: 'motion', start_ms: 6200, end_ms: 7500 }
        ]
      },
      {
        id: 'sub-2-3',
        text: 'Drop a comment if you saw that! 👇',
        start_ms: 7600,
        end_ms: 12500,
        emoji: '💬',
        words: [
          { id: 'w2-12', text: 'Drop', start_ms: 7600, end_ms: 8400 },
          { id: 'w2-13', text: 'a', start_ms: 8400, end_ms: 9000 },
          { id: 'w2-14', text: 'comment', start_ms: 9000, end_ms: 10200 },
          { id: 'w2-15', text: 'if', start_ms: 10200, end_ms: 10800 },
          { id: 'w2-16', text: 'you', start_ms: 10800, end_ms: 11400 },
          { id: 'w2-17', text: 'saw', start_ms: 11400, end_ms: 11900 },
          { id: 'w2-18', text: 'that!', start_ms: 11900, end_ms: 12500 }
        ]
      }
    ]
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
    subtitles: [
      {
        id: 'sub-3-1',
        text: 'And that is the exact reason why...',
        start_ms: 200,
        end_ms: 3800,
        emoji: '💡',
        words: [
          { id: 'w3-1', text: 'And', start_ms: 200, end_ms: 800 },
          { id: 'w3-2', text: 'that', start_ms: 800, end_ms: 1400 },
          { id: 'w3-3', text: 'is', start_ms: 1400, end_ms: 1900 },
          { id: 'w3-4', text: 'the', start_ms: 1900, end_ms: 2400 },
          { id: 'w3-5', text: 'exact', start_ms: 2400, end_ms: 3000 },
          { id: 'w3-6', text: 'reason', start_ms: 3000, end_ms: 3500 },
          { id: 'w3-7', text: 'why...', start_ms: 3500, end_ms: 3800 }
        ]
      },
      {
        id: 'sub-3-2',
        text: 'You should never ignore this step!',
        start_ms: 3900,
        end_ms: 8500,
        emoji: '⚠️',
        words: [
          { id: 'w3-8', text: 'You', start_ms: 3900, end_ms: 4600 },
          { id: 'w3-9', text: 'should', start_ms: 4600, end_ms: 5400 },
          { id: 'w3-10', text: 'never', start_ms: 5400, end_ms: 6200 },
          { id: 'w3-11', text: 'ignore', start_ms: 6200, end_ms: 7200 },
          { id: 'w3-12', text: 'this', start_ms: 7200, end_ms: 7800 },
          { id: 'w3-13', text: 'step!', start_ms: 7800, end_ms: 8500 }
        ]
      },
      {
        id: 'sub-3-3',
        text: 'Follow for the next part tomorrow! 🚀',
        start_ms: 8600,
        end_ms: 12000,
        emoji: '🚀',
        words: [
          { id: 'w3-14', text: 'Follow', start_ms: 8600, end_ms: 9400 },
          { id: 'w3-15', text: 'for', start_ms: 9400, end_ms: 9900 },
          { id: 'w3-16', text: 'the', start_ms: 9900, end_ms: 10400 },
          { id: 'w3-17', text: 'next', start_ms: 10400, end_ms: 10900 },
          { id: 'w3-18', text: 'part!', start_ms: 10900, end_ms: 12000 }
        ]
      }
    ]
  }
];

export const DEFAULT_CREATIVE_BRIEF: VideoAnalysisResult = {
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
  peak_visual_climax: 'High-speed drone dive into neon holographic canyon',
  extracted_clips: DEFAULT_CLIPS
};
