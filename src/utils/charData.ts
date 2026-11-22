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

function samePoint(a: number[] | undefined, b: number[] | undefined): boolean {
  return Boolean(a && b && a[0] === b[0] && a[1] === b[1]);
}

function hasOutOfBoundsMedianPoint(median: number[][]): boolean {
  return median.some(([x, y]) => x < -50 || x > 1074 || y < -150 || y > 1000);
}

/**
 * Merges duplicated/mirrored split-loop stroke entries present in
 * @k1low/hanzi-writer-data-jp (e.g. あ, お, す, な, ぬ, ね, の, は, ま, み, む, め, よ, る).
 * Those entries split one continuous looped stroke into two SVG paths while leaving
 * the full median on the first entry and a mirrored/off-canvas median on the second.
 */
function sanitizeCharacterStrokeData(data: CharacterStrokeData): CharacterStrokeData {
  const strokes: string[] = [];
  const medians: number[][][] = [];
  const indexMap: number[] = [];

  for (let i = 0; i < data.strokes.length; i++) {
    const strokePath = data.strokes[i];
    const median = data.medians[i];
    const prevMedian = medians[medians.length - 1];

    const sharesTail =
      Boolean(prevMedian && median) &&
      prevMedian.length >= 3 &&
      median.length >= 3 &&
      samePoint(prevMedian[prevMedian.length - 1], median[median.length - 1]) &&
      samePoint(prevMedian[prevMedian.length - 2], median[median.length - 2]);

    const isSplitLoopArtifact =
      sharesTail &&
      (prevMedian.length === median.length || hasOutOfBoundsMedianPoint(median));

    if (isSplitLoopArtifact && strokes.length > 0) {
      strokes[strokes.length - 1] = `${strokes[strokes.length - 1]} ${strokePath}`;
      indexMap.push(strokes.length - 1);
    } else {
      strokes.push(strokePath);
      medians.push(median);
      indexMap.push(strokes.length - 1);
    }
  }

  const radStrokes = data.radStrokes
    ? Array.from(
        new Set(
          data.radStrokes
            .map((idx) => indexMap[idx])
            .filter((idx): idx is number => typeof idx === 'number'),
        ),
      )
    : undefined;

  return {
    strokes,
    medians,
    ...(radStrokes ? {radStrokes} : {}),
  };
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
    const rawData = (await res.json()) as CharacterStrokeData;
    const data = sanitizeCharacterStrokeData(rawData);
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
let activePlaybackToken = 0;
let ttsEndpointAvailable: boolean | null = null;

function getJapaneseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return undefined;
  }
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === 'ja-jp') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('ja'))
  );
}

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    } catch {
      // ignore
    }
  }

  // Probe once whether /api/tts actually streams audio (false in static builds / offline)
  fetch('/api/tts?q=%E3%81%82', {method: 'GET'})
    .then((res) => {
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      ttsEndpointAvailable = res.ok && ct.includes('audio');
    })
    .catch(() => {
      ttsEndpointAvailable = false;
    });
}

function playWithWebSpeech(
  text: string,
  token: number,
  onStart?: () => void,
  onEnd?: () => void,
  onFailure?: () => void,
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const synth = window.speechSynthesis;
  try {
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    if (synth.paused) {
      synth.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.volume = 1;

    const jpVoice = getJapaneseVoice();
    if (jpVoice) {
      utterance.voice = jpVoice;
    }

    let finished = false;
    const safetyTimer = window.setTimeout(() => {
      if (!finished && activePlaybackToken === token) {
        finished = true;
        activeUtterance = null;
        onEnd?.();
      }
    }, 6000);

    utterance.onstart = () => {
      if (activePlaybackToken === token) {
        onStart?.();
      }
    };

    utterance.onend = () => {
      window.clearTimeout(safetyTimer);
      if (finished) return;
      finished = true;
      if (activePlaybackToken === token) {
        activeUtterance = null;
        onEnd?.();
      }
    };

    utterance.onerror = (event) => {
      window.clearTimeout(safetyTimer);
      if (finished) return;
      finished = true;
      if (activePlaybackToken !== token) return;
      activeUtterance = null;
      const errCode = (event as SpeechSynthesisErrorEvent | undefined)?.error;
      if (errCode === 'canceled' || errCode === 'interrupted') {
        onEnd?.();
        return;
      }
      onFailure?.();
    };

    activeUtterance = utterance;
    onStart?.();
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function playWithHtmlAudio(
  text: string,
  token: number,
  callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  } | undefined,
  allowWebSpeechFallback: boolean,
): void {
  const audio = activeAudioEl || new Audio();
  activeAudioEl = audio;
  audio.volume = 1;

  const tryDirect = ttsEndpointAvailable === false;
  let stage: 'proxy' | 'direct' | 'done' = tryDirect ? 'direct' : 'proxy';

  const failFinal = () => {
    if (activePlaybackToken !== token) return;
    stage = 'done';
    callbacks?.onEnd?.();
    if (allowWebSpeechFallback) {
      const started = playWithWebSpeech(
        text,
        token,
        callbacks?.onStart,
        callbacks?.onEnd,
        () => {
          callbacks?.onEnd?.();
          callbacks?.onError?.('Audio giapponese non disponibile su questo dispositivo.');
        },
      );
      if (started) return;
    }
    callbacks?.onError?.('Audio giapponese non disponibile su questo dispositivo.');
  };

  const handleFailure = () => {
    if (activePlaybackToken !== token || stage === 'done') return;
    if (stage === 'proxy') {
      ttsEndpointAvailable = false;
      stage = 'direct';
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text,
      )}&tl=ja&client=tw-ob`;
      audio.play().catch(handleFailure);
      return;
    }
    failFinal();
  };

  audio.onplaying = () => {
    if (activePlaybackToken === token) {
      callbacks?.onStart?.();
    }
  };
  audio.onended = () => {
    if (activePlaybackToken === token) {
      stage = 'done';
      callbacks?.onEnd?.();
    }
  };
  audio.onerror = handleFailure;

  if (stage === 'proxy') {
    audio.removeAttribute('referrerpolicy');
    audio.src = `/api/tts?q=${encodeURIComponent(text)}`;
  } else {
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.src = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text,
    )}&tl=ja&client=tw-ob`;
  }

  callbacks?.onStart?.();
  audio.play().catch(handleFailure);
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

  const token = ++activePlaybackToken;

  // Stop previous audio cleanly
  if (activeAudioEl) {
    activeAudioEl.onended = null;
    activeAudioEl.onerror = null;
    activeAudioEl.onplaying = null;
    activeAudioEl.pause();
    activeAudioEl.currentTime = 0;
  }

  const hasSpeechApi = 'speechSynthesis' in window;
  const hasNativeJpVoice = Boolean(getJapaneseVoice());
  const preferSpeechSync =
    hasSpeechApi &&
    (hasNativeJpVoice || ttsEndpointAvailable === false || !navigator.onLine);

  // Execute Web Speech synchronously inside the click gesture when a native voice
  // is available or the dev /api/tts proxy isn't active (e.g. static build / offline).
  if (preferSpeechSync) {
    const started = playWithWebSpeech(
      cleaned,
      token,
      callbacks?.onStart,
      callbacks?.onEnd,
      () => {
        if (activePlaybackToken !== token) return;
        playWithHtmlAudio(cleaned, token, callbacks, false);
      },
    );
    if (started) return;
  }

  playWithHtmlAudio(cleaned, token, callbacks, hasSpeechApi);
}
