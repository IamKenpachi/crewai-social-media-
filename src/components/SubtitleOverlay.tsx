import React from 'react';
import { SubtitleLine, SubtitleWord, SubtitleStylePreset } from '../types';
import { Sparkles, Flame, Zap } from 'lucide-react';

interface SubtitleOverlayProps {
  subtitles: SubtitleLine[];
  currentTimeMs: number;
  stylePreset: SubtitleStylePreset;
  aspectRatio?: '9:16' | '16:9';
  position?: 'top' | 'bottom';
  onUpdateLine?: (lineId: string, newText: string, emoji?: string) => void;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTimeMs,
  stylePreset = 'hormozi',
  aspectRatio = '9:16',
  position = 'bottom',
  onUpdateLine
}) => {
  if (!subtitles || subtitles.length === 0) return null;

  // Find the currently active line based on playback time
  const currentLine = subtitles.find(
    (line) => currentTimeMs >= line.start_ms && currentTimeMs <= line.end_ms
  ) || (subtitles.length > 0 && currentTimeMs < subtitles[0].start_ms ? subtitles[0] : subtitles[subtitles.length - 1]);

  if (!currentLine) return null;

  const isVertical = aspectRatio === '9:16';

  // Subtitle Style Renderers
  const renderStyledContent = () => {
    switch (stylePreset) {
      case 'hormozi':
        return (
          <div className="flex flex-col items-center justify-center text-center px-4 py-2 select-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {currentLine.words.map((word) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                return (
                  <span
                    key={word.id}
                    className={`font-black uppercase tracking-tight transition-all duration-100 ${
                      isVertical ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                    } ${
                      isActive
                        ? 'text-yellow-300 scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,1)] rotate-[-2deg]'
                        : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                    }`}
                    style={{
                      WebkitTextStroke: '2px #000000',
                      textShadow: '0 0 10px rgba(0,0,0,0.8), 3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-3xl animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ml-1">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      case 'mrbeast':
        return (
          <div className="flex flex-col items-center justify-center text-center px-5 py-2 select-none animate-in fade-in duration-100">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
              {currentLine.words.map((word, idx) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                const colorRotation = ['text-cyan-400', 'text-yellow-400', 'text-emerald-400', 'text-rose-400'];
                const wordColor = colorRotation[idx % colorRotation.length];

                return (
                  <span
                    key={word.id}
                    className={`font-black uppercase tracking-wide transition-transform duration-75 ${
                      isVertical ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                    } ${
                      isActive
                        ? `${wordColor} scale-115 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)]`
                        : 'text-white'
                    }`}
                    style={{
                      WebkitTextStroke: '2.5px #000000',
                      textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-3xl sm:text-4xl animate-pulse ml-1.5">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      case 'neon':
        return (
          <div className="flex flex-col items-center justify-center text-center px-6 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono font-extrabold uppercase">
              {currentLine.words.map((word) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                return (
                  <span
                    key={word.id}
                    className={`transition-all duration-100 ${
                      isVertical ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                    } ${
                      isActive
                        ? 'text-pink-400 scale-110 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)]'
                        : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                    }`}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-2xl ml-1 animate-pulse">
                  {currentLine.emoji}
                </span>
              )}
            </div>
          </div>
        );

      case 'minimal':
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-lg select-none">
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 font-sans font-bold">
              {currentLine.words.map((word) => {
                const isActive = currentTimeMs >= word.start_ms && currentTimeMs <= word.end_ms;
                return (
                  <span
                    key={word.id}
                    className={`transition-all duration-100 ${
                      isVertical ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                    } ${
                      isActive
                        ? 'text-amber-400 font-extrabold scale-105'
                        : 'text-white/90'
                    }`}
                  >
                    {word.text}
                  </span>
                );
              })}
              {currentLine.emoji && (
                <span className="text-xl ml-1">
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
      className={`absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center ${
        position === 'top' 
          ? (isVertical ? 'top-14' : 'top-10')
          : (isVertical ? 'bottom-20' : 'bottom-12')
      }`}
    >
      <div className="max-w-[90%]">
        {renderStyledContent()}
      </div>
    </div>
  );
};
