// High-CTR YouTube Thumbnail Utility
// Clean image passthrough without synthetic SVG boxes or overlays

export interface ThumbnailConfig {
  title?: string;
  headlineText?: string;
  subBadge?: string;
  mood?: string;
  colorAccent?: string;
  aspect: '9:16' | '16:9';
  sourceImageBase64?: string;
  variantType?: 'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH';
}

export function generateClientThumbnailSvg(config: ThumbnailConfig): string {
  // Return the pure image directly - no SVG graphic layers
  if (config.sourceImageBase64) {
    return config.sourceImageBase64;
  }
  return '';
}
