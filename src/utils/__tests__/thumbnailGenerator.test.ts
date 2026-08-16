import { describe, it, expect } from 'vitest';
import { generateClientThumbnailSvg } from '../thumbnailGenerator';

describe('Thumbnail Generator Utility', () => {
  it('returns clean source image base64 without synthetic overlays', () => {
    const fakeImg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD';
    const result = generateClientThumbnailSvg({
      aspect: '16:9',
      sourceImageBase64: fakeImg,
      variantType: 'EMOTION_FACE'
    });

    expect(result).toBe(fakeImg);
  });

  it('returns empty string when no source image provided', () => {
    const result = generateClientThumbnailSvg({
      aspect: '9:16'
    });

    expect(result).toBe('');
  });
});
