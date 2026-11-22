import type {KanaItem} from '../types/japanese';

export const KATAKANA_ROWS_BASE: Array<{rowLabel: string; items: Array<KanaItem | null>}> = [
  {
    rowLabel: 'Vocali',
    items: [
      {char: 'ア', romaji: 'a', row: 'Vocali', col: 'a', variant: 'base'},
      {char: 'イ', romaji: 'i', row: 'Vocali', col: 'i', variant: 'base'},
      {char: 'ウ', romaji: 'u', row: 'Vocali', col: 'u', variant: 'base'},
      {char: 'エ', romaji: 'e', row: 'Vocali', col: 'e', variant: 'base'},
      {char: 'オ', romaji: 'o', row: 'Vocali', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'K',
    items: [
      {char: 'カ', romaji: 'ka', row: 'K', col: 'a', variant: 'base'},
      {char: 'キ', romaji: 'ki', row: 'K', col: 'i', variant: 'base'},
      {char: 'ク', romaji: 'ku', row: 'K', col: 'u', variant: 'base'},
      {char: 'ケ', romaji: 'ke', row: 'K', col: 'e', variant: 'base'},
      {char: 'コ', romaji: 'ko', row: 'K', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'S',
    items: [
      {char: 'サ', romaji: 'sa', row: 'S', col: 'a', variant: 'base'},
      {char: 'シ', romaji: 'shi', row: 'S', col: 'i', variant: 'base', note: 'Attenzione a non confonderlo con ツ: tratti dal basso verso l’alto'},
      {char: 'ス', romaji: 'su', row: 'S', col: 'u', variant: 'base'},
      {char: 'セ', romaji: 'se', row: 'S', col: 'e', variant: 'base'},
      {char: 'ソ', romaji: 'so', row: 'S', col: 'o', variant: 'base', note: 'Attenzione a non confonderlo con ン: secondo tratto scende dall’alto'},
    ],
  },
  {
    rowLabel: 'T',
    items: [
      {char: 'タ', romaji: 'ta', row: 'T', col: 'a', variant: 'base'},
      {char: 'チ', romaji: 'chi', row: 'T', col: 'i', variant: 'base'},
      {char: 'ツ', romaji: 'tsu', row: 'T', col: 'u', variant: 'base', note: 'I primi due trattini sono più verticali e scendono dall’alto'},
      {char: 'テ', romaji: 'te', row: 'T', col: 'e', variant: 'base'},
      {char: 'ト', romaji: 'to', row: 'T', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'N',
    items: [
      {char: 'ナ', romaji: 'na', row: 'N', col: 'a', variant: 'base'},
      {char: 'ニ', romaji: 'ni', row: 'N', col: 'i', variant: 'base'},
      {char: 'ヌ', romaji: 'nu', row: 'N', col: 'u', variant: 'base'},
      {char: 'ネ', romaji: 'ne', row: 'N', col: 'e', variant: 'base'},
      {char: 'ノ', romaji: 'no', row: 'N', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'H',
    items: [
      {char: 'ハ', romaji: 'ha', row: 'H', col: 'a', variant: 'base'},
      {char: 'ヒ', romaji: 'hi', row: 'H', col: 'i', variant: 'base'},
      {char: 'フ', romaji: 'fu', row: 'H', col: 'u', variant: 'base'},
      {char: 'ヘ', romaji: 'he', row: 'H', col: 'e', variant: 'base'},
      {char: 'ホ', romaji: 'ho', row: 'H', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'M',
    items: [
      {char: 'マ', romaji: 'ma', row: 'M', col: 'a', variant: 'base'},
      {char: 'ミ', romaji: 'mi', row: 'M', col: 'i', variant: 'base'},
      {char: 'ム', romaji: 'mu', row: 'M', col: 'u', variant: 'base'},
      {char: 'メ', romaji: 'me', row: 'M', col: 'e', variant: 'base'},
      {char: 'モ', romaji: 'mo', row: 'M', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'Y',
    items: [
      {char: 'ヤ', romaji: 'ya', row: 'Y', col: 'a', variant: 'base'},
      null,
      {char: 'ユ', romaji: 'yu', row: 'Y', col: 'u', variant: 'base'},
      null,
      {char: 'ヨ', romaji: 'yo', row: 'Y', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'R',
    items: [
      {char: 'ラ', romaji: 'ra', row: 'R', col: 'a', variant: 'base'},
      {char: 'リ', romaji: 'ri', row: 'R', col: 'i', variant: 'base'},
      {char: 'ル', romaji: 'ru', row: 'R', col: 'u', variant: 'base'},
      {char: 'レ', romaji: 're', row: 'R', col: 'e', variant: 'base'},
      {char: 'ロ', romaji: 'ro', row: 'R', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'W / N',
    items: [
      {char: 'ワ', romaji: 'wa', row: 'W / N', col: 'a', variant: 'base'},
      null,
      {char: 'ン', romaji: 'n', row: 'W / N', col: 'u', variant: 'base', note: 'Secondo tratto parte dal basso verso l’alto'},
      null,
      {char: 'ヲ', romaji: 'wo', row: 'W / N', col: 'o', variant: 'base'},
    ],
  },
];

export const KATAKANA_ROWS_DAKUTEN: Array<{rowLabel: string; items: Array<KanaItem | null>}> = [
  {
    rowLabel: 'G',
    items: [
      {char: 'ガ', romaji: 'ga', row: 'G', col: 'a', variant: 'dakuten'},
      {char: 'ギ', romaji: 'gi', row: 'G', col: 'i', variant: 'dakuten'},
      {char: 'グ', romaji: 'gu', row: 'G', col: 'u', variant: 'dakuten'},
      {char: 'ゲ', romaji: 'ge', row: 'G', col: 'e', variant: 'dakuten'},
      {char: 'ゴ', romaji: 'go', row: 'G', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'Z',
    items: [
      {char: 'ザ', romaji: 'za', row: 'Z', col: 'a', variant: 'dakuten'},
      {char: 'ジ', romaji: 'ji', row: 'Z', col: 'i', variant: 'dakuten'},
      {char: 'ズ', romaji: 'zu', row: 'Z', col: 'u', variant: 'dakuten'},
      {char: 'ゼ', romaji: 'ze', row: 'Z', col: 'e', variant: 'dakuten'},
      {char: 'ゾ', romaji: 'zo', row: 'Z', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'D',
    items: [
      {char: 'ダ', romaji: 'da', row: 'D', col: 'a', variant: 'dakuten'},
      {char: 'ヂ', romaji: 'ji (di)', row: 'D', col: 'i', variant: 'dakuten'},
      {char: 'ヅ', romaji: 'zu (du)', row: 'D', col: 'u', variant: 'dakuten'},
      {char: 'デ', romaji: 'de', row: 'D', col: 'e', variant: 'dakuten'},
      {char: 'ド', romaji: 'do', row: 'D', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'B',
    items: [
      {char: 'バ', romaji: 'ba', row: 'B', col: 'a', variant: 'dakuten'},
      {char: 'ビ', romaji: 'bi', row: 'B', col: 'i', variant: 'dakuten'},
      {char: 'ブ', romaji: 'bu', row: 'B', col: 'u', variant: 'dakuten'},
      {char: 'ベ', romaji: 'be', row: 'B', col: 'e', variant: 'dakuten'},
      {char: 'ボ', romaji: 'bo', row: 'B', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'P',
    items: [
      {char: 'パ', romaji: 'pa', row: 'P', col: 'a', variant: 'dakuten'},
      {char: 'ピ', romaji: 'pi', row: 'P', col: 'i', variant: 'dakuten'},
      {char: 'プ', romaji: 'pu', row: 'P', col: 'u', variant: 'dakuten'},
      {char: 'ペ', romaji: 'pe', row: 'P', col: 'e', variant: 'dakuten'},
      {char: 'ポ', romaji: 'po', row: 'P', col: 'o', variant: 'dakuten'},
    ],
  },
];

export const ALL_KATAKANA: KanaItem[] = [
  ...KATAKANA_ROWS_BASE.flatMap((r) => r.items.filter((x): x is KanaItem => x !== null)),
  ...KATAKANA_ROWS_DAKUTEN.flatMap((r) => r.items.filter((x): x is KanaItem => x !== null)),
];
