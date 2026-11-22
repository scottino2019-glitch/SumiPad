import {Bookmark, Check, Plus, Search, Trash2} from 'lucide-react';
import {useMemo, useState} from 'react';
import {HIRAGANA_ROWS_BASE, HIRAGANA_ROWS_DAKUTEN} from '../data/hiragana';
import {CORE_KANJI, KANJI_CATEGORIES} from '../data/kanji';
import {KATAKANA_ROWS_BASE, KATAKANA_ROWS_DAKUTEN} from '../data/katakana';
import {AREA_THEMES} from '../data/themes';
import type {
  ActiveSelection,
  KanaItem,
  KanjiCategory,
  KanjiItem,
  StudyAreaId,
  WordCategory,
  WordItem,
} from '../types/japanese';

interface AreaSelectorPanelProps {
  activeArea: StudyAreaId;
  activeSelection: ActiveSelection;
  masteredChars: Set<string>;
  commonWords: WordItem[];
  personalWords: WordItem[];
  onSelectKana: (item: KanaItem) => void;
  onSelectKanji: (item: KanjiItem) => void;
  onSelectWord: (item: WordItem) => void;
  onToggleBookmarkWord: (item: WordItem) => void;
  onDeletePersonalWord: (id: string) => void;
  onOpenAddWord: () => void;
}

const SCRIPT_LABELS: Record<WordItem['scriptType'], string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  misto: 'Misto',
};

const WORD_CATEGORIES: Array<'Tutte' | WordCategory> = [
  'Tutte',
  'Saluti',
  'Quotidiano',
  'Cibo',
  'Viaggio',
  'Natura',
];

export function AreaSelectorPanel({
  activeArea,
  activeSelection,
  masteredChars,
  commonWords,
  personalWords,
  onSelectKana,
  onSelectKanji,
  onSelectWord,
  onToggleBookmarkWord,
  onDeletePersonalWord,
  onOpenAddWord,
}: AreaSelectorPanelProps) {
  const theme = AREA_THEMES[activeArea];

  const [kanaVariant, setKanaVariant] = useState<'base' | 'dakuten'>('base');
  const [kanjiCategory, setKanjiCategory] = useState<'Tutti' | KanjiCategory>('Tutti');
  const [kanjiQuery, setKanjiQuery] = useState('');
  const [wordCategory, setWordCategory] = useState<'Tutte' | WordCategory>('Tutte');
  const [wordQuery, setWordQuery] = useState('');

  const personalWordIds = useMemo(
    () => new Set(personalWords.map((w) => w.word)),
    [personalWords],
  );

  const filteredKanji = useMemo(() => {
    const q = kanjiQuery.trim().toLowerCase();
    return CORE_KANJI.filter((item) => {
      if (kanjiCategory !== 'Tutti' && item.category !== kanjiCategory) return false;
      if (!q) return true;
      return (
        item.char.includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.onyomi.toLowerCase().includes(q) ||
        item.kunyomi.toLowerCase().includes(q)
      );
    });
  }, [kanjiCategory, kanjiQuery]);

  const filteredCommonWords = useMemo(() => {
    const q = wordQuery.trim().toLowerCase();
    return commonWords.filter((item) => {
      if (wordCategory !== 'Tutte' && item.category !== wordCategory) return false;
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.reading.toLowerCase().includes(q) ||
        item.romaji.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q)
      );
    });
  }, [commonWords, wordCategory, wordQuery]);

  const filteredPersonalWords = useMemo(() => {
    const q = wordQuery.trim().toLowerCase();
    return personalWords.filter((item) => {
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.reading.toLowerCase().includes(q) ||
        item.romaji.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q)
      );
    });
  }, [personalWords, wordQuery]);

  const renderKanaMatrix = (isKatakana: boolean) => {
    const rows = isKatakana
      ? kanaVariant === 'base'
        ? KATAKANA_ROWS_BASE
        : KATAKANA_ROWS_DAKUTEN
      : kanaVariant === 'base'
        ? HIRAGANA_ROWS_BASE
        : HIRAGANA_ROWS_DAKUTEN;

    const allInArea = rows.flatMap((r) => r.items.filter((x): x is KanaItem => x !== null));
    const practicedCount = allInArea.filter((k) => masteredChars.has(k.char)).length;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 bg-[#0B1120] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setKanaVariant('base')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                kanaVariant === 'base'
                  ? `${theme.accentBg} text-white`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Base (46)
            </button>
            <button
              type="button"
              onClick={() => setKanaVariant('dakuten')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                kanaVariant === 'dakuten'
                  ? `${theme.accentBg} text-white`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dakuten (25)
            </button>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {practicedCount} / {allInArea.length} completati
          </span>
        </div>

        <div className="grid grid-cols-[44px_repeat(5,minmax(0,1fr))] gap-1.5 text-center text-[11px] font-medium text-slate-500">
          <div />
          <div>a</div>
          <div>i</div>
          <div>u</div>
          <div>e</div>
          <div>o</div>
        </div>

        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              key={row.rowLabel}
              className="grid grid-cols-[44px_repeat(5,minmax(0,1fr))] gap-1.5 items-center"
            >
              <div className="text-[11px] font-medium text-slate-400 pr-1 text-right truncate">
                {row.rowLabel}
              </div>
              {row.items.map((item, idx) => {
                if (!item) {
                  return (
                    <div
                      key={`empty-${row.rowLabel}-${idx}`}
                      className="h-14 rounded-lg bg-[#0D1322]/60 border border-dashed border-slate-800"
                      aria-hidden="true"
                    />
                  );
                }
                const isSelected =
                  activeSelection.type === 'kana' &&
                  activeSelection.kanaItem?.char === item.char;
                const isMastered = masteredChars.has(item.char);

                return (
                  <button
                    key={item.char}
                    type="button"
                    onClick={() => onSelectKana(item)}
                    className={`relative h-14 rounded-lg border flex flex-col items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isSelected
                        ? `${theme.accentSurface} ${theme.accentBorder} ${theme.accentText}`
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 text-slate-100'
                    }`}
                  >
                    <span className="text-xl font-jp font-medium leading-none">
                      {item.char}
                    </span>
                    <span
                      className={`text-[11px] mt-1 leading-none ${
                        isSelected ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {item.romaji}
                    </span>
                    {isMastered && (
                      <Check
                        className="w-3 h-3 text-emerald-400 absolute top-1 right-1"
                        aria-label="Completato"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKanjiGrid = () => {
    const practicedCount = CORE_KANJI.filter((k) => masteredChars.has(k.char)).length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={kanjiQuery}
              onChange={(e) => setKanjiQuery(e.target.value)}
              placeholder="Cerca kanji, lettura o significato..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap shrink-0">
            {practicedCount} / {CORE_KANJI.length} completati
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {KANJI_CATEGORIES.map((cat) => {
            const active = kanjiCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setKanjiCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? `${theme.accentBg} text-white`
                    : 'bg-[#0B1120] text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {filteredKanji.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-700 rounded-xl">
            Nessun kanji trovato per "{kanjiQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[540px] overflow-y-auto pr-1">
            {filteredKanji.map((item) => {
              const isSelected =
                activeSelection.type === 'kanji' &&
                activeSelection.kanjiItem?.char === item.char;
              const isMastered = masteredChars.has(item.char);

              return (
                <button
                  key={item.char}
                  type="button"
                  onClick={() => onSelectKanji(item)}
                  className={`relative p-2.5 rounded-lg border text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isSelected
                      ? `${theme.accentSurface} ${theme.accentBorder}`
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-2xl font-jp font-medium leading-none ${
                        isSelected ? theme.accentText : 'text-white'
                      }`}
                    >
                      {item.char}
                    </span>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {item.strokes}t
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-2 truncate">
                    {item.meaning}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.kunyomi !== '—' ? item.kunyomi : item.onyomi}
                  </div>
                  {isMastered && (
                    <Check
                      className="w-3.5 h-3.5 text-emerald-400 absolute bottom-2 right-2"
                      aria-label="Completato"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderWordsList = (isPersonal: boolean) => {
    const items = isPersonal ? filteredPersonalWords : filteredCommonWords;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={wordQuery}
              onChange={(e) => setWordQuery(e.target.value)}
              placeholder="Cerca parola, romaji o italiano..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {isPersonal && (
            <button
              type="button"
              onClick={onOpenAddWord}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${theme.accentBg} hover:opacity-90`}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nuova</span>
            </button>
          )}
        </div>

        {!isPersonal && (
          <div className="flex flex-wrap gap-1.5">
            {WORD_CATEGORIES.map((cat) => {
              const active = wordCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setWordCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? `${theme.accentBg} text-white`
                      : 'bg-[#0B1120] text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-10 px-4 text-center border border-dashed border-slate-700 rounded-xl space-y-3">
            <p className="text-sm text-slate-400">
              {isPersonal
                ? 'La tua lista personale è vuota o nessun termine corrisponde alla ricerca.'
                : 'Nessuna parola trovata per i filtri selezionati.'}
            </p>
            {isPersonal && (
              <button
                type="button"
                onClick={onOpenAddWord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi la prima parola</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected =
                activeSelection.type === 'word' &&
                activeSelection.wordItem?.id === item.id;
              const chars = Array.from(item.word);
              const allCharsMastered =
                chars.length > 0 && chars.every((c) => masteredChars.has(c));
              const isSavedInPersonal = personalWordIds.has(item.word);

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? `${theme.accentSurface} ${theme.accentBorder}`
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectWord(item)}
                    className="flex-1 text-left min-w-0 cursor-pointer focus-visible:outline-none"
                  >
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span
                        className={`text-xl font-jp font-semibold ${
                          isSelected ? theme.accentText : 'text-white'
                        }`}
                      >
                        {item.word}
                      </span>
                      <span className="text-xs font-jp text-slate-400">
                        {item.reading}
                      </span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {item.romaji}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="text-slate-200 font-medium truncate">
                        {item.meaning}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{SCRIPT_LABELS[item.scriptType]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{chars.length} car.</span>
                      {allCharsMastered && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-medium inline-flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Completata
                          </span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {isPersonal ? (
                      <button
                        type="button"
                        onClick={() => onDeletePersonalWord(item.id)}
                        aria-label={`Rimuovi ${item.word} dalla lista personale`}
                        title="Rimuovi dalla lista"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleBookmarkWord(item)}
                        aria-label={
                          isSavedInPersonal
                            ? `${item.word} già salvata nella lista personale`
                            : `Salva ${item.word} nella lista personale`
                        }
                        title={
                          isSavedInPersonal
                            ? 'Salvata nella Lista Personale'
                            : 'Salva nella Lista Personale'
                        }
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isSavedInPersonal
                            ? 'text-violet-300 bg-violet-950/70'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark
                          className="w-4 h-4"
                          fill={isSavedInPersonal ? 'currentColor' : 'none'}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      aria-label={`Selettore ${theme.label}`}
      className="bg-[#131B2E] border border-slate-800 rounded-xl overflow-hidden flex flex-col"
    >
      {/* Saturated Area Header Band */}
      <div className="px-5 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold text-white rounded ${theme.accentBg}`}
            >
              {theme.indexLabel}
            </span>
            <h2 className="text-base font-semibold text-white truncate">
              {theme.label}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">{theme.tagline}</p>
        </div>
        <span className={`text-lg font-jp font-semibold shrink-0 ${theme.accentText}`}>
          {theme.japaneseLabel}
        </span>
      </div>

      <div className="p-5">{activeArea === 'hiragana' && renderKanaMatrix(false)}
        {activeArea === 'katakana' && renderKanaMatrix(true)}
        {activeArea === 'kanji' && renderKanjiGrid()}
        {activeArea === 'words' && renderWordsList(false)}
        {activeArea === 'personal' && renderWordsList(true)}
      </div>
    </section>
  );
}
