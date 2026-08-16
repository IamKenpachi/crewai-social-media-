// High-CTR YouTube Shorts & Social Media Thumbnail Compositor
// Engineered to match top creator standards (Top-loaded 2-tone typography, rim lighting, 3D props & doodle arrows)

export interface ThumbnailConfig {
  title?: string;
  headlineText?: string;
  subHeadlineText?: string;
  subBadge?: string;
  mood?: string;
  colorAccent?: string;
  aspect: '9:16' | '16:9';
  sourceImageBase64?: string;
  variantType?: 'EMOTION_FACE' | 'CURIOSITY_GAP' | 'MINIMAL_PUNCH';
  focalHighlightText?: string;
  showOverlay?: boolean;
  showDoodleArrows?: boolean;
  typographyTheme?: 'yellow_white_stack' | 'crimson_fire_stack' | 'cyber_neon_stack' | 'clean_bold';
}

export function generateClientThumbnailSvg(config: ThumbnailConfig): string {
  // If clean image is explicitly desired with no graphic overlay, return source image directly
  if (config.sourceImageBase64 && config.showOverlay === false) {
    return config.sourceImageBase64;
  }

  const isVertical = config.aspect === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;
  const variantType = config.variantType || 'CURIOSITY_GAP';

  // Primary visual palette based on archetype
  const primaryAccent = config.colorAccent || (
    variantType === 'EMOTION_FACE' ? '#EF4444' : 
    variantType === 'MINIMAL_PUNCH' ? '#38BDF8' : '#FACC15'
  );
  const secondaryAccent = variantType === 'EMOTION_FACE' ? '#FFA500' : '#FFFFFF';

  // Split title/headline into punchy 2-tier stacked words (e.g. "PASSIVE" + "INCOME IDEAS" or "VIRAL" + "SHORTS SECRETS")
  const rawText = config.headlineText || config.title || (
    variantType === 'EMOTION_FACE' ? 'WAIT FOR IT ⚠️' : 
    variantType === 'MINIMAL_PUNCH' ? 'THE 1% HACK' : 'SECRET REVEALED ⚡'
  );
  
  const words = rawText.trim().split(/\s+/);
  let line1 = words[0]?.toUpperCase() || 'SECRET';
  let line2 = words.slice(1).join(' ').toUpperCase() || 'REVEALED ⚡';

  if (words.length === 1) {
    line1 = words[0].toUpperCase();
    line2 = (config.subHeadlineText || 'MUST WATCH').toUpperCase();
  } else if (words.length > 4) {
    line1 = words.slice(0, 2).join(' ').toUpperCase();
    line2 = words.slice(2, 5).join(' ').toUpperCase();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <!-- Base Cinematic Dark Canvas Gradient -->
      <linearGradient id="canvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="50%" stop-color="#0b0f19" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>

      <!-- Radial Atmospheric Glow Behind Subject -->
      <radialGradient id="subjectGlow" cx="50%" cy="55%" r="45%" fx="50%" fy="55%">
        <stop offset="0%" stop-color="${primaryAccent}" stop-opacity="0.35" />
        <stop offset="60%" stop-color="${primaryAccent}" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
      </radialGradient>

      <!-- Top Text Shadow Gradient (Protects top-loaded typography contrast) -->
      <linearGradient id="topVignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.88" />
        <stop offset="32%" stop-color="#000000" stop-opacity="0.65" />
        <stop offset="55%" stop-color="#000000" stop-opacity="0.0" />
      </linearGradient>

      <!-- Bottom Edge Soft Shadow -->
      <linearGradient id="bottomVignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="75%" stop-color="#000000" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
      </linearGradient>

      <!-- Heavy 3D Text Drop Shadow -->
      <filter id="heavy3DShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="1.0"/>
        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.9"/>
      </filter>

      <!-- Glowing Neon Halo Filter for Rim-Lights & Doodle Arrows -->
      <filter id="neonHalo" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${primaryAccent}" flood-opacity="0.9"/>
      </filter>
    </defs>

    <!-- LAYER 1: BASE CANVAS & ATMOSPHERE -->
    <rect width="${width}" height="${height}" fill="url(#canvasBg)" />

    <!-- Atmospheric Halo Glow -->
    <rect width="${width}" height="${height}" fill="url(#subjectGlow)" />

    <!-- LAYER 2: PRIMARY SUBJECT IMAGE -->
    ${config.sourceImageBase64 ? `
      <image href="${config.sourceImageBase64}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
    ` : `
      <!-- Fallback Cinematic Silhouette & Light Burst -->
      <circle cx="${width * 0.5}" cy="${height * 0.58}" r="${width * 0.35}" fill="${primaryAccent}" fill-opacity="0.25" filter="url(#neonHalo)"/>
      <path d="M0 0 L${width} ${height} M0 ${height} L${width} 0" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
    `}

    <!-- Vignette Overlays for Legibility -->
    <rect width="${width}" height="${height}" fill="url(#topVignette)" />
    <rect width="${width}" height="${height}" fill="url(#bottomVignette)" />

    <!-- LAYER 3: TOP-LOADED 2-TONE STACKED TYPOGRAPHY (Top 28% Zone) -->
    <!-- Distressed Brush Banner Backdrop for Line 1 -->
    <g transform="translate(${width / 2}, ${isVertical ? 110 : 90})" filter="url(#heavy3DShadow)">
      
      <!-- Brush Text Line 1 (Giant Electric Accent) -->
      <text 
        x="0" 
        y="0" 
        font-family="Impact, Montserrat, Arial Black, sans-serif" 
        font-weight="900" 
        font-size="${isVertical ? (line1.length > 8 ? 64 : 78) : 68}" 
        fill="${primaryAccent}" 
        stroke="#000000" 
        stroke-width="${isVertical ? 16 : 14}" 
        stroke-linejoin="round"
        paint-order="stroke fill" 
        text-anchor="middle" 
        letter-spacing="${isVertical ? 2 : 3}"
      >
        ${line1}
      </text>

      <!-- Text Line 2 (Bold Clean White / Contrast Stack) -->
      <text 
        x="0" 
        y="${isVertical ? (line1.length > 8 ? 72 : 84) : 74}" 
        font-family="Impact, Montserrat, Arial Black, sans-serif" 
        font-weight="900" 
        font-size="${isVertical ? (line2.length > 12 ? 46 : 58) : 52}" 
        fill="${secondaryAccent}" 
        stroke="#000000" 
        stroke-width="${isVertical ? 14 : 12}" 
        stroke-linejoin="round"
        paint-order="stroke fill" 
        text-anchor="middle" 
        letter-spacing="${isVertical ? 1.5 : 2}"
      >
        ${line2}
      </text>
    </g>

    <!-- LAYER 4: DOODLE ARROWS & STORY ANNOTATIONS (Optional / High-CTR Visual Pointers) -->
    ${config.showDoodleArrows !== false ? `
    <!-- 3 Downward Hand-Drawn Doodle Arrows Pointing at Subject/Prop -->
    <g transform="translate(${width / 2}, ${isVertical ? 270 : 210})" filter="url(#heavy3DShadow)">
      <!-- Arrow 1 (Left) -->
      <path d="M -40 -10 L -40 25 M -50 15 L -40 25 L -30 15" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Arrow 2 (Center) -->
      <path d="M 0 -15 L 0 30 M -12 18 L 0 30 L 12 18" fill="none" stroke="${primaryAccent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonHalo)" />
      <!-- Arrow 3 (Right) -->
      <path d="M 40 -10 L 40 25 M 30 15 L 40 25 L 50 15" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    ` : ''}

    <!-- Optional Floating Urgency Badge (Top Left Corner Safe Zone) -->
    ${config.subBadge ? `
    <g transform="translate(${isVertical ? 32 : 48}, ${isVertical ? 32 : 32})" filter="url(#heavy3DShadow)">
      <rect x="0" y="0" width="${isVertical ? 190 : 220}" height="${isVertical ? 38 : 42}" rx="8" fill="#000000" fill-opacity="0.85" stroke="${primaryAccent}" stroke-width="2"/>
      <text x="${isVertical ? 95 : 110}" y="${isVertical ? 25 : 27}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${isVertical ? 14 : 16}" fill="${primaryAccent}" text-anchor="middle" letter-spacing="1">
        ${config.subBadge.toUpperCase()}
      </text>
    </g>
    ` : ''}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
