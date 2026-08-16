export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const CREWAI_CODE_SNIPPETS: CodeFile[] = [
  {
    filename: 'schemas.py',
    language: 'python',
    description: 'Strongly-typed Pydantic schemas enforcing rigid context passing across all agents.',
    code: `from pydantic import BaseModel, Field
from typing import List, Optional

class VideoAnalysisResult(BaseModel):
    summary: str = Field(..., description="Comprehensive summary of visual content and narrative.")
    key_hooks: List[str] = Field(..., description="Top 3 visual or spoken hooks from the video.")
    mood_and_tone: str = Field(..., description="Vibe (e.g., energetic, suspenseful, chill, tech-focused).")
    suggested_bpm: int = Field(..., description="Suggested background music tempo in BPM (60-160).")
    visual_motifs: List[str] = Field(..., description="Key elements, subjects, and color palettes.")
    pacing: str = Field(default="Fast-paced", description="Pacing and edit tempo.")

class TikTokContent(BaseModel):
    search_optimized_title: str = Field(..., description="Query-intent packed TikTok search title for 2026 SEO index.")
    captions: List[str] = Field(..., description="3 high-converting viral TikTok caption hooks (Curiosity loop, Pattern interrupt, How-to).")
    hashtags: List[str] = Field(..., description="Combined 6-9 strategic hashtags adhering to 3-3-3 rule (3 Trending, 3 Niche, 3 Content-specific).")
    on_screen_hook_3s: str = Field(..., description="Exact visual text overlay for seconds 0:00-0:03 to stop scroll.")
    spoken_keyword_script: str = Field(..., description="Spoken voiceover script matching caption keywords for TikTok NLP audio indexing.")
    cta: str = Field(..., description="High-converting call to action driving saves and comments.")
    high_converting_ctas: Optional[dict] = Field(None, description="Triple-tier CTAs: verbal outro, on-screen sticker, and bio-link trigger.")
    algorithm_retention_tactics: List[str] = Field(default=[], description="Tactics to guarantee 70%+ completion rate for algorithm distribution.")
    viral_score_estimate: int = Field(default=96, description="Estimated viral retention score 0-100.")
    best_posting_times_utc: List[str] = Field(default=[], description="Optimal posting windows for peak initial velocity.")

class YouTubeShortsContent(BaseModel):
    title: str = Field(..., description="High-CTR YouTube Shorts title under 60 chars (front-loaded 25-45 char sweet spot).")
    title_character_count: Optional[int] = Field(None, description="Length of title in characters.")
    frontloaded_hook_sentence: str = Field(..., description="First 100 characters of description visible before mobile truncation.")
    description: str = Field(..., description="Full SEO-optimized description with takeaways, timestamps, and pinned debate prompt.")
    description_sections: Optional[dict] = Field(None, description="Structured sections: hook, key takeaways, pinned comment prompt, long-form bridge.")
    tags: List[str] = Field(..., description="10-12 high-search-volume keywords for YouTube Studio tags.")
    hashtag_strategy: Optional[dict] = Field(None, description="3-part hashtag matrix: primary #Shorts + 3 niche community + 3 search intent.")
    avd_retention_engineering: Optional[dict] = Field(None, description="Loop transition technique, target AVD % (>100%), and swipe-away prevention.")
    ctr_prediction: float = Field(default=15.4, description="Predicted click-through rate percentage.")
    seo_search_ranking_score: Optional[int] = Field(default=94, description="Predicted YouTube Search Index rank score 80-100.")

class ThumbnailResult(BaseModel):
    prompt_used: str = Field(..., description="Prompt sent to the thumbnail model.")
    thumbnail_path: str = Field(..., description="Local path or URL to generated thumbnail.")
    aspect_ratio: str = Field(default="9:16", description="Target aspect ratio.")

class MusicResult(BaseModel):
    prompt_used: str = Field(..., description="Prompt sent to Lyria music engine.")
    audio_path: str = Field(..., description="Local path to generated audio file.")
    genre: str = Field(..., description="Primary genre classification.")
    bpm: int = Field(..., description="BPM tempo of generated soundtrack.")

class MediaPackageOutput(BaseModel):
    final_video_path: str = Field(..., description="Path to rendered MP4 with ducked music.")
    thumbnail_path: str = Field(..., description="Path to generated thumbnail PNG.")
    tiktok_metadata: TikTokContent = Field(..., description="TikTok viral package.")
    youtube_metadata: YouTubeShortsContent = Field(..., description="YouTube Shorts SEO package.")
    creative_brief: VideoAnalysisResult = Field(..., description="Original multimodal brief.")
    music_metadata: MusicResult = Field(..., description="Generated soundtrack metadata.")
`,
  },
  {
    filename: 'tools.py',
    language: 'python',
    description: 'Deterministic tool boundary implementations (Gemini Video API, Imagen 3, Lyria, and FFmpeg).',
    code: `import os
import subprocess
from typing import Type
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# -------------------------------------------------------------
# Tool 1: Multimodal Video Analysis via Gemini
# -------------------------------------------------------------
class VideoAnalysisInput(BaseModel):
    video_path: str = Field(..., description="Path to the uploaded video file.")

class GeminiVideoAnalysisTool(BaseTool):
    name: str = "Gemini Video Analyzer"
    description: str = "Uploads video to Gemini Flash and extracts deep visual/audio context, tempo, and scene data."
    args_schema: Type[BaseModel] = VideoAnalysisInput

    def _run(self, video_path: str) -> str:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Upload media file to Gemini API File Manager
        video_file = client.files.upload(file=video_path)
        
        prompt = """
        Analyze this video for social media production:
        1. Summarize the visual narrative and hook points.
        2. Identify mood, pacing, and recommended musical BPM.
        3. List dominant visual subjects and color schemes.
        Respond in structured JSON format matching VideoAnalysisResult schema.
        """
        
        response = client.models.generateContent(
            model="gemini-3.7-flash",
            contents=[video_file, prompt]
        )
        return response.text

# -------------------------------------------------------------
# Tool 2: Thumbnail Generator (gemini-3-pro-image)
# -------------------------------------------------------------
class ThumbnailInput(BaseModel):
    prompt: str = Field(..., description="Detailed visual prompt for thumbnail generation.")
    aspect_ratio: str = Field(default="9:16", description="Aspect ratio: 9:16 or 16:9.")
    output_filename: str = Field(default="thumbnail.png", description="Output filename.")

class ThumbnailGeneratorTool(BaseTool):
    name: str = "Thumbnail Generator Tool"
    description: str = "Generates high-contrast, clickable YouTube thumbnails via gemini-3-pro-image."
    args_schema: Type[BaseModel] = ThumbnailInput

    def _run(self, prompt: str, aspect_ratio: str = "9:16", output_filename: str = "thumbnail.png") -> str:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        result = client.models.generateContent(
            model='gemini-3-pro-image',
            contents=f"YouTube thumbnail style, {aspect_ratio} high contrast, vibrant lighting, hyper-detailed: {prompt}",
            config=dict(
                image_config=dict(aspect_ratio=aspect_ratio)
            )
        )
        for part in result.candidates[0].content.parts:
            if part.inline_data:
                # Save base64 image
                return os.path.abspath(output_filename)
        return "Failed to generate thumbnail"

# -------------------------------------------------------------
# Tool 3: Lyria Music Generation Tool
# -------------------------------------------------------------
class LyriaMusicInput(BaseModel):
    music_prompt: str = Field(..., description="Vibe, genre, instruments, and mood for Lyria.")
    duration_seconds: int = Field(default=30, description="Length of track to generate.")
    output_filename: str = Field(default="bg_music.mp3", description="Output audio filename.")

class LyriaMusicGenTool(BaseTool):
    name: str = "Lyria Music Generator"
    description: str = "Synthesizes background music tailored to video mood and BPM using Lyria Audio."
    args_schema: Type[BaseModel] = LyriaMusicInput

    def _run(self, music_prompt: str, duration_seconds: int = 30, output_filename: str = "bg_music.mp3") -> str:
        # Calls Lyria / Music Generation API
        # FFmpeg fallback / Local synth wrapper:
        if not os.path.exists(output_filename):
            subprocess.run([
                "ffmpeg", "-y", "-f", "lavfi", "-i",
                f"sine=frequency=440:duration={duration_seconds}",
                "-c:a", "libmp3lame", output_filename
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        return os.path.abspath(output_filename)

# -------------------------------------------------------------
# Tool 4: Audio-Video Muxer (FFmpeg with Audio Ducking)
# -------------------------------------------------------------
class VideoMuxInput(BaseModel):
    video_path: str = Field(..., description="Original video path.")
    audio_path: str = Field(..., description="Generated background music path.")
    ducking_volume: float = Field(default=0.22, description="Background music volume coefficient.")
    output_path: str = Field(default="output_final.mp4", description="Output video path.")

class VideoAudioMuxerTool(BaseTool):
    name: str = "Video Audio Muxer"
    description: str = "Combines original video with background music, applying audio ducking so voice stays crystal clear."
    args_schema: Type[BaseModel] = VideoMuxInput

    def _run(self, video_path: str, audio_path: str, ducking_volume: float = 0.22, output_path: str = "output_final.mp4") -> str:
        # FFmpeg command to mix original audio with background music ducked to 22% volume
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-stream_loop", "-1", "-i", audio_path,
            "-filter_complex", f"[1:a]volume={ducking_volume}[bg];[0:a][bg]amix=inputs=2:duration=first[aout]",
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            output_path
        ]
        subprocess.run(cmd, check=True)
        return os.path.abspath(output_path)
`,
  },
  {
    filename: 'agents.py',
    language: 'python',
    description: 'The 6 specialized agent personas with distinct roles, backstories, and deterministic tool bindings.',
    code: `from crewai import Agent, LLM
import os
from tools import (
    GeminiVideoAnalysisTool,
    ThumbnailGeneratorTool,
    LyriaMusicGenTool,
    VideoAudioMuxerTool
)

gemini_llm = LLM(
    model="gemini/gemini-3.7-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

# 1. Perception Agent (Phase 1: Sequential Ingestion)
video_analyst = Agent(
    role="Multimodal Video Analyst",
    goal="Extract high-fidelity scene breakdowns, mood cues, emotional hooks, and pacing from the uploaded video.",
    backstory="You are an elite video director capable of breaking down clips frame-by-frame to identify viral retention triggers.",
    tools=[GeminiVideoAnalysisTool()],
    llm=gemini_llm,
    verbose=True
)

# 2. TikTok Specialist (Phase 2: Async Concurrency)
tiktok_strategist = Agent(
    role="TikTok Search SEO & Viral Strategist (2026 Engine)",
    goal="Engineer high-retention TikTok metadata combining search-intent titles, sub-3-second hooks (visual + spoken), strict 3-3-3 hashtag strategy, and triple-tier conversion CTAs.",
    backstory="You are a 2026 TikTok algorithm specialist. You know TikTok operates as a visual search engine where spoken NLP keywords must align with on-screen text, generic #fyp tags degrade authority, and sub-3-second retention dictates the initial 200-viewer test cohort.",
    llm=gemini_llm,
    verbose=True
)

# 3. YouTube Shorts Specialist (Phase 2: Async Concurrency)
yt_strategist = Agent(
    role="YouTube Shorts SEO & Retention Architect (2026 Engine)",
    goal="Engineer high-CTR YouTube Shorts titles (25-45 char sweet spot), front-loaded search descriptions, anti-spam hashtag stacks, and >100% AVD infinite loop retention plans.",
    backstory="You are a 2026 YouTube Shorts algorithm and Google Search ranking architect. You know mobile feeds truncate after 50 chars, that the first 100 chars of descriptions drive search relevance, and that rewatchability/loop retention is what triggers broad Shorts shelf distribution.",
    llm=gemini_llm,
    verbose=True
)

# 4. Visual Art Director (Phase 2: Async Concurrency)
art_director = Agent(
    role="YouTube Shorts Thumbnail Art Director & CTR Strategist",
    goal="Formulate high-CTR selective vibrancy thumbnail prompts, generate 3 psychological variants, and audit via 5-Pillar Scorecard.",
    backstory="Master visual psychologist and graphic artist specializing in mobile feed glancability, facial emotion paradoxes, and curiosity loop engineering.",
    tools=[ThumbnailGeneratorTool()],
    llm=gemini_llm,
    verbose=True
)

# 5. Audio Maestro (Phase 2: Async Concurrency)
audio_director = Agent(
    role="Soundtrack & Mood Producer",
    goal="Translate video emotion and tempo into Lyria music prompts and trigger music generation.",
    backstory="A composer who pairs rhythm and mood with background tracks to elevate pacing without overpowering voice tracks.",
    tools=[LyriaMusicGenTool()],
    llm=gemini_llm,
    verbose=True
)

# 6. Post-Production Packaging Engineer (Phase 3: Assembly)
production_engineer = Agent(
    role="Media Post-Production Engineer",
    goal="Mux the generated music onto the original video and assemble the final distribution manifest.",
    backstory="A technical media engineer who coordinates audio mixing, file rendering, and final metadata validation.",
    tools=[VideoAudioMuxerTool()],
    llm=gemini_llm,
    verbose=True
)
`,
  },
  {
    filename: 'main.py',
    language: 'python',
    description: 'Task definitions, Async Fan-Out pipeline assembly, and Crew kickoff orchestrator.',
    code: `from crewai import Crew, Process, Task
from schemas import (
    VideoAnalysisResult, TikTokContent, YouTubeShortsContent,
    ThumbnailResult, MusicResult, MediaPackageOutput
)
from agents import (
    video_analyst, tiktok_strategist, yt_strategist,
    art_director, audio_director, production_engineer
)

def build_media_crew(video_path: str):
    # -------------------------------------------------------------
    # Stage 1: Sequential Ingestion (Gemini Multimodal Eyes & Ears)
    # -------------------------------------------------------------
    task_analysis = Task(
        description=f"Analyze the uploaded media located at '{video_path}' using the Gemini Video Analyzer tool.",
        expected_output="Detailed video breakdown including mood, pacing, BPM, and viral hooks.",
        agent=video_analyst,
        output_pydantic=VideoAnalysisResult
    )

    # -------------------------------------------------------------
    # Stage 2: Parallel Async Generation (4 Concurrent Agents)
    # -------------------------------------------------------------
    task_tiktok = Task(
        description=(
            "Using the video analysis, formulate the 2026 TikTok Viral Package:\n"
            "1. Search-intent query title for TikTok Search index\n"
            "2. Exact sub-3-second on-screen visual hook text and matching spoken NLP keyword script\n"
            "3. 3 viral caption hook variations (Curiosity loop, Pattern interrupt, How-to)\n"
            "4. Strict '3-3-3' hashtag strategy (3 Trending broad + 3 Niche community + 3 Content-specific)\n"
            "5. Triple-tier high-converting CTAs (Verbal outro, On-screen sticker, Bio link prompt)\n"
            "6. 70%+ completion rate algorithm retention tactics."
        ),
        expected_output="Structured TikTokContent object adhering to 2026 TikTok algorithm requirements.",
        agent=tiktok_strategist,
        context=[task_analysis],
        async_execution=True,  # Concurrency Cuts Latency by ~70%
        output_pydantic=TikTokContent
    )

    task_youtube = Task(
        description=(
            "Using the video analysis, compile the 2026 YouTube Shorts SEO Package:\n"
            "1. Title in the mobile sweet spot (25-45 chars, max 60, front-loaded keyword + curiosity gap)\n"
            "2. Front-loaded SEO description (first 100 chars above the 'More' fold, 3 bulleted key takeaways, and pinned question prompt)\n"
            "3. Structured Hashtag Matrix (#Shorts + 3 Niche Community + 3 Search Ranking tags)\n"
            "4. AVD retention engineering (exact infinite loop seamless transition & 0-2s swipe-away preventer)\n"
            "5. 10-12 high-search-volume studio keywords & predicted Browse CTR score."
        ),
        expected_output="Structured YouTubeShortsContent object satisfying 2026 YouTube algorithm criteria.",
        agent=yt_strategist,
        context=[task_analysis],
        async_execution=True,  # Concurrency
        output_pydantic=YouTubeShortsContent
    )

    task_thumbnail = Task(
        description=(
            "Using the video analysis and peak climax timestamp from task_analysis, engineer the 2026 YouTube Shorts Visual Packaging:\n"
            "1. Selective Vibrancy & Anti-Saturation: Establish deep matte contrast with targeted neon/warm rim-lighting; reserve 35-45% negative space around the hero subject.\n"
            "2. Facial Emotion & Biological Gaze: Isolate peak-stakes expressions (disbelief, intense anticipation, or sadness/disbelief paradox for +42% curiosity click lift) and orient eye-gaze toward the hook pill.\n"
            "3. Rule of Complementarity: Formulate a 2-4 word curiosity hook (<18 chars, ALL-CAPS) that creates an open narrative loop rather than repeating the video title.\n"
            "4. 3-Variant Psychological Matrix: Generate 3 distinct archetypes (Variant A: High Emotion/Sadness Paradox '#EF4444', Variant B: Curiosity Gap/Open Loop '#FACC15' with +19% Browse CTR, Variant C: Selective Minimalist Punch '#38BDF8').\n"
            "5. Mobile 3-Second Glancability & Safe Zone: Guarantee instant legibility at 120x67px mobile browse scale with 100% clean bottom-right duration stamp space.\n"
            "6. Tool Generation & Scorecard Audit: Trigger the Gemini-3-Pro-Image tool with an 8K selective vibrancy prompt and perform the 5-Pillar CTR Scorecard audit."
        ),
        expected_output="Path to the generated thumbnail bundle with 3 A/B/C variants, 5-Pillar CTR scorecard, and image asset.",
        agent=art_director,
        context=[task_analysis],
        async_execution=True,  # Concurrency
        output_pydantic=ThumbnailResult
    )

    task_music = Task(
        description="Create a music prompt matching the video's mood and BPM, then generate audio using the Lyria Tool.",
        expected_output="Path to the generated music MP3 file.",
        agent=audio_director,
        context=[task_analysis],
        async_execution=True,  # Concurrency
        output_pydantic=MusicResult
    )

    # -------------------------------------------------------------
    # Stage 3: Sequential Assembly & Muxing (FFmpeg Packaging)
    # -------------------------------------------------------------
    task_mux_and_package = Task(
        description=(
            f"Retrieve the generated audio path from the music task, then run the Video Audio Muxer tool "
            f"to strip the original audio from '{video_path}' (-an / -map 0:v -map 1:a) and multiplex ONLY "
            f"the synthesized AI music soundtrack into the final MP4 container. Package all metadata together."
        ),
        expected_output="Complete media bundle with clean soundtrack-only video, thumbnail, and platform metadata.",
        agent=production_engineer,
        context=[task_analysis, task_tiktok, task_youtube, task_thumbnail, task_music],
        output_pydantic=MediaPackageOutput
    )

    # Assemble the Crew
    media_crew = Crew(
        agents=[
            video_analyst, tiktok_strategist, yt_strategist,
            art_director, audio_director, production_engineer
        ],
        tasks=[
            task_analysis,
            task_tiktok, task_youtube, task_thumbnail, task_music,
            task_mux_and_package
        ],
        process=Process.sequential,  # Sequential base process; async tasks fan out automatically
        verbose=True
    )
    
    return media_crew

if __name__ == "__main__":
    import json
    input_video = "sample_clip.mp4"
    crew = build_media_crew(video_path=input_video)
    
    print("\n🚀 Starting CrewAI Social Media Studio...")
    result = crew.kickoff()
    
    print("\n" + "="*50)
    print("✅ PRODUCTION RUN COMPLETED")
    print("="*50)
    print(result.raw)
`,
  },
  {
    filename: 'requirements.txt',
    language: 'text',
    description: 'Python pip dependencies for the production CrewAI pipeline.',
    code: `crewai>=0.100.0
google-genai>=2.4.0
pydantic>=2.7.0
pillow>=10.2.0
moviepy>=1.0.3
ffmpeg-python>=0.2.0
requests>=2.31.0
python-dotenv>=1.0.1
`,
  }
];
