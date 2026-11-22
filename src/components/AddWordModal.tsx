import {AlertCircle, Check, Plus, X} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {isJapanese, toHiragana, toKatakana, toRomaji} from 'wanakana';
import type {WordCategory, WordItem} from '../types/japanese';
import {
  checkCharacterSupport,
  detectScriptType,
  splitWritableCharacters,
} from '../utils/charData';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: WordItem) => void;
}

const CATEGORIES: WordCategory[] = [
  'Personale',
  'Saluti',
  'Quotidiano',
  'Cibo',
  'Viaggio',
  'Natura',
];

export function AddWordModal({isOpen, onClose, onAddWord}: AddWordModalProps) {
  const [wordInput, setWordInput] = useState('');
  const [readingInput, setReadingInput] = useState('');
  const [romajiInput, setRomajiInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  const [category, setCategory] = useState<WordCategory>('Personale');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [charSupportMap, setCharSupportMap] = useState<Record<string, boolean>>({});
  const [isCheckingChars, setIsCheckingChars] = useState(false);

  const characters = useMemo(() => splitWritableCharacters(wordInput), [wordInput]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    if (characters.length === 0) {
      setCharSupportMap({});
      return;
    }

    setIsCheckingChars(true);
    Promise.all(
      characters.map(async (ch) => {
        const ok = await checkCharacterSupport(ch);
        return [ch, ok] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const [ch, ok] of entries) {
          map[ch] = ok;
        }
        setCharSupportMap(map);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingChars(false);
      });

    return () => {
      cancelled = true;
    };
  }, [characters, isOpen]);

  if (!isOpen) return null;

  const handleWordChange = (val: string) => {
    setWordInput(val);
    setErrorMsg(null);
    const trimmed = val.trim();
    if (trimmed && isJapanese(trimmed)) {
      const autoRomaji = toRomaji(trimmed);
      if (!romajiInput || romajiInput === toRomaji(wordInput.trim())) {
        setRomajiInput(autoRomaji);
      }
      if (!readingInput || readingInput === wordInput.trim()) {
        setReadingInput(toHiragana(trimmed, {passRomaji: true}));
      }
    }
  };

  const convertWordToHiragana = () => {
    if (!wordInput.trim()) return;
    const hira = toHiragana(wordInput.trim());
    setWordInput(hira);
    setReadingInput(hira);
    setRomajiInput(toRomaji(hira));
    setErrorMsg(null);
  };

  const convertWordToKatakana = () => {
    if (!wordInput.trim()) return;
    const kata = toKatakana(wordInput.trim());
    setWordInput(kata);
    setReadingInput(toHiragana(kata));
    setRomajiInput(toRomaji(kata));
    setErrorMsg(null);
  };

  const unsupportedChars = characters.filter((c) => charSupportMap[c] === false);
  const allSupported =
    characters.length > 0 &&
    !isCheckingChars &&
    characters.every((c) => charSupportMap[c] === true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWord = wordInput.trim();
    const cleanedMeaning = meaningInput.trim();

    if (!cleanedWord) {
      setErrorMsg('Inserisci la parola in giapponese (es. さくら, コーヒー o 日本語).');
      return;
    }
    if (characters.length === 0) {
      setErrorMsg('Inserisci almeno un carattere giapponese valido.');
      return;
    }
    if (unsupportedChars.length > 0) {
      setErrorMsg(
        `Caratteri non presenti nel dizionario tratti: ${unsupportedChars.join(', ')}. Usa Hiragana, Katakana o Kanji giapponesi.`,
      );
      return;
    }
    if (!cleanedMeaning) {
      setErrorMsg('Inserisci il significato in italiano per ricordarlo durante lo studio.');
      return;
    }

    const finalReading = readingInput.trim() || cleanedWord;
    const finalRomaji = romajiInput.trim() || toRomaji(finalReading);

    const newItem: WordItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      word: cleanedWord,
      reading: finalReading,
      romaji: finalRomaji,
      meaning: cleanedMeaning,
      category,
      scriptType: detectScriptType(cleanedWord),
      isCustom: true,
      createdAt: Date.now(),
    };

    onAddWord(newItem);
    setWordInput('');
    setReadingInput('');
    setRomajiInput('');
    setMeaningInput('');
    setCategory('Personale');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-word-title"
    >
      <div className="bg-[#111827] border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0F172A]">
          <div>
            <h2 id="add-word-title" className="text-lg font-semibold text-white">
              Aggiungi alla Lista Personale
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inserisci caratteri giapponesi o scrivi in romaji e converti in kana.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label htmlFor="word-jp-input" className="text-sm font-medium text-slate-200">
                Parola in Giapponese
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={convertWordToHiragana}
                  className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  Converti in ひらがな
                </button>
                <button
                  type="button"
                  onClick={convertWordToKatakana}
                  className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  Converti in カタカナ
                </button>
              </div>
            </div>
            <input
              id="word-jp-input"
              type="text"
              value={wordInput}
              onChange={(e) => handleWordChange(e.target.value)}
              placeholder="Es. 桜, さくら, コーヒー o scrivi 'sakura'"
              className="w-full px-3.5 py-2.5 text-base font-jp bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              autoFocus
            />

            {characters.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {characters.map((ch, idx) => {
                  const status = charSupportMap[ch];
                  return (
                    <span
                      key={`${ch}-${idx}`}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-jp border rounded-md ${
                        status === true
                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                          : status === false
                            ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{ch}</span>
                      {status === true && <Check className="w-3 h-3 text-emerald-400" />}
                      {status === false && <AlertCircle className="w-3 h-3 text-rose-400" />}
                    </span>
                  );
                })}
                <span className="text-xs text-slate-400">
                  {isCheckingChars
                    ? 'Verifica tratti in corso...'
                    : allSupported
                      ? `${characters.length} ${characters.length === 1 ? 'carattere pronto' : 'caratteri pronti'} per la scrittura animata`
                      : 'Alcuni caratteri non supportati'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="word-reading-input" className="block text-sm font-medium text-slate-200 mb-1.5">
                Lettura (Hiragana)
              </label>
              <input
                id="word-reading-input"
                type="text"
                value={readingInput}
                onChange={(e) => setReadingInput(e.target.value)}
                placeholder="Es. さくら"
                className="w-full px-3.5 py-2 text-sm font-jp bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="word-romaji-input" className="block text-sm font-medium text-slate-200 mb-1.5">
                Romaji
              </label>
              <input
                id="word-romaji-input"
                type="text"
                value={romajiInput}
                onChange={(e) => setRomajiInput(e.target.value)}
                placeholder="Es. sakura"
                className="w-full px-3.5 py-2 text-sm bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="word-meaning-input" className="block text-sm font-medium text-slate-200 mb-1.5">
                Significato in Italiano
              </label>
              <input
                id="word-meaning-input"
                type="text"
                value={meaningInput}
                onChange={(e) => {
                  setMeaningInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Es. Fiore di ciliegio"
                className="w-full px-3.5 py-2 text-sm bg-[#0B1120] text-white placeholder:text-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="word-category-select" className="block text-sm font-medium text-slate-200 mb-1.5">
                Categoria
              </label>
              <select
                id="word-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as WordCategory)}
                className="w-full px-3.5 py-2 text-sm bg-[#0B1120] text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 text-xs text-rose-200 bg-rose-950/60 border border-rose-700 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Salva Parola</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
