import { useEffect } from 'react';

let lastHoverAt = 0;

function playTone(kind: 'tap' | 'nav' | 'hover' = 'tap') {
  if (localStorage.getItem('hireiq-sound') === 'off') return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = kind === 'nav' ? 'triangle' : kind === 'hover' ? 'sine' : 'sine';
  oscillator.frequency.setValueAtTime(kind === 'nav' ? 520 : kind === 'hover' ? 680 : 390, now);
  oscillator.frequency.exponentialRampToValueAtTime(kind === 'nav' ? 740 : kind === 'hover' ? 760 : 520, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === 'nav' ? 0.045 : kind === 'hover' ? 0.012 : 0.032, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'hover' ? 0.075 : 0.12));

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + (kind === 'hover' ? 0.085 : 0.13));
  window.setTimeout(() => context.close(), 180);
}

export function SoundFeedback() {
  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('button, a, [role="button"], input[type="submit"]');
      if (!interactive) return;
      playTone(interactive.tagName === 'A' ? 'nav' : 'tap');
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const now = Date.now();
      if (now - lastHoverAt < 90) return;
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('button, a, [role="button"]');
      if (!interactive) return;
      lastHoverAt = now;
      playTone('hover');
    };

    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerover', handlePointerOver);
    };
  }, []);

  return null;
}
