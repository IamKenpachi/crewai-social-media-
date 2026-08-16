import { describe, it, expect, vi } from 'vitest';
import { musicSynth } from '../audioSynth';

describe('Audio Synthesizer & Ducking Engine', () => {
  it('initializes musicSynth singleton with default state', () => {
    expect(musicSynth).toBeDefined();
    expect(typeof musicSynth.start).toBe('function');
    expect(typeof musicSynth.stop).toBe('function');
    expect(typeof musicSynth.setDucking).toBe('function');
  });

  it('handles start and stop calls safely without errors in test environment', () => {
    expect(() => {
      musicSynth.start('energetic', 128);
      musicSynth.setDucking(true, 0.25);
      musicSynth.stop();
    }).not.toThrow();
  });
});
