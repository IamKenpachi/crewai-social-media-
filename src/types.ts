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
  // Peak energy timestamp & climax analysis for high-CTR thumbnail alignment
  peak_energy_timestamp?: string;
  peak_visual_climax?: string;
}

export interface TikTokContent {
  captions: string[];
  hashtags: string[];
  cta: string;
  hook_technique: string;
  viral_score_estimate: number;
  // 2026 TikTok Algorithm & Search SEO Fields
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
  // 2026 YouTube Shorts Algorithm & Search Engine Optimization Fields
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

export interface ThumbnailVariant {
  id: string;
  variant_type: 'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH';
  title: string;
  concept_description: string;
  headline_overlay: string;
  sub_badge: string;
  color_accent: string;
  prompt_used: string;
  thumbnail_url: string;
  ctr_prediction: number;
  focal_point_focus: string;
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
  // Multi-Variant A/B/C Concept Strategy & 5-Pillar Scorecard
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
  execution_metrics: {
    total_latency_ms: number;
    sequential_estimate_ms: number;
    latency_saved_percent: number;
    tokens_consumed: number;
    timestamp: string;
  };
}

export interface AgentLogEntry {
  id: string;
  agentId: 'video_analyst' | 'tiktok_strategist' | 'yt_strategist' | 'art_director' | 'audio_director' | 'production_engineer';
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
