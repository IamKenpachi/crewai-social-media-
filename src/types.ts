export interface SubtitleWord {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  is_highlighted?: boolean;
}

export interface SubtitleLine {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  emoji?: string;
  words: SubtitleWord[];
}

export type SubtitleStylePreset = 'hormozi' | 'mrbeast' | 'neon' | 'minimal';

export interface ViralityBreakdown {
  hook_strength: number; // 0-100 (0-3s retention grip)
  visual_climax: number; // 0-100 (motion & visual peak)
  topic_novelty: number; // 0-100 (curiosity & uniqueness)
  audio_sync: number; // 0-100 (beat alignment & sonic impact)
  loop_continuity: number; // 0-100 (infinite loop seamlessness)
}

export interface ExtractedClip {
  id: string;
  clip_number: number;
  title: string;
  hook_summary: string;
  start_time: string; // e.g. "0:00"
  end_time: string; // e.g. "0:14"
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  virality_score: number; // 0-100
  virality_breakdown: ViralityBreakdown;
  why_viral_reasoning: string;
  retention_tactics: string[];
  subtitles: SubtitleLine[];
  tiktok_metadata?: TikTokContent;
  youtube_metadata?: YouTubeShortsContent;
  thumbnail_metadata?: ThumbnailResult;
}

export interface VideoAnalysisResult {
  summary: string;
  key_hooks: string[];
  mood_and_tone: string;
  suggested_bpm: number;
  visual_motifs: string[];
  color_palette: string[];
  pacing: string;
  target_audience: string;
  detected_topics: string[];
  peak_energy_timestamp?: string;
  peak_visual_climax?: string;
  extracted_clips?: ExtractedClip[];
}

export interface TikTokContent {
  captions: string[];
  hashtags: string[];
  cta: string;
  hook_technique: string;
  viral_score_estimate: number;
  search_optimized_title?: string;
  on_screen_hook_3s?: string;
  spoken_keyword_script?: string;
  niche_category?: string;
  hashtag_breakdown?: {
    trending: string[];
    niche_community: string[];
    content_specific: string[];
  };
  high_converting_ctas?: {
    verbal: string;
    on_screen_sticker: string;
    bio_link_prompt: string;
  };
  algorithm_retention_tactics?: string[];
  best_posting_times_utc?: string[];
}

export interface YouTubeShortsContent {
  title: string;
  description: string;
  tags: string[];
  chapters?: { time: string; title: string }[];
  search_keywords: string[];
  ctr_prediction: number;
  title_character_count?: number;
  frontloaded_hook_sentence?: string;
  description_sections?: {
    hook_and_summary: string;
    key_takeaways: string[];
    pinned_comment_prompt: string;
    related_longform_prompt: string;
    social_links_and_sources: string;
  };
  hashtag_strategy?: {
    primary_tag: string;
    niche_community_tags: string[];
    search_ranking_tags: string[];
  };
  avd_retention_engineering?: {
    loop_transition_technique: string;
    target_avd_percentage: number;
    swipe_away_prevention: string;
  };
  seo_search_ranking_score?: number;
}

export interface SixSlotPrompt {
  subject: string;
  expression_action: string;
  environment_background: string;
  lighting_atmosphere: string;
  style_medium: string;
  technical_parameters: string;
}

export interface ThumbnailVariant {
  id: string;
  variant_type: 'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH';
  title: string;
  concept_description: string;
  headline_overlay: string;
  sub_badge: string;
  color_accent: string;
  prompt_used: string;
  six_slot_breakdown?: SixSlotPrompt;
  thumbnail_url: string;
  ctr_prediction: number;
  focal_point_focus: string;
  psychological_trigger?: string;
}

export interface ThumbnailScorecard {
  overall_grade: string;
  mobile_readability_score: number;
  focal_clarity_score: number;
  contrast_ratio_score: number;
  text_economy_pass: boolean;
  safe_zone_audit_pass: boolean;
  psychological_triggers: string[];
  recommendations: string[];
}

export interface ThumbnailResult {
  prompt_used: string;
  thumbnail_url: string;
  aspect_ratio: '9:16' | '16:9';
  visual_style: string;
  headline_overlay?: string;
  sub_badge?: string;
  color_accent?: string;
  ctr_prediction?: number;
  best_practices_applied?: string[];
  source_frame_url?: string;
  image_model_used?: string;
  variants?: ThumbnailVariant[];
  selected_variant_index?: number;
  peak_energy_timestamp?: string;
  peak_visual_climax?: string;
  scorecard?: ThumbnailScorecard;
}

export interface MusicResult {
  prompt_used: string;
  genre: string;
  bpm: number;
  audio_url: string;
  instruments: string[];
  energy_curve: string;
  duration_seconds: number;
  lyrics?: string;
  lyrics_progression?: SubtitleLine[];
  is_lyria_generated?: boolean;
  frames_analyzed?: number;
}

export interface MediaPackageOutput {
  final_video_path: string;
  final_media_type?: 'image' | 'video';
  raw_media_url?: string;
  poster_frame?: string;
  thumbnail_path: string;
  tiktok_metadata: TikTokContent;
  youtube_metadata: YouTubeShortsContent;
  creative_brief: VideoAnalysisResult;
  music_metadata: MusicResult;
  thumbnail_metadata: ThumbnailResult;
  audio_ducking_level: number;
  ffmpeg_command_executed: string;
  // Multi-clip and Subtitles Support
  clips?: ExtractedClip[];
  selected_clip_id?: string;
  subtitles?: SubtitleLine[];
  subtitle_style?: SubtitleStylePreset;
  execution_metrics: ExecutionMetrics;
}

export interface ExecutionMetrics {
  total_latency_ms: number;
  sequential_estimate_ms: number;
  latency_saved_percent: number;
  tokens_consumed: number;
  timestamp: string;
}

export interface AgentLogEntry {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  phase: 1 | 2 | 3;
  status: 'idle' | 'running' | 'completed' | 'error';
  toolUsed?: string;
  inputPrompt?: string;
  outputSummary?: string;
  durationMs?: number;
  timestamp: string;
  rawOutput?: any;
}

export interface SampleMedia {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  mockBpm: number;
  defaultMood: string;
}

// CrewAI Studio 2026 Interactive DAG Types
export interface CustomAgentConfig {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  task_description: string;
  expected_output: string;
  model: string;
  temperature: number;
  tools: string[];
  phase: 1 | 2 | 3;
  isEnabled: boolean;
  isCustom?: boolean;
  executionType: 'sequential' | 'async_fanout';
}

export interface SavedProject {
  id: string;
  name: string;
  savedAt: string;
  thumbnailUrl: string;
  bundle: MediaPackageOutput;
  model: string;
  viralityScore: number;
}
