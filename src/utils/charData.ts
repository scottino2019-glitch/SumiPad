import {isHiragana, isKanji, isKatakana} from 'wanakana';
import type {CharacterStrokeData, WordItem} from '../types/japanese';

const charCache = new Map<string, CharacterStrokeData>();
const inflightRequests = new Map<string, Promise<CharacterStrokeData>>();

export function charToHexFile(char: string): string {
  const cp = char.codePointAt(0);
  if (!cp) {
    throw new Error('Carattere non valido');
  }
  return `${cp.toString(16).toLowerCase()}.json`;
}

export async function fetchCharacterStrokeData(char: string): Promise<CharacterStrokeData> {
  const cached = charCache.get(char);
  if (cached) {
    return cached;
  }

  const pending = inflightRequests.get(char);
  if (pending) {
    return pending;
  }

  const req = (async () => {
    const hexFile = charToHexFile(char);
    const res = await fetch(`/char-data/${hexFile}`);
    if (!res.ok) {
      throw new Error(`Dati tratti non disponibili per "${char}"`);
    }
    const data = (await res.json()) as CharacterStrokeData;
    charCache.set(char, data);
    return data;
  })().finally(() => {
    inflightRequests.delete(char);
  });

  inflightRequests.set(char, req);
  return req;
}

export async function checkCharacterSupport(char: string): Promise<boolean> {
  try {
    await fetchCharacterStrokeData(char);
    return true;
  } catch {
    return false;
  }
}

export function hanziWriterCharDataLoader(
  char: string,
  onLoad: (data: CharacterStrokeData) => void,
  onError: (err?: unknown) => void,
): void {
  fetchCharacterStrokeData(char).then(onLoad).catch(onError);
}

export function detectScriptType(text: string): WordItem['scriptType'] {
  const chars = Array.from(text.trim());
  let hasHira = false;
  let hasKata = false;
  let hasKanji = false;

  for (const ch of chars) {
    if (isHiragana(ch)) hasHira = true;
    else if (isKatakana(ch) || ch === 'ー') hasKata = true;
    else if (isKanji(ch) || ch === '々') hasKanji = true;
  }

  if (hasKanji && !hasHira && !hasKata) return 'kanji';
  if (hasHira && !hasKata && !hasKanji) return 'hiragana';
  if (hasKata && !hasHira && !hasKanji) return 'katakana';
  if (hasKanji) return 'misto';
  return 'misto';
}

export function splitWritableCharacters(text: string): string[] {
  return Array.from(text.trim()).filter((ch) => !/\s/.test(ch));
}

// Keep persistent references to avoid Chrome Garbage Collection cancelling playback
let activeAudioEl: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function playWithWebSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (msg: string) => void,
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Sintesi vocale non supportata su questo browser.');
    return;
  }

  const synth = window.speechSynthesis;
  const startSpeech = () => {
    try {
      if (synth.paused) synth.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      utterance.volume = 1;

      const voices = synth.getVoices();
      const jpVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ja'));
      if (jpVoice) {
        utterance.voice = jpVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        activeUtterance = null;
        onEnd?.();
      };
      utterance.onerror = () => {
        activeUtterance = null;
        onEnd?.();
        onError?.('Audio giapponese non disponibile offline su questo dispositivo.');
      };

      activeUtterance = utterance;
      synth.speak(utterance);
    } catch {
      onEnd?.();
      onError?.('Impossibile riprodurre l’audio.');
    }
  };

  if (synth.speaking || synth.pending) {
    synth.cancel();
    setTimeout(startSpeech, 60);
  } else {
    startSpeech();
  }
}

export function speakJapanese(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  },
): void {
  const cleaned = text.trim();
  if (!cleaned || typeof window === 'undefined') return;

  // Stop previous audio cleanly
  if (activeAudioEl) {
    activeAudioEl.pause();
    activeAudioEl.currentTime = 0;
  }
  if ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
    window.speechSynthesis.cancel();
  }

  const audio = activeAudioEl || new Audio();
  activeAudioEl = audio;
  audio.volume = 1;

  let triedDirect = false;

  const handleEnded = () => {
    callbacks?.onEnd?.();
  };

  const handleError = () => {
    if (!triedDirect) {
      triedDirect = true;
      // Fallback 1: direct Google TTS without Referer header (for static deployments)
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleaned,
      )}&tl=ja&client=tw-ob`;
      audio.play().catch(() => {
        // Fallback 2: native Web Speech API
        playWithWebSpeech(cleaned, callbacks?.onStart, callbacks?.onEnd, callbacks?.onError);
      });
      return;
    }

    // Fallback 2: native Web Speech API
    playWithWebSpeech(cleaned, callbacks?.onStart, callbacks?.onEnd, callbacks?.onError);
  };

  audio.onplaying = () => callbacks?.onStart?.();
  audio.onended = handleEnded;
  audio.onerror = handleError;

  // Primary: local same-origin /api/tts MP3 stream (cached by PWA Workbox for offline reuse)
  audio.removeAttribute('referrerpolicy');
  audio.src = `/api/tts?q=${encodeURIComponent(cleaned)}`;
  callbacks?.onStart?.();
  audio.play().catch(() => {
    handleError();
  });
}
