import React from 'react';
import { SubtitleLine, SubtitleWord, SubtitleStylePreset } from '../types';
import { Sparkles, Flame, Zap, Music2 } from 'lucide-react';

interface SubtitleOverlayProps {
  subtitles: SubtitleLine[];
  currentTimeMs: number;
  stylePreset: SubtitleStylePreset;
  aspectRatio?: '9:16' | '16:9';
  position?: 'top' | 'bottom' | 'center';
  onUpdateLine?: (lineId: string, newText: string, emoji?: string) => void;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTimeMs,
  stylePreset = 'hormozi',
  aspectRatio = '9:16',
  position = 'top',
  onUpdateLine
}) => {
  if (!subtitles || subtitles.length === 0) return null;

  // Find the currently active line based on playback time
  const currentLine = subtitles.find(
    (line) => currentTimeMs >= line.start_ms && currentTimeMs <= line.end_ms
  ) || (subtitles.length > 0 && currentTimeMs < subtitles[0].start_ms ? subtitles[0] : subtitles[subtitles.length - 1]);

  if (!currentLine) return null;

  const isVertical = aspectRatio === '9:16';

  // Playful Styles
  const renderStyledContent = () => {
    switch (stylePreset) {
      // 1. BOUNCY COMIC STICKER POP (Top AI Video Trend)
      case 'hormozi':
        return (
          <div className="flex flex-col items-center justify-center text-center px-4 py-2 select-none animate-in fade-in zoom-in-95 duration-100">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentLine.words.map((word, idx) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                const isPast = currentTimeMs > word.end_ms;
                const tilt = idx % 2 === 0 ? '-rotate-3' : 'rotate-3';

                return (
                  <div
                    key={word.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-2xl transition-all duration-150 transform ${tilt} ${
                      isActive
                        ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-black scale-120 shadow-[0_6px_0_#000000] border-3 border-black z-20 animate-bounce'
                        : isPast
                          ? 'bg-white text-slate-950 scale-100 border-2 border-black/80 shadow-[0_3px_0_#000000] opacity-90'
                          : 'bg-black/60 text-white/80 scale-95 border border-white/20'
                    }`}
                  >
                    <span className="font-black text-xl sm:text-2xl uppercase tracking-wider font-sans drop-shadow-xs">
                      {word.text}
                    </span>
                  </div>
                );
              })}
              {currentLine.emoji && (
                <span className="text-3xl animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] ml-1">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      // 2. KINETIC BEAT-SLAM (High-Energy Impact Pop)
      case 'mrbeast':
        return (
          <div className="flex flex-col items-center justify-center text-center px-5 py-2 select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {currentLine.words.map((word, idx) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                const colors = ['#38BDF8', '#FACC15', '#4ADE80', '#FB7185', '#C084FC'];
                const activeColor = colors[idx % colors.length];

                return (
                  <span
                    key={word.id}
                    className={`font-black uppercase tracking-tight transition-all duration-75 inline-block ${
                      isVertical ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
                    } ${
                      isActive
                        ? 'scale-125 z-20 rotate-[-2deg]'
                        : 'text-white/80 scale-95'
                    }`}
                    style={{
                      color: isActive ? activeColor : '#FFFFFF',
                      WebkitTextStroke: '2.5px #000000',
                      textShadow: isActive 
                        ? `0 0 20px ${activeColor}, 4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000`
                        : '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-4xl animate-pulse ml-2">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      // 3. NEON ARCADE CYBER POP
      case 'neon':
        return (
          <div className="flex flex-col items-center justify-center text-center px-6 py-2.5 rounded-3xl bg-black/70 backdrop-blur-md border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)] select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono font-black uppercase">
              {currentLine.words.map((word) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                return (
                  <span
                    key={word.id}
                    className={`transition-all duration-100 ${
                      isVertical ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                    } ${
                      isActive
                        ? 'text-pink-400 scale-120 drop-shadow-[0_0_15px_rgba(236,72,153,1)] rotate-[-2deg]'
                        : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] opacity-80'
                    }`}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-2xl ml-1 animate-bounce">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      // 4. FLOATING KARAOKE CLOUD PILL
      case 'minimal':
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center px-5 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/30 shadow-2xl select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans font-black">
              {currentLine.words.map((word) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                return (
                  <span
                    key={word.id}
                    className={`transition-all duration-100 ${
                      isVertical ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                    } ${
                      isActive
                        ? 'text-yellow-300 font-black scale-115 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]'
                        : 'text-white/75'
                    }`}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-2xl ml-1.5 animate-bounce">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center transition-all duration-200 ${
        position === 'top' 
          ? (isVertical ? 'top-6' : 'top-5')
          : position === 'center'
            ? 'top-1/2 -translate-y-1/2'
            : (isVertical ? 'bottom-20' : 'bottom-12')
      }`}
    >
      <div className="max-w-[92%]">
        {renderStyledContent()}
      </div>
    </div>
  );
};
