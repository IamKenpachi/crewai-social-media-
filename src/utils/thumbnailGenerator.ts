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
}

export function generateClientThumbnailSvg(config: ThumbnailConfig): string {
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Base Canvas Background Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="50%" stop-color="#111827" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>

      <!-- Contrast Vignette Gradient to ensure 100% mobile text readability -->
      <linearGradient id="vignetteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
        <stop offset="35%" stop-color="#000000" stop-opacity="${variantType === 'MINIMAL_PUNCH' ? '0.15' : '0.25'}" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.92" />
      </linearGradient>

      <!-- High-Impact Neon Glow Filter for Outer Rim -->
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="${accentColor}" flood-opacity="0.85"/>
      </filter>

      <!-- Extreme Contrast Drop Shadow for Mobile Legibility -->
      <filter id="heavyShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="1.0"/>
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

    <!-- Uploaded Media Frame or Fallback Graphic -->
    ${config.sourceImageBase64 ? `
      <image href="${config.sourceImageBase64}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
    ` : `
      <!-- Dynamic High-Energy Radial Glow -->
      <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${width * 0.4}" fill="${accentColor}" fill-opacity="0.15" filter="url(#neonGlow)"/>
      <path d="M0 0 L${width} ${height} M0 ${height} L${width} 0" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
    `}

    <!-- Dark Contrast Vignette Overlay (Protects text contrast on all mobile screens) -->
    <rect width="${width}" height="${height}" fill="url(#vignetteGrad)" />

    <!-- Outer High-CTR Framing Rim (Stops blending with YouTube light/dark themes) -->
    <rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="${accentColor}" stroke-width="${variantType === 'MINIMAL_PUNCH' ? '4' : '6'}" rx="16" opacity="0.9" filter="url(#neonGlow)" />

    <!-- TOP-LEFT: Urgency Badge (Safe Zone: Avoids YouTube bottom-right duration overlay) -->
    <g transform="translate(${isVertical ? 32 : 64}, ${isVertical ? 48 : 48})" filter="url(#heavyShadow)">
      <rect x="0" y="0" width="${isVertical ? 240 : 280}" height="${isVertical ? 52 : 56}" rx="12" fill="${variantType === 'EMOTION_FACE' ? '#dc2626' : variantType === 'MINIMAL_PUNCH' ? '#0f172a' : '#ef4444'}" stroke="${variantType === 'MINIMAL_PUNCH' ? accentColor : '#ffffff'}" stroke-width="2"/>
      <text x="${isVertical ? 120 : 140}" y="${isVertical ? 34 : 37}" font-family="Impact, Montserrat, system-ui, sans-serif" font-weight="900" font-size="${isVertical ? 22 : 24}" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
        ${subBadge.toUpperCase()}
      </text>
    </g>

    <!-- UPPER-THIRD / CENTER: 2-4 Word High-CTR Curiosity Hook -->
    <g transform="translate(${width / 2}, ${height * (isVertical ? 0.46 : 0.48)})" filter="url(#heavyShadow)">
      <!-- Solid High-Contrast Pill Container -->
      <rect x="${-(width * 0.42)}" y="${-(isVertical ? 54 : 60)}" width="${width * 0.84}" height="${isVertical ? 108 : 120}" rx="16" fill="#000000" fill-opacity="0.92" stroke="${accentColor}" stroke-width="4"/>
      
      <!-- Punchy Typography Layer -->
      <text x="0" y="${isVertical ? 18 : 20}" font-family="Impact, Montserrat, Arial Black, sans-serif" font-weight="900" font-size="${isVertical ? 46 : 54}" fill="${accentColor}" text-anchor="middle" letter-spacing="1">
        ${displayHook}
      </text>
    </g>

    <!-- LOWER-THIRD: Subtitle / Emotional Context -->
    <g transform="translate(${width / 2}, ${height * (isVertical ? 0.60 : 0.65)})" filter="url(#heavyShadow)">
      <text x="0" y="0" font-family="Impact, Montserrat, system-ui, sans-serif" font-weight="800" font-size="${isVertical ? 26 : 30}" fill="#ffffff" text-anchor="middle" letter-spacing="2">
        ${config.focalHighlightText ? config.focalHighlightText.toUpperCase() : (config.mood ? config.mood.substring(0, 32).toUpperCase() : '100% MUST WATCH')}
      </text>
    </g>

    <!-- BOTTOM CTA PILL (Placed left-aligned to leave bottom-right duration badge clear) -->
    <g transform="translate(${isVertical ? 32 : 64}, ${height - (isVertical ? 110 : 110)})" filter="url(#heavyShadow)">
      <rect width="${isVertical ? 320 : 380}" height="${isVertical ? 48 : 52}" rx="24" fill="${accentColor}"/>
      <text x="${isVertical ? 160 : 190}" y="${isVertical ? 31 : 34}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${isVertical ? 18 : 20}" fill="#000000" text-anchor="middle" letter-spacing="1">
        ${variantType === 'EMOTION_FACE' ? 'SEE THE REACTION ▶' : variantType === 'MINIMAL_PUNCH' ? 'DISCOVER THE HACK ▶' : 'TAP TO WATCH NOW ▶'}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
