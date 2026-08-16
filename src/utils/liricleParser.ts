import { SubtitleLine, SubtitleWord } from '../types';

/**
 * Liricle / Enhanced LRC Parser for Lyria AI lyrics output
 * Supports:
 * - Lyria range format: [0.0:2.6] Sunlight on the kitchen floor
 * - Standard LRC format: [00:02.60] Sunlight on the kitchen floor
 * - Plain text lines with automatic tempo/duration distribution
 */
export function parseLyriaLyricsToSubtitles(
  rawLyricsText: string,
  totalDurationSeconds: number = 27
): SubtitleLine[] {
  if (!rawLyricsText || typeof rawLyricsText !== 'string' || !rawLyricsText.trim()) {
    return [];
  }

  const lines = rawLyricsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const emojiPool = ['☀️', '✨', '👗', '💫', '🎶', '🌸', '💃', '🌴', '🌟', '💖', '🎵', '🔥'];
  const parsedSubtitles: SubtitleLine[] = [];

  // Check if lines have [start:end] or [mm:ss.xx] timestamps
  const hasRangeTimestamp = lines.some((l) => /^\[\d+(\.\d+)?:/.test(l));
  const hasStandardLrc = lines.some((l) => /^\[\d{1,2}:\d{2}/.test(l));

  if (hasRangeTimestamp) {
    // Format: [0.0:2.6] Sunlight on the kitchen floor
    lines.forEach((line, idx) => {
      const match = line.match(/^\[(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\]\s*(.*)$/);
      if (match) {
        const startSec = parseFloat(match[1]);
        const endSec = parseFloat(match[2]);
        const text = match[3].trim();
        if (text) {
          const startMs = Math.round(startSec * 1000);
          const endMs = Math.round(endSec * 1000);
          const duration = Math.max(800, endMs - startMs);

          const wordsList = text.split(/\s+/).filter(Boolean);
          const wordDuration = duration / Math.max(1, wordsList.length);

          const words: SubtitleWord[] = wordsList.map((w, wIdx) => ({
            id: `w-${idx}-${wIdx}`,
            text: w,
            start_ms: Math.round(startMs + wIdx * wordDuration),
            end_ms: Math.round(startMs + (wIdx + 1) * wordDuration)
          }));

          parsedSubtitles.push({
            id: `lyric-line-${idx + 1}`,
            text: text,
            start_ms: startMs,
            end_ms: endMs,
            emoji: emojiPool[idx % emojiPool.length],
            words: words
          });
        }
      }
    });
  } else if (hasStandardLrc) {
    // Format: [00:02.60] Sunlight on the kitchen floor
    const tempLrc: { startMs: number; text: string }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const startMs = Math.round((mins * 60 + secs) * 1000);
        const text = match[3].trim();
        if (text) {
          tempLrc.push({ startMs, text });
        }
      }
    });

    tempLrc.sort((a, b) => a.startMs - b.startMs);

    tempLrc.forEach((item, idx) => {
      const startMs = item.startMs;
      const endMs = idx < tempLrc.length - 1 ? tempLrc[idx + 1].startMs : startMs + 3000;
      const duration = Math.max(800, endMs - startMs);

      const wordsList = item.text.split(/\s+/).filter(Boolean);
      const wordDuration = duration / Math.max(1, wordsList.length);

      const words: SubtitleWord[] = wordsList.map((w, wIdx) => ({
        id: `w-${idx}-${wIdx}`,
        text: w,
        start_ms: Math.round(startMs + wIdx * wordDuration),
        end_ms: Math.round(startMs + (wIdx + 1) * wordDuration)
      }));

      parsedSubtitles.push({
        id: `lyric-line-${idx + 1}`,
        text: item.text,
        start_ms: startMs,
        end_ms: endMs,
        emoji: emojiPool[idx % emojiPool.length],
        words: words
      });
    });
  } else {
    // Plain text lines without timestamps -> distribute across total duration
    const totalMs = totalDurationSeconds * 1000;
    const lineDuration = totalMs / Math.max(1, lines.length);

    lines.forEach((lineText, idx) => {
      const cleanText = lineText.replace(/^\[.*?\]\s*/, '').trim();
      if (!cleanText) return;

      const startMs = Math.round(idx * lineDuration);
      const endMs = Math.round((idx + 1) * lineDuration);
      const duration = endMs - startMs;

      const wordsList = cleanText.split(/\s+/).filter(Boolean);
      const wordDuration = duration / Math.max(1, wordsList.length);

      const words: SubtitleWord[] = wordsList.map((w, wIdx) => ({
        id: `w-${idx}-${wIdx}`,
        text: w,
        start_ms: Math.round(startMs + wIdx * wordDuration),
        end_ms: Math.round(startMs + (wIdx + 1) * wordDuration)
      }));

      parsedSubtitles.push({
        id: `lyric-line-${idx + 1}`,
        text: cleanText,
        start_ms: startMs,
        end_ms: endMs,
        emoji: emojiPool[idx % emojiPool.length],
        words: words
      });
    });
  }

  return parsedSubtitles;
}
