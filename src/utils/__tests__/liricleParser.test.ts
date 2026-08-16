import { describe, it, expect } from 'vitest';
import { parseLyriaLyricsToSubtitles } from '../liricleParser';

describe('Liricle / Lyria Lyrics Parser', () => {
  it('correctly parses Lyria timestamp range format [start:end] text', () => {
    const rawLyriaText = `[0.0:2.6] Sunlight on the kitchen floor
[2.7:5.3] Don't know what I'm waiting for
[5.4:8.0] This little dress of blue and white
[8.1:10.7] Catching the afternoon light`;

    const subtitles = parseLyriaLyricsToSubtitles(rawLyriaText, 27);

    expect(subtitles).toHaveLength(4);
    expect(subtitles[0].text).toBe('Sunlight on the kitchen floor');
    expect(subtitles[0].start_ms).toBe(0);
    expect(subtitles[0].end_ms).toBe(2600);
    expect(subtitles[0].words).toHaveLength(5);
    expect(subtitles[0].words[0].text).toBe('Sunlight');
    expect(subtitles[0].words[0].start_ms).toBe(0);

    expect(subtitles[1].text).toBe("Don't know what I'm waiting for");
    expect(subtitles[1].start_ms).toBe(2700);
    expect(subtitles[1].end_ms).toBe(5300);

    expect(subtitles[3].text).toBe('Catching the afternoon light');
    expect(subtitles[3].start_ms).toBe(8100);
    expect(subtitles[3].end_ms).toBe(10700);
  });

  it('correctly parses standard LRC format [mm:ss.xx]', () => {
    const lrcText = `[00:00.00] Intro beat
[00:03.50] Dancing in the summer glow
[00:07.20] Walking down the coastal road`;

    const subtitles = parseLyriaLyricsToSubtitles(lrcText, 15);

    expect(subtitles).toHaveLength(3);
    expect(subtitles[1].text).toBe('Dancing in the summer glow');
    expect(subtitles[1].start_ms).toBe(3500);
    expect(subtitles[1].end_ms).toBe(7200);
    expect(subtitles[1].words).toHaveLength(5);
  });

  it('distributes plain text lines evenly across duration when timestamps are missing', () => {
    const plainText = `Line 1: Summer morning
Line 2: Golden rays
Line 3: Ocean breeze`;

    const subtitles = parseLyriaLyricsToSubtitles(plainText, 15);

    expect(subtitles).toHaveLength(3);
    expect(subtitles[0].start_ms).toBe(0);
    expect(subtitles[0].end_ms).toBe(5000);
    expect(subtitles[1].start_ms).toBe(5000);
    expect(subtitles[1].end_ms).toBe(10000);
    expect(subtitles[2].start_ms).toBe(10000);
    expect(subtitles[2].end_ms).toBe(15000);
  });

  it('handles empty or malformed input gracefully without crashing', () => {
    expect(parseLyriaLyricsToSubtitles('')).toEqual([]);
    expect(parseLyriaLyricsToSubtitles('   \n\n  ')).toEqual([]);
    expect(parseLyriaLyricsToSubtitles(null as any)).toEqual([]);
  });
});
