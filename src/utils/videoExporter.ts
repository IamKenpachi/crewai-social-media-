import { musicSynth } from './audioSynth';
import { SubtitleLine, SubtitleStylePreset } from '../types';

export interface VideoExportOptions {
  videoSourceUrl?: string;
  imageSourceUrl?: string;
  audioUrl?: string;
  mood?: string;
  bpm?: number;
  durationSeconds?: number;
  filename?: string;
  subtitles?: SubtitleLine[];
  subtitleStyle?: SubtitleStylePreset;
  subtitlePosition?: 'top' | 'bottom';
  onProgress?: (progressPercent: number, statusMessage: string) => void;
}

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Triggers instant browser download of a generated Blob
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Helper to draw rounded rectangle on Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Client-Side Autonomous Video Muxer & MP4/WebM Exporter
 * - Attaches DOM-mounted hidden video player to guarantee continuous frame decoding on loops
 * - Mutes original video audio track (0% original speech)
 * - Muxes AI-synthesized music soundtrack across the full 27s duration
 * - Renders Submagic-style animated bouncing lyrics synchronized with the music
 */
export async function exportVideoWithMusic(options: VideoExportOptions): Promise<Blob> {
  const {
    videoSourceUrl,
    imageSourceUrl,
    audioUrl,
    mood = 'energetic',
    bpm = 124,
    durationSeconds = 27,
    onProgress
  } = options;

  onProgress?.(8, 'Synthesizing continuous AI soundtrack...');

  // 1. Synthesize Soundtrack Audio Buffer
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const destNode = audioCtx.createMediaStreamDestination();

  let audioBuffer: AudioBuffer;
  if (audioUrl && (audioUrl.startsWith('data:audio/') || audioUrl.startsWith('http') || audioUrl.endsWith('.mp3') || audioUrl.endsWith('.wav'))) {
    try {
      const response = await fetch(audioUrl);
      const arrayBuf = await response.arrayBuffer();
      audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
    } catch (e) {
      console.warn('Fallback to offline music synth render:', e);
      audioBuffer = await musicSynth.renderOfflineAudioBuffer(mood, bpm, durationSeconds);
    }
  } else {
    audioBuffer = await musicSynth.renderOfflineAudioBuffer(mood, bpm, durationSeconds);
  }

  onProgress?.(20, 'Audio synthesized. Initializing video decoder...');

  const audioSource = audioCtx.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.loop = true;
  audioSource.connect(destNode);

  // 2. Setup 720x1280 (9:16) high-performance rendering Canvas
  const canvas = document.createElement('canvas');
  const width = 720;
  const height = 1280;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Failed to get 2D rendering context');

  let videoEl: HTMLVideoElement | null = null;
  let imgEl: HTMLImageElement | null = null;

  const isImage = !!imageSourceUrl;

  if (isImage) {
    imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.src = imageSourceUrl || '';
    await new Promise((resolve) => {
      if (imgEl!.complete) resolve(true);
      else imgEl!.onload = () => resolve(true);
      imgEl!.onerror = () => resolve(true);
    });
  } else if (videoSourceUrl) {
    videoEl = document.createElement('video');
    videoEl.crossOrigin = 'anonymous';
    videoEl.src = videoSourceUrl;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.loop = true;
    videoEl.autoplay = true;

    // Attach to DOM temporarily so Chrome hardware decoder keeps streaming frames during loops
    videoEl.style.position = 'fixed';
    videoEl.style.top = '-9999px';
    videoEl.style.left = '-9999px';
    videoEl.style.width = '10px';
    videoEl.style.height = '10px';
    videoEl.style.opacity = '0.01';
    videoEl.style.pointerEvents = 'none';
    document.body.appendChild(videoEl);

    videoEl.addEventListener('ended', () => {
      videoEl!.currentTime = 0;
      videoEl!.play().catch(() => {});
    });

    await new Promise((resolve) => {
      videoEl!.onloadeddata = () => resolve(true);
      videoEl!.onerror = () => resolve(true);
      videoEl!.load();
    });
  }

  // 3. Combine Canvas Stream (30fps) + Audio Stream
  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destNode.stream.getAudioTracks()
  ]);

  // Support preferred codecs
  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];

  let selectedMimeType = 'video/webm';
  for (const mime of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 6000000 // 6 Mbps crystal clear
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const exportPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const outputBlob = new Blob(chunks, { type: selectedMimeType });
      // Cleanup DOM video element
      if (videoEl && videoEl.parentNode) {
        videoEl.pause();
        videoEl.parentNode.removeChild(videoEl);
      }
      try {
        audioSource.stop();
        audioCtx.close();
      } catch {}
      resolve(outputBlob);
    };
    mediaRecorder.onerror = (e) => {
      if (videoEl && videoEl.parentNode) {
        videoEl.pause();
        videoEl.parentNode.removeChild(videoEl);
      }
      try {
        audioSource.stop();
        audioCtx.close();
      } catch {}
      reject(e);
    };
  });

  // 4. Start recording and continuous rendering loop
  onProgress?.(30, 'Rendering video frames and burning kinetic lyrics...');
  audioSource.start(0);
  if (videoEl) {
    videoEl.currentTime = 0;
    await videoEl.play().catch(() => {});
  }
  mediaRecorder.start(100);

  const startTime = performance.now();
  const exportDurationMs = durationSeconds * 1000;
  const subtitles = options.subtitles || [];
  const lastLyricEndMs = subtitles.length > 0 ? Math.max(...subtitles.map(l => l.end_ms), 11800) : 11800;

  await new Promise<void>((resolve) => {
    let animId: number;

    const drawFrame = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(98, Math.floor((elapsed / exportDurationMs) * 65) + 30);
      onProgress?.(progress, `Muxing video frames... (${Math.round(elapsed / 1000)}s / ${durationSeconds}s)`);

      // Ensure looping video never freezes
      if (videoEl) {
        if (videoEl.duration > 0 && !isNaN(videoEl.duration)) {
          if (videoEl.ended || videoEl.paused || videoEl.currentTime >= videoEl.duration - 0.05) {
            videoEl.currentTime = 0;
            videoEl.play().catch(() => {});
          }
        }
      }

      // Background clear
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw Video / Image Frame Centered & Scaled
      if (videoEl && videoEl.readyState >= 2) {
        const vRatio = (videoEl.videoWidth || 720) / (videoEl.videoHeight || 1280);
        const cRatio = width / height;
        let dw = width;
        let dh = height;
        let dx = 0;
        let dy = 0;

        if (vRatio > cRatio) {
          dh = height;
          dw = height * vRatio;
          dx = (width - dw) / 2;
        } else {
          dw = width;
          dh = width / vRatio;
          dy = (height - dh) / 2;
        }
        ctx.drawImage(videoEl, dx, dy, dw, dh);
      } else if (imgEl && imgEl.complete) {
        const iRatio = (imgEl.width || 720) / (imgEl.height || 1280);
        let dw = width;
        let dh = height;
        let dx = 0;
        let dy = 0;
        if (iRatio > width / height) {
          dh = height;
          dw = height * iRatio;
          dx = (width - dw) / 2;
        } else {
          dw = width;
          dh = width / iRatio;
          dy = (height - dh) / 2;
        }
        ctx.drawImage(imgEl, dx, dy, dw, dh);
      }

      // Subtle bottom audio visualizer pulses
      const barCount = 28;
      const barWidth = width / barCount;
      const t = elapsed / 1000;
      for (let b = 0; b < barCount; b++) {
        const h = Math.abs(Math.sin(t * 8 + b * 0.45)) * 40 + 10;
        const gradient = ctx.createLinearGradient(0, height - h, 0, height);
        gradient.addColorStop(0, '#38BDF8');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(b * barWidth + 2, height - h, barWidth - 4, h);
      }

      // =========================================================================
      // Render Animated Synchronized Lyrics (Mirroring SubtitleOverlay component)
      // =========================================================================
      if (subtitles.length > 0) {
        const loopElapsed = elapsed % lastLyricEndMs;

        const currentLine = subtitles.find(
          (line) => loopElapsed >= line.start_ms && loopElapsed <= line.end_ms
        ) || subtitles[Math.floor((loopElapsed / 2800) % subtitles.length)] || subtitles[0];

        if (currentLine && currentLine.words && currentLine.words.length > 0) {
          const style = options.subtitleStyle || 'hormozi';
          const subY = options.subtitlePosition === 'bottom' ? height - 220 : 160;

          // 1. BOUNCY COMIC STICKER POP (Hormozi Style)
          if (style === 'hormozi') {
            ctx.save();
            ctx.font = '900 36px Impact, Montserrat, Arial Black, sans-serif';
            ctx.textBaseline = 'middle';

            // Measure word pill widths
            const wordMeasures = currentLine.words.map((word) => {
              const textWidth = ctx.measureText(word.text.toUpperCase()).width;
              return {
                text: word.text.toUpperCase(),
                width: textWidth + 32, // padding
                textWidth
              };
            });

            const emojiWidth = currentLine.emoji ? 48 : 0;
            const totalWidth = wordMeasures.reduce((acc, w) => acc + w.width + 12, 0) + emojiWidth;
            let currentX = (width - totalWidth) / 2;

            currentLine.words.forEach((word, idx) => {
              const isActive = loopElapsed >= word.start_ms && loopElapsed <= word.end_ms;
              const isPast = loopElapsed > word.end_ms;
              const meas = wordMeasures[idx];
              const pillW = meas.width;
              const pillH = isActive ? 58 : 50;
              const pillY = subY - pillH / 2 + (idx % 2 === 0 ? -3 : 3);

              ctx.save();

              if (isActive) {
                // 3D Shadow Offset
                ctx.fillStyle = '#000000';
                drawRoundedRect(ctx, currentX, pillY + 6, pillW, pillH, 18);
                ctx.fill();

                // Yellow Gradient Pill
                const pillGrad = ctx.createLinearGradient(currentX, pillY, currentX + pillW, pillY + pillH);
                pillGrad.addColorStop(0, '#FDE047');
                pillGrad.addColorStop(1, '#FACC15');
                ctx.fillStyle = pillGrad;
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 18);
                ctx.fill();

                // Heavy Black Border
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#000000';
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 18);
                ctx.stroke();

                // Black Text
                ctx.fillStyle = '#000000';
                ctx.font = '900 38px Impact, Montserrat, Arial Black, sans-serif';
                ctx.fillText(meas.text, currentX + 16, pillY + pillH / 2);
              } else if (isPast) {
                // White Pill with Black Border
                ctx.fillStyle = '#000000';
                drawRoundedRect(ctx, currentX, pillY + 3, pillW, pillH, 16);
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 16);
                ctx.fill();

                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#000000';
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 16);
                ctx.stroke();

                ctx.fillStyle = '#0F172A';
                ctx.fillText(meas.text, currentX + 16, pillY + pillH / 2);
              } else {
                // Dark Translucent Pill
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 16);
                ctx.fill();

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                drawRoundedRect(ctx, currentX, pillY, pillW, pillH, 16);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.fillText(meas.text, currentX + 16, pillY + pillH / 2);
              }

              ctx.restore();
              currentX += pillW + 12;
            });

            // Draw emoji
            if (currentLine.emoji) {
              ctx.font = '42px Apple Color Emoji, Segoe UI Emoji, sans-serif';
              ctx.fillText(currentLine.emoji, currentX + 4, subY);
            }

            ctx.restore();

          // 2. KINETIC BEAT-SLAM (MrBeast Style)
          } else if (style === 'mrbeast') {
            ctx.save();
            ctx.font = '900 48px Impact, Montserrat, Arial Black, sans-serif';
            ctx.textBaseline = 'middle';

            const colors = ['#38BDF8', '#FACC15', '#4ADE80', '#FB7185', '#C084FC'];
            const wordMeasures = currentLine.words.map((w) => ({
              text: w.text.toUpperCase(),
              width: ctx.measureText(w.text.toUpperCase()).width
            }));
            const emojiWidth = currentLine.emoji ? 48 : 0;
            const totalWidth = wordMeasures.reduce((acc, w) => acc + w.width + 16, 0) + emojiWidth;
            let currentX = (width - totalWidth) / 2;

            currentLine.words.forEach((word, idx) => {
              const isActive = loopElapsed >= word.start_ms && loopElapsed <= word.end_ms;
              const meas = wordMeasures[idx];
              const activeColor = colors[idx % colors.length];

              ctx.save();
              ctx.font = isActive 
                ? '900 54px Impact, Montserrat, Arial Black, sans-serif' 
                : '900 46px Impact, Montserrat, Arial Black, sans-serif';

              // Heavy Black Outline
              ctx.lineWidth = 14;
              ctx.strokeStyle = '#000000';
              ctx.lineJoin = 'round';
              ctx.strokeText(meas.text, currentX, subY);

              // Colored Fill
              ctx.fillStyle = isActive ? activeColor : '#FFFFFF';
              ctx.fillText(meas.text, currentX, subY);

              ctx.restore();
              currentX += meas.width + 16;
            });

            if (currentLine.emoji) {
              ctx.font = '46px Apple Color Emoji, Segoe UI Emoji, sans-serif';
              ctx.fillText(currentLine.emoji, currentX + 6, subY);
            }

            ctx.restore();

          // 3. NEON ARCADE CYBER POP
          } else if (style === 'neon') {
            ctx.save();
            ctx.font = '800 42px monospace, Impact, sans-serif';
            ctx.textBaseline = 'middle';

            const wordMeasures = currentLine.words.map((w) => ({
              text: w.text.toUpperCase(),
              width: ctx.measureText(w.text.toUpperCase()).width
            }));
            const emojiWidth = currentLine.emoji ? 44 : 0;
            const totalWidth = wordMeasures.reduce((acc, w) => acc + w.width + 14, 0) + emojiWidth;

            // Cyber container
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            drawRoundedRect(ctx, (width - totalWidth) / 2 - 24, subY - 36, totalWidth + 48, 72, 24);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#06B6D4';
            ctx.stroke();

            let currentX = (width - totalWidth) / 2;
            currentLine.words.forEach((word) => {
              const isActive = loopElapsed >= word.start_ms && loopElapsed <= word.end_ms;
              const meas = wordMeasures.find(m => m.text === word.text.toUpperCase())!;

              ctx.save();
              ctx.fillStyle = isActive ? '#F472B6' : '#67E8F9';
              ctx.shadowColor = isActive ? '#EC4899' : '#06B6D4';
              ctx.shadowBlur = isActive ? 16 : 6;
              ctx.fillText(meas.text, currentX, subY);
              ctx.restore();

              currentX += meas.width + 14;
            });

            if (currentLine.emoji) {
              ctx.font = '40px Apple Color Emoji, Segoe UI Emoji, sans-serif';
              ctx.fillText(currentLine.emoji, currentX + 4, subY);
            }

            ctx.restore();

          // 4. FLOATING KARAOKE CLOUD PILL (Minimal)
          } else {
            ctx.save();
            ctx.font = '800 38px system-ui, -apple-system, sans-serif';
            ctx.textBaseline = 'middle';

            const wordMeasures = currentLine.words.map((w) => ({
              text: w.text,
              width: ctx.measureText(w.text).width
            }));
            const emojiWidth = currentLine.emoji ? 40 : 0;
            const totalWidth = wordMeasures.reduce((acc, w) => acc + w.width + 12, 0) + emojiWidth;

            // Dark pill container
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            drawRoundedRect(ctx, (width - totalWidth) / 2 - 20, subY - 32, totalWidth + 40, 64, 20);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.stroke();

            let currentX = (width - totalWidth) / 2;
            currentLine.words.forEach((word) => {
              const isActive = loopElapsed >= word.start_ms && loopElapsed <= word.end_ms;
              const meas = wordMeasures.find(m => m.text === word.text)!;

              ctx.fillStyle = isActive ? '#FDE047' : '#FFFFFF';
              ctx.fillText(meas.text, currentX, subY);
              currentX += meas.width + 12;
            });

            if (currentLine.emoji) {
              ctx.font = '36px Apple Color Emoji, Segoe UI Emoji, sans-serif';
              ctx.fillText(currentLine.emoji, currentX + 4, subY);
            }

            ctx.restore();
          }
        }
      }

      if (elapsed >= exportDurationMs) {
        cancelAnimationFrame(animId);
        resolve();
        return;
      }

      animId = requestAnimationFrame(drawFrame);
    };

    animId = requestAnimationFrame(drawFrame);
  });

  // 5. Finalize recording and stop recorder
  onProgress?.(98, 'Finalizing video and audio stream...');
  mediaRecorder.stop();

  return exportPromise;
}
