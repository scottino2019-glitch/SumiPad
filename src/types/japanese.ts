export type StudyAreaId = 'hiragana' | 'katakana' | 'kanji' | 'words' | 'personal';

export type PracticeMode = 'animate' | 'quiz' | 'freehand';

export interface KanaItem {
  char: string;
  romaji: string;
  row: string;
  col: 'a' | 'i' | 'u' | 'e' | 'o';
  variant: 'base' | 'dakuten';
  note?: string;
}

export type KanjiCategory =
  | 'Numeri'
  | 'Natura'
  | 'Tempo'
  | 'Persone'
  | 'Azioni'
  | 'Luoghi';

export interface KanjiItem {
  char: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
  category: KanjiCategory;
  strokes: number;
  jlpt: 'N5' | 'N4';
  example: {
    word: string;
    reading: string;
    meaning: string;
  };
}

export type WordCategory =
  | 'Saluti'
  | 'Quotidiano'
  | 'Cibo'
  | 'Viaggio'
  | 'Natura'
  | 'Personale';

export interface WordItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  category: WordCategory;
  scriptType: 'hiragana' | 'katakana' | 'kanji' | 'misto';
  isCustom?: boolean;
  createdAt?: number;
}

export interface CharacterStrokeData {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
}

export interface ActiveSelection {
  type: 'kana' | 'kanji' | 'word';
  title: string;
  subtitle: string;
  detail?: string;
  characters: string[];
  activeCharIndex: number;
  wordItem?: WordItem;
  kanjiItem?: KanjiItem;
  kanaItem?: KanaItem;
}

export interface AreaTheme {
  id: StudyAreaId;
  indexLabel: string;
  label: string;
  japaneseLabel: string;
  tagline: string;
  accentText: string;
  accentBg: string;
  accentSurface: string;
  accentBorder: string;
  accentRing: string;
  accentHex: string;
  highlightHex: string;
}
