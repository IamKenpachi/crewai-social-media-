// High-CTR YouTube Shorts Thumbnail Composer with empirical best practices

export interface ThumbnailConfig {
  title?: string;
  headlineText?: string;
  subBadge?: string;
  mood?: string;
  colorAccent?: string;
  aspect: '9:16' | '16:9';
  sourceImageBase64?: string;
  variantType?: 'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH';
  focalHighlightText?: string;
  showOverlay?: boolean;
}

export function generateClientThumbnailSvg(config: ThumbnailConfig): string {
  // If the user already has a base64 / URL image and overlay is not requested, return clean image directly
  if (config.sourceImageBase64 && config.showOverlay === false) {
    return config.sourceImageBase64;
  }

  const isVertical = config.aspect === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;
  const variantType = config.variantType || 'CURIOSITY_GAP';
  const accentColor = config.colorAccent || (variantType === 'EMOTION_FACE' ? '#EF4444' : variantType === 'MINIMAL_PUNCH' ? '#38BDF8' : '#FACC15');
  const subBadge = config.subBadge || (variantType === 'EMOTION_FACE' ? '⚡ SHOCKING' : variantType === 'MINIMAL_PUNCH' ? 'PRO TIP' : '★ MUST WATCH');

  // Format 2-4 word high-impact hook
  const rawText = config.headlineText || config.title || (variantType === 'EMOTION_FACE' ? 'NEVER DO THIS ❌' : variantType === 'MINIMAL_PUNCH' ? 'THE SECRET HACK' : 'SECRET REVEALED ⚡');
  const words = rawText.trim().split(/\s+/);
  const hookWords = words.length > 4 ? words.slice(0, 4).join(' ') : rawText;
  const displayHook = hookWords.toUpperCase();

  // If we have a source image and overlay is enabled, create subtle modern glow/badge accents without blocking the subject's face
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="50%" stop-color="#111827" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>

      <linearGradient id="subtleTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.65" />
        <stop offset="25%" stop-color="#000000" stop-opacity="0.0" />
      </linearGradient>

      <linearGradient id="subtleBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="70%" stop-color="#000000" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
      </linearGradient>

      <filter id="heavyShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
      </filter>
    </defs>

    <!-- Canvas Background / Uploaded Frame -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

    ${config.sourceImageBase64 ? `
      <image href="${config.sourceImageBase64}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
      <rect width="${width}" height="${height}" fill="url(#subtleTopGrad)" />
      <rect width="${width}" height="${height}" fill="url(#subtleBottomGrad)" />
    ` : `
      <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${width * 0.4}" fill="${accentColor}" fill-opacity="0.15" />
      <path d="M0 0 L${width} ${height} M0 ${height} L${width} 0" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
    `}

    <!-- Optional Floating CTR Badge (Top Left Safe Zone) -->
    ${subBadge ? `
    <g transform="translate(${isVertical ? 28 : 48}, ${isVertical ? 36 : 36})" filter="url(#heavyShadow)">
      <rect x="0" y="0" width="${isVertical ? 210 : 240}" height="${isVertical ? 44 : 48}" rx="10" fill="#000000" fill-opacity="0.8" stroke="${accentColor}" stroke-width="2"/>
      <text x="${isVertical ? 105 : 120}" y="${isVertical ? 28 : 31}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${isVertical ? 16 : 18}" fill="${accentColor}" text-anchor="middle" letter-spacing="1">
        ${subBadge.toUpperCase()}
      </text>
    </g>
    ` : ''}

    <!-- Optional Headline Text Pill (Placed at top-third so face/subject remains 100% visible) -->
    ${config.headlineText ? `
    <g transform="translate(${width / 2}, ${height * (isVertical ? 0.16 : 0.18)})" filter="url(#heavyShadow)">
      <text x="0" y="0" font-family="Impact, Montserrat, Arial Black, sans-serif" font-weight="900" font-size="${isVertical ? 38 : 46}" fill="#ffffff" stroke="#000000" stroke-width="10" paint-order="stroke fill" text-anchor="middle" letter-spacing="1">
        ${displayHook}
      </text>
    </g>
    ` : ''}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
