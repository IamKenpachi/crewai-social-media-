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
 * Client-side browser Muxer & Video Exporter
 * - Completely MUTES the original video's audio track (0% original speech)
 * - Muxes ONLY the AI-generated soundtrack into the exported video stream
 * - Supports animated waveform/visualizer overlays on video & image uploads
 */
export async function exportVideoWithMusic(options: VideoExportOptions): Promise<Blob> {
  const {
    videoSourceUrl,
    imageSourceUrl,
    audioUrl,
    mood = 'energetic',
    bpm = 124,
    durationSeconds = 12,
    onProgress
  } = options;

  onProgress?.(10, 'Initializing audio soundtrack synthesis...');

  // 1. Prepare Audio Context & Source
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

  onProgress?.(25, 'Audio synthesized. Preparing muted video stream...');

  const audioSource = audioCtx.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.loop = true;
  audioSource.connect(destNode);

  // 2. Setup Canvas & Video element for rendering
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1920; // 9:16 Shorts standard
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context for video export');

  let videoEl: HTMLVideoElement | null = null;
  let imgEl: HTMLImageElement | null = null;

  const isImage = !!imageSourceUrl || (!videoSourceUrl && !!imageSourceUrl);

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
    videoEl.muted = true; // STRICTLY MUTE ORIGINAL VIDEO
    videoEl.playsInline = true;
    videoEl.loop = true;
    await new Promise((resolve) => {
      videoEl!.onloadeddata = () => resolve(true);
      videoEl!.onerror = () => resolve(true);
      videoEl!.load();
    });
  }

  // 3. Combine Canvas Stream + Audio Stream
  const canvasStream = canvas.captureStream(30); // 30 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destNode.stream.getAudioTracks()
  ]);

  // Determine supported mime type
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
    videoBitsPerSecond: 6000000 // 6 Mbps high quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const exportPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const outputBlob = new Blob(chunks, { type: selectedMimeType });
      resolve(outputBlob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });

  // 4. Start recording & animation loop
  onProgress?.(35, 'Encoding video with synthesized music soundtrack...');
  audioSource.start(0);
  if (videoEl) {
    videoEl.currentTime = 0;
    await videoEl.play().catch(() => {});
  }
  mediaRecorder.start(100);

  const startTime = performance.now();
  const exportDurationMs = durationSeconds * 1000;

  await new Promise<void>((resolve) => {
    let animId: number;

    const drawFrame = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / exportDurationMs) * 60) + 35);
      onProgress?.(progress, `Muxing video frames... (${Math.round((elapsed / 1000))}s / ${durationSeconds}s)`);

      // Clear
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      if (videoEl && videoEl.readyState >= 2) {
        // Draw video centered maintaining aspect ratio
        const vRatio = videoEl.videoWidth / (videoEl.videoHeight || 1);
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
        // Draw image centered
        const iRatio = imgEl.width / (imgEl.height || 1);
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

      // Draw subtle audio visualizer glow on bottom
      const barCount = 32;
      const barWidth = width / barCount;
      const t = elapsed / 1000;
      for (let b = 0; b < barCount; b++) {
        const h = Math.abs(Math.sin(t * 8 + b * 0.4)) * 60 + 15;
        const gradient = ctx.createLinearGradient(0, height - h, 0, height);
        gradient.addColorStop(0, '#38BDF8');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(b * barWidth + 2, height - h, barWidth - 4, h);
      }

      // Draw Burned-in Animated Subtitles
      if (options.subtitles && options.subtitles.length > 0) {
        const lastLyricEndMs = Math.max(...options.subtitles.map((l) => l.end_ms), 11800);
        // Synchronize with continuous loop so lyrics stay active across the full song duration
        const loopElapsed = elapsed % lastLyricEndMs;

        const currentLine = options.subtitles.find(
          (line) => loopElapsed >= line.start_ms && loopElapsed <= line.end_ms
        ) || options.subtitles[Math.floor((loopElapsed / 2800) % options.subtitles.length)] || options.subtitles[0];

        if (currentLine && currentLine.words && currentLine.words.length > 0) {
          const style = options.subtitleStyle || 'hormozi';
          const subY = options.subtitlePosition === 'top' ? 220 : height - 260;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 52px Impact, Montserrat, Arial Black, sans-serif';

          // Measure total width of the line
          const fullText = currentLine.words.map(w => w.text).join(' ') + (currentLine.emoji ? ' ' + currentLine.emoji : '');
          
          if (style === 'minimal') {
            // Draw clean pill container
            const textWidth = ctx.measureText(fullText).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();
            ctx.roundRect((width - textWidth) / 2 - 24, subY - 40, textWidth + 48, 80, 20);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 3;
            ctx.stroke();
          } else if (style === 'neon') {
            // Draw glowing cyan container
            const textWidth = ctx.measureText(fullText).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.roundRect((width - textWidth) / 2 - 28, subY - 44, textWidth + 56, 88, 24);
            ctx.fill();
            ctx.strokeStyle = '#06B6D4';
            ctx.lineWidth = 4;
            ctx.stroke();
          }

          // Calculate word offsets for centering
          const totalWidth = ctx.measureText(fullText).width;
          let currentX = (width - totalWidth) / 2;

          currentLine.words.forEach((word, idx) => {
            const isActive = loopElapsed >= word.start_ms && loopElapsed <= word.end_ms;
            const wordWidth = ctx.measureText(word.text).width;
            const spaceWidth = ctx.measureText(' ').width;

            ctx.save();
            ctx.textAlign = 'left';

            if (style === 'hormozi') {
              ctx.font = isActive 
                ? '900 62px Impact, Montserrat, Arial Black, sans-serif' 
                : '900 52px Impact, Montserrat, Arial Black, sans-serif';
              
              // Heavy black outline
              ctx.lineWidth = 14;
              ctx.strokeStyle = '#000000';
              ctx.lineJoin = 'round';
              ctx.miterLimit = 2;
              ctx.strokeText(word.text.toUpperCase(), currentX, subY);

              // Fill
              ctx.fillStyle = isActive ? '#FDE047' : '#FFFFFF';
              ctx.fillText(word.text.toUpperCase(), currentX, subY);

            } else if (style === 'mrbeast') {
              const colorPalette = ['#22D3EE', '#FACC15', '#34D399', '#FB7185'];
              const wordColor = colorPalette[idx % colorPalette.length];

              ctx.font = isActive 
                ? '900 64px Impact, Montserrat, Arial Black, sans-serif' 
                : '900 52px Impact, Montserrat, Arial Black, sans-serif';

              ctx.lineWidth = 16;
              ctx.strokeStyle = '#000000';
              ctx.lineJoin = 'round';
              ctx.strokeText(word.text.toUpperCase(), currentX, subY);

              ctx.fillStyle = isActive ? wordColor : '#FFFFFF';
              ctx.fillText(word.text.toUpperCase(), currentX, subY);

            } else if (style === 'neon') {
              ctx.font = '800 48px monospace, Impact, sans-serif';
              ctx.fillStyle = isActive ? '#F472B6' : '#67E8F9';
              ctx.shadowColor = isActive ? '#EC4899' : '#06B6D4';
              ctx.shadowBlur = isActive ? 20 : 8;
              ctx.fillText(word.text.toUpperCase(), currentX, subY);

            } else {
              // Minimal
              ctx.font = '700 44px system-ui, -apple-system, sans-serif';
              ctx.fillStyle = isActive ? '#FBBF24' : '#FFFFFF';
              ctx.fillText(word.text, currentX, subY);
            }

            ctx.restore();
            currentX += wordWidth + spaceWidth;
          });

          // Draw emoji if present
          if (currentLine.emoji) {
            ctx.save();
            ctx.font = '48px Apple Color Emoji, Segoe UI Emoji, sans-serif';
            ctx.fillText(currentLine.emoji, currentX, subY + 2);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      if (elapsed >= exportDurationMs) {
        cancelAnimationFrame(animId);
        resolve();
      } else {
        animId = requestAnimationFrame(drawFrame);
      }
    };

    animId = requestAnimationFrame(drawFrame);
  });

  // 5. Finalize
  onProgress?.(95, 'Packaging final MP4/WebM video container...');
  if (videoEl) videoEl.pause();
  audioSource.stop();
  mediaRecorder.stop();
  audioCtx.close();

  const finalBlob = await exportPromise;
  onProgress?.(100, 'Video export ready!');
  return finalBlob;
}

/**
 * Triggers file download in the browser
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
