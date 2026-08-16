import { useState, useCallback, useRef, useEffect } from 'react';

export function useCopyToClipboard(timeoutMs: number = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback((text: string, key: string = 'default'): Promise<boolean> => {
    return new Promise((resolve) => {
      const onSuccess = () => {
        setCopiedKey(key);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopiedKey(null);
        }, timeoutMs);
        resolve(true);
      };

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(onSuccess)
          .catch((err) => {
            console.warn('navigator.clipboard failed, attempting textarea fallback:', err);
            fallbackCopy(text, onSuccess, resolve);
          });
      } else {
        fallbackCopy(text, onSuccess, resolve);
      }
    });
  }, [timeoutMs]);

  return { copiedKey, copy, isCopied: (key: string) => copiedKey === key };
}

function fallbackCopy(
  text: string,
  onSuccess: () => void,
  resolve: (val: boolean) => void
) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      onSuccess();
    } else {
      resolve(false);
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    resolve(false);
  }
}
