import { MediaPackageOutput, AgentLogEntry } from '../types';
import { DEFAULT_CLIPS, DEFAULT_CREATIVE_BRIEF, DEFAULT_EXECUTION_METRICS } from './demoContent';

export const INITIAL_DEMO_BUNDLE: MediaPackageOutput = {
  final_video_path: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-at-night-41584-large.mp4',
  thumbnail_path: './exports/youtube_thumbnail.png',
  creative_brief: DEFAULT_CREATIVE_BRIEF,
  clips: DEFAULT_CLIPS,
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
  execution_metrics: DEFAULT_EXECUTION_METRICS
};

export const INITIAL_DEMO_LOGS: AgentLogEntry[] = [
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
];
