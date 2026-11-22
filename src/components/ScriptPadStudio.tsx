import HanziWriter from 'hanzi-writer';
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Eye,
  EyeOff,
  Hash,
  PenTool,
  Play,
  RotateCcw,
  Sparkles,
  Undo2,
  Volume2,
} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AREA_THEMES} from '../data/themes';
import type {
  ActiveSelection,
  CharacterStrokeData,
  PracticeMode,
  StudyAreaId,
  WordItem,
} from '../types/japanese';
import {
  fetchCharacterStrokeData,
  hanziWriterCharDataLoader,
  speakJapanese,
} from '../utils/charData';

interface ScriptPadStudioProps {
  activeArea: StudyAreaId;
  selection: ActiveSelection;
  masteredChars: Set<string>;
  personalWords: WordItem[];
  onSelectCharIndex: (index: number) => void;
  onCharMastered: (char: string) => void;
  onToggleBookmarkWord: (word: WordItem) => void;
  onNextItem: () => void;
}

interface FreehandStroke {
  points: Array<{x: number; y: number}>;
}

const PAD_SIZE = 340;
const PAD_PADDING = 24;
const THUMB_SIZE = 74;
const THUMB_PADDING = 7;

export function ScriptPadStudio({
  activeArea,
  selection,
  masteredChars,
  personalWords,
  onSelectCharIndex,
  onCharMastered,
  onToggleBookmarkWord,
  onNextItem,
}: ScriptPadStudioProps) {
  const theme = AREA_THEMES[activeArea];
  const currentChar = selection.characters[selection.activeCharIndex] || selection.characters[0];

  const [mode, setMode] = useState<PracticeMode>('animate');
  const [showOutline, setShowOutline] = useState(true);
  const [showStrokeNumbers, setShowStrokeNumbers] = useState(true);
  // Dedicated freehand guide toggle: OFF by default so Libero starts as a pure blank grid!
  const [showFreehandGuide, setShowFreehandGuide] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [strokeData, setStrokeData] = useState<CharacterStrokeData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeStrokeIndex, setActiveStrokeIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Quiz state
  const [quizStrokeNum, setQuizStrokeNum] = useState(0);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string>(
    'Traccia il primo tratto seguendo la guida.',
  );
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Freehand canvas state
  const [freehandStrokes, setFreehandStrokes] = useState<FreehandStroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentFreehandRef = useRef<FreehandStroke | null>(null);
  const freehandCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const writerContainerRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const isBookmarked = useMemo(() => {
    if (selection.type !== 'word' || !selection.wordItem) return false;
    return personalWords.some((w) => w.word === selection.wordItem?.word);
  }, [personalWords, selection]);

  const padTransform = useMemo(
    () => HanziWriter.getScalingTransform(PAD_SIZE, PAD_SIZE, PAD_PADDING),
    [],
  );

  const thumbTransform = useMemo(
    () => HanziWriter.getScalingTransform(THUMB_SIZE, THUMB_SIZE, THUMB_PADDING),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setStrokeData(null);
    setActiveStrokeIndex(0);

    fetchCharacterStrokeData(currentChar)
      .then((data) => {
        if (!cancelled) {
          setStrokeData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Carattere non disponibile');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentChar]);

  const startQuizSession = useCallback(
    (writer: HanziWriter) => {
      setQuizStrokeNum(0);
      setQuizMistakes(0);
      setQuizCompleted(false);
      setQuizFeedback('Traccia il tratto 1 rispettando direzione e ordine.');

      writer.quiz({
        leniency: 1.15,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        onCorrectStroke: (data) => {
          setQuizStrokeNum(data.strokeNum + 1);
          setActiveStrokeIndex(
            data.strokesRemaining > 0 ? data.strokeNum + 1 : data.strokeNum,
          );
          if (data.strokesRemaining > 0) {
            setQuizFeedback(
              `Ottimo! Tratto ${data.strokeNum + 1} corretto. Prosegui con il tratto ${data.strokeNum + 2}.`,
            );
          }
        },
        onMistake: (data) => {
          setQuizMistakes(data.totalMistakes);
          setQuizFeedback(
            data.mistakesOnStroke >= 2
              ? `Osserva il suggerimento animato per il tratto ${data.strokeNum + 1}.`
              : `Direzione o posizione errata sul tratto ${data.strokeNum + 1}. Riprova.`,
          );
        },
        onComplete: (summary) => {
          setQuizCompleted(true);
          onCharMastered(summary.character);
          setQuizFeedback(
            summary.totalMistakes === 0
              ? `Perfetto! "${summary.character}" completato senza errori.`
              : `"${summary.character}" completato (${summary.totalMistakes} ${
                  summary.totalMistakes === 1 ? 'correzione' : 'correzioni'
                }).`,
          );
        },
      });
    },
    [onCharMastered],
  );

  useEffect(() => {
    const container = writerContainerRef.current;
    if (!container || mode === 'freehand') {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {
          // ignore
        }
        writerRef.current = null;
      }
      if (container) container.innerHTML = '';
      return;
    }

    container.innerHTML = '';
    const writer = HanziWriter.create(container, currentChar, {
      width: PAD_SIZE,
      height: PAD_SIZE,
      padding: PAD_PADDING,
      showOutline,
      showCharacter: mode === 'animate',
      strokeAnimationSpeed: speed,
      strokeHighlightSpeed: Math.max(1.2, speed * 1.4),
      delayBetweenStrokes: Math.max(180, Math.round(450 / speed)),
      strokeColor: '#F8FAFC',
      outlineColor: '#334155',
      drawingColor: theme.highlightHex,
      highlightColor: theme.highlightHex,
      highlightCompleteColor: '#34D399',
      drawingWidth: 16,
      strokeWidth: 4,
      outlineWidth: 2,
      charDataLoader: hanziWriterCharDataLoader,
      onLoadCharDataError: () => {
        setLoadError(`Impossibile caricare i tratti per "${currentChar}".`);
      },
    });

    writerRef.current = writer;

    if (mode === 'animate') {
      writer.animateCharacter();
    } else if (mode === 'quiz') {
      startQuizSession(writer);
    }

    return () => {
      try {
        writer.cancelQuiz();
      } catch {
        // ignore
      }
      if (container) container.innerHTML = '';
      writerRef.current = null;
    };
  }, [currentChar, mode, showOutline, speed, theme.highlightHex, startQuizSession]);

  useEffect(() => {
    setFreehandStrokes([]);
  }, [currentChar]);

  useEffect(() => {
    if (mode !== 'freehand') return;
    const canvas = freehandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = PAD_SIZE * dpr;
    canvas.height = PAD_SIZE * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, PAD_SIZE, PAD_SIZE);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 11;

    const drawList = currentFreehandRef.current
      ? [...freehandStrokes, currentFreehandRef.current]
      : freehandStrokes;

    for (const stroke of drawList) {
      if (stroke.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.points.length === 1) {
        ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const prev = stroke.points[i - 1];
          const curr = stroke.points[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
    }
  }, [freehandStrokes, mode]);

  const handleAnimateAll = () => {
    if (mode !== 'animate') {
      setMode('animate');
      return;
    }
    const writer = writerRef.current;
    if (!writer) return;
    writer.hideCharacter({duration: 0});
    writer.animateCharacter();
  };

  const handleAnimateSingleStroke = (idx: number) => {
    setActiveStrokeIndex(idx);
    if (mode !== 'animate') {
      setMode('animate');
      setTimeout(() => {
        writerRef.current?.animateStroke(idx);
      }, 80);
      return;
    }
    writerRef.current?.animateStroke(idx);
  };

  const handlePrevStroke = () => {
    if (!strokeData) return;
    const nextIdx = Math.max(0, activeStrokeIndex - 1);
    handleAnimateSingleStroke(nextIdx);
  };

  const handleNextStroke = () => {
    if (!strokeData) return;
    const nextIdx = Math.min(strokeData.strokes.length - 1, activeStrokeIndex + 1);
    handleAnimateSingleStroke(nextIdx);
  };

  const handleRestartQuiz = () => {
    if (mode !== 'quiz') {
      setMode('quiz');
      return;
    }
    if (writerRef.current) {
      startQuizSession(writerRef.current);
    }
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * PAD_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * PAD_SIZE,
    };
  };

  const handleFreehandPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);
    currentFreehandRef.current = {points: [pt]};
    setFreehandStrokes((prev) => [...prev]);
  };

  const handleFreehandPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentFreehandRef.current) return;
    currentFreehandRef.current.points.push(getCanvasPoint(e));
    const canvas = freehandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pts = currentFreehandRef.current.points;
    if (pts.length >= 2) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 11;
      const a = pts[pts.length - 2];
      const b = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  };

  const handleFreehandPointerUp = () => {
    if (!isDrawingRef.current || !currentFreehandRef.current) return;
    isDrawingRef.current = false;
    const finished = currentFreehandRef.current;
    currentFreehandRef.current = null;
    setFreehandStrokes((prev) => [...prev, finished]);
  };

  const totalStrokes = strokeData?.strokes.length ?? 0;
  const isCurrentCharMastered = masteredChars.has(currentChar);
  const hasMultipleChars = selection.characters.length > 1;
  const hasNextCharInWord =
    hasMultipleChars && selection.activeCharIndex < selection.characters.length - 1;

  const handleSpeak = () => {
    setAudioError(null);
    const spokenText =
      selection.type === 'word' && selection.wordItem
        ? selection.wordItem.reading || selection.wordItem.word
        : selection.type === 'kanji' && selection.kanjiItem
          ? selection.kanjiItem.kunyomi !== '—'
            ? selection.kanjiItem.kunyomi.split('・')[0].replace(/[()]/g, '')
            : selection.kanjiItem.char
          : currentChar;

    speakJapanese(spokenText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (msg) => {
        setIsSpeaking(false);
        setAudioError(msg);
      },
    });
  };

  // Strictly hide stroke numbers in freehand mode unless user explicitly turns on freehand aid
  const shouldShowStrokeNumbers =
    mode === 'freehand'
      ? showFreehandGuide && showStrokeNumbers
      : showStrokeNumbers && (mode === 'animate' || showOutline);

  return (
    <section
      aria-label="Area di pratica interattiva ScriptPad"
      className="bg-[#131B2E] border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col gap-6"
    >
      {/* Selection Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-jp font-bold text-white tracking-tight">
              {selection.title}
            </h2>
            <span className="text-base sm:text-lg font-medium text-slate-300">
              {selection.subtitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
            {selection.detail && (
              <span className="text-slate-200 font-medium">{selection.detail}</span>
            )}
            {totalStrokes > 0 && (
              <>
                {selection.detail && <span aria-hidden="true">·</span>}
                <span className="tabular-nums">
                  {totalStrokes} {totalStrokes === 1 ? 'tratto' : 'tratti'} per "{currentChar}"
                </span>
              </>
            )}
            {isCurrentCharMastered && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Completato
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                isSpeaking
                  ? `${theme.accentBg} border-transparent text-white`
                  : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isSpeaking ? 'Riproduzione...' : 'Ascolta'}</span>
            </button>

          {selection.type === 'word' && selection.wordItem && !selection.wordItem.isCustom && (
            <button
              type="button"
              onClick={() => onToggleBookmarkWord(selection.wordItem!)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                isBookmarked
                  ? 'bg-violet-950/70 border-violet-500/70 text-violet-300'
                  : 'bg-[#0F172A] border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={isBookmarked ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
              <span>{isBookmarked ? 'In Lista Personale' : 'Salva Parola'}</span>
            </button>
          )}
          </div>
          {audioError && (
            <span className="text-[11px] text-amber-400">{audioError}</span>
          )}
        </div>
      </div>

      {/* Multi-character word stepper */}
      {hasMultipleChars && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1322] border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Caratteri della parola:
            </span>
            {selection.characters.map((ch, idx) => {
              const isActiveChar = idx === selection.activeCharIndex;
              const isDone = masteredChars.has(ch);
              return (
                <button
                  key={`${ch}-${idx}`}
                  type="button"
                  onClick={() => onSelectCharIndex(idx)}
                  className={`relative w-11 h-11 rounded-lg border font-jp text-xl font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isActiveChar
                      ? `${theme.accentBg} text-white border-transparent`
                      : 'bg-[#151E32] text-slate-200 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {ch}
                  {isDone && !isActiveChar && (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1"
                      aria-label="Completato"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            Carattere {selection.activeCharIndex + 1} di {selection.characters.length}
          </span>
        </div>
      )}

      {/* Mode Selector + Main Sandbox Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          {/* 3-Mode Segmented Control */}
          <div className="w-full max-w-[340px] grid grid-cols-3 p-1 bg-[#0B1120] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('animate')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'animate'
                  ? `${theme.accentBg} text-white`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Guida</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('quiz')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'quiz'
                  ? `${theme.accentBg} text-white`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Scrivi Ora</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('freehand')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'freehand'
                  ? `${theme.accentBg} text-white`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Libero</span>
            </button>
          </div>

          {/* Dark Sumi Practice Pad */}
          <div
            className="relative bg-[#0B101D] border-2 border-slate-700 rounded-xl overflow-hidden select-none shadow-inner"
            style={{width: PAD_SIZE, height: PAD_SIZE}}
          >
            {/* Crosshairs & Diagonals SVG Grid */}
            <svg
              width={PAD_SIZE}
              height={PAD_SIZE}
              viewBox={`0 0 ${PAD_SIZE} ${PAD_SIZE}`}
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0"
                x2={PAD_SIZE}
                y2={PAD_SIZE}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={PAD_SIZE}
                y1="0"
                x2="0"
                y2={PAD_SIZE}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={PAD_SIZE / 2}
                y1="0"
                x2={PAD_SIZE / 2}
                y2={PAD_SIZE}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <line
                x1="0"
                y1={PAD_SIZE / 2}
                x2={PAD_SIZE}
                y2={PAD_SIZE / 2}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
              <rect
                x={PAD_PADDING}
                y={PAD_PADDING}
                width={PAD_SIZE - PAD_PADDING * 2}
                height={PAD_SIZE - PAD_PADDING * 2}
                fill="none"
                stroke="#1E293B"
                strokeWidth="1"
              />
            </svg>

            {/* Freehand optional guide: strictly OFF by default so Libero has no visible strokes */}
            {mode === 'freehand' && showFreehandGuide && strokeData && (
              <svg
                width={PAD_SIZE}
                height={PAD_SIZE}
                viewBox={`0 0 ${PAD_SIZE} ${PAD_SIZE}`}
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <g transform={padTransform.transform}>
                  {strokeData.strokes.map((pathD, i) => (
                    <path key={i} d={pathD} fill="#263248" />
                  ))}
                </g>
              </svg>
            )}

            {/* HanziWriter Mount Container */}
            <div
              ref={writerContainerRef}
              className={`absolute inset-0 ${
                mode === 'quiz' ? 'cursor-crosshair touch-none' : ''
              } ${mode === 'freehand' ? 'hidden' : 'block'}`}
            />

            {/* Freehand Drawing Canvas */}
            {mode === 'freehand' && (
              <canvas
                ref={freehandCanvasRef}
                onPointerDown={handleFreehandPointerDown}
                onPointerMove={handleFreehandPointerMove}
                onPointerUp={handleFreehandPointerUp}
                onPointerCancel={handleFreehandPointerUp}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              />
            )}

            {/* Stroke Numbers Overlay */}
            {shouldShowStrokeNumbers && strokeData && (
              <svg
                width={PAD_SIZE}
                height={PAD_SIZE}
                viewBox={`0 0 ${PAD_SIZE} ${PAD_SIZE}`}
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                {strokeData.medians.map((median, idx) => {
                  const start = median[0];
                  if (!start) return null;
                  const sx = padTransform.x + start[0] * padTransform.scale;
                  const sy = PAD_SIZE - (padTransform.y + start[1] * padTransform.scale);
                  const isHighlighted = idx === activeStrokeIndex && mode === 'animate';
                  return (
                    <g key={idx} transform={`translate(${sx}, ${sy})`}>
                      <circle
                        r={isHighlighted ? 10 : 8}
                        fill={isHighlighted ? theme.accentHex : '#0F172A'}
                        stroke={isHighlighted ? '#FFFFFF' : '#64748B'}
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight="700"
                        fill={isHighlighted ? '#FFFFFF' : '#E2E8F0'}
                      >
                        {idx + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center text-sm text-rose-400">
                {loadError}
              </div>
            )}
          </div>

          {/* Interactive Feedback Strip beneath Pad */}
          <div className="w-full max-w-[340px] min-h-[44px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0D1322] border border-slate-800 text-xs">
            {mode === 'animate' && (
              <>
                <span className="text-slate-400">
                  Tratto attivo:{' '}
                  <strong className="text-white tabular-nums">
                    {totalStrokes > 0 ? `${activeStrokeIndex + 1} / ${totalStrokes}` : '—'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setMode('quiz')}
                  className={`font-semibold ${theme.accentText} hover:underline cursor-pointer`}
                >
                  Passa a Scrivi Ora →
                </button>
              </>
            )}

            {mode === 'quiz' && (
              <div className="flex items-center justify-between w-full gap-2">
                <span
                  className={
                    quizCompleted
                      ? 'text-emerald-400 font-medium'
                      : quizMistakes > 0
                        ? 'text-amber-400 font-medium'
                        : 'text-slate-300'
                  }
                >
                  {quizFeedback}
                </span>
                {quizCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasNextCharInWord) {
                        onSelectCharIndex(selection.activeCharIndex + 1);
                      } else {
                        onNextItem();
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-medium text-white rounded-md whitespace-nowrap shrink-0 cursor-pointer ${theme.accentBg}`}
                  >
                    {hasNextCharInWord ? 'Carattere succ.' : 'Prossimo'}
                  </button>
                )}
              </div>
            )}

            {mode === 'freehand' && (
              <>
                <span className="text-slate-400">
                  Foglio bianco · Tratti:{' '}
                  <strong className="text-white tabular-nums">
                    {freehandStrokes.length}
                  </strong>
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFreehandStrokes((prev) => prev.slice(0, -1))}
                    disabled={freehandStrokes.length === 0}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Annulla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreehandStrokes([])}
                    disabled={freehandStrokes.length === 0}
                    className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 disabled:opacity-40 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Pulisci</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls, Pedagogical Notes & Stroke Cards */}
        <div className="space-y-5 min-w-0">
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAnimateAll}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer ${theme.accentBg} hover:opacity-90`}
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Anima Tutto</span>
              </button>

              <div className="inline-flex items-center border border-slate-700 bg-[#131B2E] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={handlePrevStroke}
                  disabled={activeStrokeIndex <= 0}
                  aria-label="Tratto precedente"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAnimateSingleStroke(activeStrokeIndex)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 border-x border-slate-700 whitespace-nowrap tabular-nums cursor-pointer"
                >
                  Anima Tratto {activeStrokeIndex + 1}
                </button>
                <button
                  type="button"
                  onClick={handleNextStroke}
                  disabled={totalStrokes === 0 || activeStrokeIndex >= totalStrokes - 1}
                  aria-label="Tratto successivo"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {mode === 'quiz' && (
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#131B2E] border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ricomincia Quiz</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                {mode === 'freehand' ? (
                  <button
                    type="button"
                    onClick={() => setShowFreehandGuide((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      showFreehandGuide
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-[#131B2E] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {showFreehandGuide ? (
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {showFreehandGuide ? 'Aiuto Sfondo Visibile' : 'Foglio Completamente Vuoto'}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowOutline((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                        showOutline
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-[#131B2E] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {showOutline ? (
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{showOutline ? 'Traccia Visibile' : 'Traccia Nascosta'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowStrokeNumbers((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                        showStrokeNumbers
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-[#131B2E] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {showStrokeNumbers ? 'Numeri Visibili' : 'Numeri Nascosti'}
                      </span>
                    </button>
                  </>
                )}
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-400">
                <span className="whitespace-nowrap">
                  Velocità:{' '}
                  <strong className="text-white tabular-nums">{speed.toFixed(1)}x</strong>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.25}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-orange-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {selection.type === 'kanji' && selection.kanjiItem && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-800 bg-[#0D1322]">
              <div>
                <div className="text-[11px] font-medium text-slate-400">On’yomi</div>
                <div className="text-sm font-jp font-medium text-white mt-0.5">
                  {selection.kanjiItem.onyomi}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-400">Kun’yomi</div>
                <div className="text-sm font-jp font-medium text-white mt-0.5">
                  {selection.kanjiItem.kunyomi}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-400">Esempio d’uso</div>
                <div className="text-sm text-slate-200 mt-0.5">
                  <span className="font-jp font-semibold text-white">
                    {selection.kanjiItem.example.word}
                  </span>{' '}
                  <span className="text-xs text-slate-400">
                    ({selection.kanjiItem.example.reading}) — {selection.kanjiItem.example.meaning}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selection.type === 'kana' && selection.kanaItem?.note && (
            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0D1322] text-xs text-slate-300">
              <span className="font-semibold text-white">Nota di pronuncia e scrittura: </span>
              {selection.kanaItem.note}
            </div>
          )}

          {/* Individual Stroke-by-Stroke Interactive Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Guida Passo-Passo per Ogni Singolo Tratto
              </h3>
              <span className="text-xs text-slate-400">
                Clicca un riquadro per animare quel tratto
              </span>
            </div>

            {strokeData ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {strokeData.strokes.map((_, idx) => {
                  const isActive = idx === activeStrokeIndex;
                  const median = strokeData.medians[idx];
                  const startPt = median?.[0];
                  const nextPt = median?.[1] || median?.[median.length - 1];

                  const startX = startPt
                    ? thumbTransform.x + startPt[0] * thumbTransform.scale
                    : 0;
                  const startY = startPt
                    ? THUMB_SIZE - (thumbTransform.y + startPt[1] * thumbTransform.scale)
                    : 0;
                  const nextX = nextPt
                    ? thumbTransform.x + nextPt[0] * thumbTransform.scale
                    : startX;
                  const nextY = nextPt
                    ? THUMB_SIZE - (thumbTransform.y + nextPt[1] * thumbTransform.scale)
                    : startY;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnimateSingleStroke(idx)}
                      className={`group relative flex flex-col items-center p-2 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        isActive
                          ? `${theme.accentSurface} ${theme.accentBorder}`
                          : 'bg-[#0F172A] border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] mb-1">
                        <span
                          className={`font-semibold tabular-nums ${
                            isActive ? theme.accentText : 'text-slate-400'
                          }`}
                        >
                          Tratto {idx + 1}
                        </span>
                        {mode === 'quiz' && idx < quizStrokeNum && (
                          <span className="text-emerald-400 font-semibold">OK</span>
                        )}
                      </div>

                      <svg
                        width={THUMB_SIZE}
                        height={THUMB_SIZE}
                        viewBox={`0 0 ${THUMB_SIZE} ${THUMB_SIZE}`}
                        className="bg-[#0B101D] rounded border border-slate-800"
                      >
                        <line
                          x1={THUMB_SIZE / 2}
                          y1="0"
                          x2={THUMB_SIZE / 2}
                          y2={THUMB_SIZE}
                          stroke="#1E293B"
                          strokeWidth="0.75"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1="0"
                          y1={THUMB_SIZE / 2}
                          x2={THUMB_SIZE}
                          y2={THUMB_SIZE / 2}
                          stroke="#1E293B"
                          strokeWidth="0.75"
                          strokeDasharray="2 2"
                        />

                        <g transform={thumbTransform.transform}>
                          {strokeData.strokes.map((pathD, sIdx) => {
                            if (sIdx > idx) {
                              return <path key={sIdx} d={pathD} fill="#1E293B" />;
                            }
                            if (sIdx < idx) {
                              return <path key={sIdx} d={pathD} fill="#64748B" />;
                            }
                            return (
                              <path
                                key={sIdx}
                                d={pathD}
                                fill={theme.highlightHex}
                              />
                            );
                          })}
                        </g>

                        {startPt && (
                          <>
                            <line
                              x1={startX}
                              y1={startY}
                              x2={nextX}
                              y2={nextY}
                              stroke={theme.highlightHex}
                              strokeWidth="1.5"
                              strokeOpacity="0.55"
                            />
                            <circle
                              cx={startX}
                              cy={startY}
                              r="3.2"
                              fill="#0B101D"
                              stroke={theme.highlightHex}
                              strokeWidth="2"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                Caricamento guida tratti...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
