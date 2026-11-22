import {useCallback, useEffect, useMemo, useState} from 'react';
import {AddWordModal} from './components/AddWordModal';
import {AreaSelectorPanel} from './components/AreaSelectorPanel';
import {OfflineIndicator} from './components/PWAControls';
import {ScriptPadStudio} from './components/ScriptPadStudio';
import {TopBar} from './components/TopBar';
import {COMMON_WORDS, DEFAULT_CUSTOM_WORDS} from './data/commonWords';
import {ALL_HIRAGANA} from './data/hiragana';
import {CORE_KANJI} from './data/kanji';
import {ALL_KATAKANA} from './data/katakana';
import {AREA_ORDER, AREA_THEMES} from './data/themes';
import type {
  ActiveSelection,
  KanaItem,
  KanjiItem,
  StudyAreaId,
  WordItem,
} from './types/japanese';
import {splitWritableCharacters} from './utils/charData';

const STORAGE_PERSONAL_KEY = 'sumipad_personal_words_v1';
const STORAGE_MASTERED_KEY = 'sumipad_mastered_chars_v1';

function loadPersonalWords(): WordItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_PERSONAL_KEY);
    if (!raw) return DEFAULT_CUSTOM_WORDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CUSTOM_WORDS;
  } catch {
    return DEFAULT_CUSTOM_WORDS;
  }
}

function loadMasteredChars(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_MASTERED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function makeKanaSelection(item: KanaItem): ActiveSelection {
  return {
    type: 'kana',
    title: item.char,
    subtitle: item.romaji,
    detail: `${item.variant === 'base' ? 'Sillabario Base' : 'Dakuten / Handakuten'} · Riga ${item.row}`,
    characters: [item.char],
    activeCharIndex: 0,
    kanaItem: item,
  };
}

function makeKanjiSelection(item: KanjiItem): ActiveSelection {
  return {
    type: 'kanji',
    title: item.char,
    subtitle: item.meaning,
    detail: `Categoria ${item.category} · JLPT ${item.jlpt}`,
    characters: [item.char],
    activeCharIndex: 0,
    kanjiItem: item,
  };
}

function makeWordSelection(item: WordItem): ActiveSelection {
  const chars = splitWritableCharacters(item.word);
  return {
    type: 'word',
    title: item.word,
    subtitle: `${item.reading} (${item.romaji})`,
    detail: `${item.meaning} · ${item.category}`,
    characters: chars.length > 0 ? chars : [item.word],
    activeCharIndex: 0,
    wordItem: item,
  };
}

export default function App() {
  const [activeArea, setActiveArea] = useState<StudyAreaId>('hiragana');
  const [personalWords, setPersonalWords] = useState<WordItem[]>(loadPersonalWords);
  const [masteredChars, setMasteredChars] = useState<Set<string>>(loadMasteredChars);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectionByArea, setSelectionByArea] = useState<Record<StudyAreaId, ActiveSelection>>(() => ({
    hiragana: makeKanaSelection(ALL_HIRAGANA[0]),
    katakana: makeKanaSelection(ALL_KATAKANA[0]),
    kanji: makeKanjiSelection(CORE_KANJI[0]),
    words: makeWordSelection(COMMON_WORDS[0]),
    personal: makeWordSelection(loadPersonalWords()[0] || COMMON_WORDS[0]),
  }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PERSONAL_KEY, JSON.stringify(personalWords));
    } catch {
      // ignore storage quota errors
    }
  }, [personalWords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MASTERED_KEY, JSON.stringify(Array.from(masteredChars)));
    } catch {
      // ignore storage quota errors
    }
  }, [masteredChars]);

  const activeSelection = selectionByArea[activeArea];

  const handleSelectKana = useCallback(
    (item: KanaItem) => {
      const area: StudyAreaId = activeArea === 'katakana' ? 'katakana' : 'hiragana';
      setSelectionByArea((prev) => ({
        ...prev,
        [area]: makeKanaSelection(item),
      }));
    },
    [activeArea],
  );

  const handleSelectKanji = useCallback((item: KanjiItem) => {
    setSelectionByArea((prev) => ({
      ...prev,
      kanji: makeKanjiSelection(item),
    }));
  }, []);

  const handleSelectWord = useCallback(
    (item: WordItem) => {
      const targetArea: StudyAreaId = activeArea === 'personal' ? 'personal' : 'words';
      setSelectionByArea((prev) => ({
        ...prev,
        [targetArea]: makeWordSelection(item),
      }));
    },
    [activeArea],
  );

  const handleSelectCharIndex = useCallback(
    (idx: number) => {
      setSelectionByArea((prev) => {
        const current = prev[activeArea];
        return {
          ...prev,
          [activeArea]: {
            ...current,
            activeCharIndex: idx,
          },
        };
      });
    },
    [activeArea],
  );

  const handleCharMastered = useCallback((char: string) => {
    setMasteredChars((prev) => {
      if (prev.has(char)) return prev;
      const next = new Set(prev);
      next.add(char);
      return next;
    });
  }, []);

  const handleAddWord = useCallback((newWord: WordItem) => {
    setPersonalWords((prev) => [newWord, ...prev]);
    setSelectionByArea((prev) => ({
      ...prev,
      personal: makeWordSelection(newWord),
    }));
    setActiveArea('personal');
  }, []);

  const handleToggleBookmarkWord = useCallback((word: WordItem) => {
    setPersonalWords((prev) => {
      const exists = prev.some((w) => w.word === word.word);
      if (exists) {
        return prev.filter((w) => w.word !== word.word);
      }
      const savedCopy: WordItem = {
        ...word,
        id: `saved-${word.id}-${Date.now()}`,
        isCustom: true,
        createdAt: Date.now(),
      };
      return [savedCopy, ...prev];
    });
  }, []);

  const handleDeletePersonalWord = useCallback((id: string) => {
    setPersonalWords((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      setSelectionByArea((selPrev) => {
        if (selPrev.personal.wordItem?.id !== id) return selPrev;
        const fallback = updated[0] || COMMON_WORDS[0];
        return {
          ...selPrev,
          personal: makeWordSelection(fallback),
        };
      });
      return updated;
    });
  }, []);

  const handleNextItem = useCallback(() => {
    if (activeArea === 'hiragana') {
      const curr = selectionByArea.hiragana.kanaItem?.char;
      const idx = ALL_HIRAGANA.findIndex((k) => k.char === curr);
      const next = ALL_HIRAGANA[(idx + 1) % ALL_HIRAGANA.length];
      handleSelectKana(next);
    } else if (activeArea === 'katakana') {
      const curr = selectionByArea.katakana.kanaItem?.char;
      const idx = ALL_KATAKANA.findIndex((k) => k.char === curr);
      const next = ALL_KATAKANA[(idx + 1) % ALL_KATAKANA.length];
      handleSelectKana(next);
    } else if (activeArea === 'kanji') {
      const curr = selectionByArea.kanji.kanjiItem?.char;
      const idx = CORE_KANJI.findIndex((k) => k.char === curr);
      const next = CORE_KANJI[(idx + 1) % CORE_KANJI.length];
      handleSelectKanji(next);
    } else if (activeArea === 'words') {
      const curr = selectionByArea.words.wordItem?.id;
      const idx = COMMON_WORDS.findIndex((w) => w.id === curr);
      const next = COMMON_WORDS[(idx + 1) % COMMON_WORDS.length];
      handleSelectWord(next);
    } else if (activeArea === 'personal' && personalWords.length > 0) {
      const curr = selectionByArea.personal.wordItem?.id;
      const idx = personalWords.findIndex((w) => w.id === curr);
      const next = personalWords[(idx + 1) % personalWords.length];
      handleSelectWord(next);
    }
  }, [
    activeArea,
    handleSelectKana,
    handleSelectKanji,
    handleSelectWord,
    personalWords,
    selectionByArea,
  ]);

  const areaStats = useMemo(() => {
    const hiraDone = ALL_HIRAGANA.filter((k) => masteredChars.has(k.char)).length;
    const kataDone = ALL_KATAKANA.filter((k) => masteredChars.has(k.char)).length;
    const kanjiDone = CORE_KANJI.filter((k) => masteredChars.has(k.char)).length;
    const wordsDone = COMMON_WORDS.filter((w) =>
      splitWritableCharacters(w.word).every((c) => masteredChars.has(c)),
    ).length;

    return {
      hiragana: `${hiraDone}/${ALL_HIRAGANA.length} caratteri`,
      katakana: `${kataDone}/${ALL_KATAKANA.length} caratteri`,
      kanji: `${kanjiDone}/${CORE_KANJI.length} kanji`,
      words: `${wordsDone}/${COMMON_WORDS.length} parole`,
      personal: `${personalWords.length} ${personalWords.length === 1 ? 'parola' : 'parole'}`,
    };
  }, [masteredChars, personalWords.length]);

  const activeTheme = AREA_THEMES[activeArea];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100">
      <TopBar
        activeArea={activeArea}
        onSelectArea={setActiveArea}
        onOpenAddWord={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bold, unmistakably separated Area Cards */}
        <section aria-label="Aree di studio" className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {AREA_ORDER.map((areaId) => {
              const theme = AREA_THEMES[areaId];
              const isActive = activeArea === areaId;
              return (
                <button
                  key={areaId}
                  type="button"
                  onClick={() => setActiveArea(areaId)}
                  className={`relative overflow-hidden text-left rounded-xl border-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isActive
                      ? `${theme.accentSurface} ${theme.accentBorder}`
                      : 'bg-[#111827] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`h-1.5 w-full ${theme.accentBg} ${
                      isActive ? 'opacity-100' : 'opacity-45'
                    }`}
                  />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400">
                        {theme.indexLabel}
                      </span>
                      <span
                        className={`text-sm font-jp font-semibold whitespace-nowrap shrink-0 ${theme.accentText}`}
                      >
                        {theme.japaneseLabel}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-semibold mt-1 whitespace-nowrap truncate ${
                        isActive ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {theme.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 tabular-nums">
                      {areaStats[areaId]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Distinct Active Area Workspace Container */}
        <div
          className={`rounded-2xl border-2 p-4 sm:p-5 transition-colors ${activeTheme.accentSurface} ${activeTheme.accentBorder}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <AreaSelectorPanel
                activeArea={activeArea}
                activeSelection={activeSelection}
                masteredChars={masteredChars}
                commonWords={COMMON_WORDS}
                personalWords={personalWords}
                onSelectKana={handleSelectKana}
                onSelectKanji={handleSelectKanji}
                onSelectWord={handleSelectWord}
                onToggleBookmarkWord={handleToggleBookmarkWord}
                onDeletePersonalWord={handleDeletePersonalWord}
                onOpenAddWord={() => setIsAddModalOpen(true)}
              />
            </div>

            <div className="lg:col-span-7">
              <ScriptPadStudio
                activeArea={activeArea}
                selection={activeSelection}
                masteredChars={masteredChars}
                personalWords={personalWords}
                onSelectCharIndex={handleSelectCharIndex}
                onCharMastered={handleCharMastered}
                onToggleBookmarkWord={handleToggleBookmarkWord}
                onNextItem={handleNextItem}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-[#0F172A] mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <span>
            SumiPad · Studio interattivo di Hiragana, Katakana, Kanji e vocabolario personale
          </span>
          <button
            type="button"
            onClick={() => setMasteredChars(new Set())}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Azzera progressi completati
          </button>
        </div>
      </footer>

      <OfflineIndicator />

      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWord={handleAddWord}
      />
    </div>
  );
}
