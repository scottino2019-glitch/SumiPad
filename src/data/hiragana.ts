import type {KanaItem} from '../types/japanese';

export const HIRAGANA_ROWS_BASE: Array<{rowLabel: string; items: Array<KanaItem | null>}> = [
  {
    rowLabel: 'Vocali',
    items: [
      {char: 'あ', romaji: 'a', row: 'Vocali', col: 'a', variant: 'base', note: 'Suono aperto come in "casa"'},
      {char: 'い', romaji: 'i', row: 'Vocali', col: 'i', variant: 'base', note: 'Suono chiuso come in "vino"'},
      {char: 'う', romaji: 'u', row: 'Vocali', col: 'u', variant: 'base', note: 'Labbra rilassate, meno arrotondate rispetto all’italiano'},
      {char: 'え', romaji: 'e', row: 'Vocali', col: 'e', variant: 'base', note: 'Suono come in "pera"'},
      {char: 'お', romaji: 'o', row: 'Vocali', col: 'o', variant: 'base', note: 'Suono come in "sole"'},
    ],
  },
  {
    rowLabel: 'K',
    items: [
      {char: 'か', romaji: 'ka', row: 'K', col: 'a', variant: 'base'},
      {char: 'き', romaji: 'ki', row: 'K', col: 'i', variant: 'base'},
      {char: 'く', romaji: 'ku', row: 'K', col: 'u', variant: 'base'},
      {char: 'け', romaji: 'ke', row: 'K', col: 'e', variant: 'base'},
      {char: 'こ', romaji: 'ko', row: 'K', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'S',
    items: [
      {char: 'さ', romaji: 'sa', row: 'S', col: 'a', variant: 'base'},
      {char: 'し', romaji: 'shi', row: 'S', col: 'i', variant: 'base', note: 'Si pronuncia "sci" come in "scienza"'},
      {char: 'す', romaji: 'su', row: 'S', col: 'u', variant: 'base'},
      {char: 'せ', romaji: 'se', row: 'S', col: 'e', variant: 'base'},
      {char: 'そ', romaji: 'so', row: 'S', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'T',
    items: [
      {char: 'た', romaji: 'ta', row: 'T', col: 'a', variant: 'base'},
      {char: 'ち', romaji: 'chi', row: 'T', col: 'i', variant: 'base', note: 'Si pronuncia "ci" come in "ciao"'},
      {char: 'つ', romaji: 'tsu', row: 'T', col: 'u', variant: 'base', note: 'Suono "z" aspra come in "pizza" + u'},
      {char: 'て', romaji: 'te', row: 'T', col: 'e', variant: 'base'},
      {char: 'と', romaji: 'to', row: 'T', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'N',
    items: [
      {char: 'な', romaji: 'na', row: 'N', col: 'a', variant: 'base'},
      {char: 'に', romaji: 'ni', row: 'N', col: 'i', variant: 'base'},
      {char: 'ぬ', romaji: 'nu', row: 'N', col: 'u', variant: 'base'},
      {char: 'ね', romaji: 'ne', row: 'N', col: 'e', variant: 'base'},
      {char: 'の', romaji: 'no', row: 'N', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'H',
    items: [
      {char: 'は', romaji: 'ha', row: 'H', col: 'a', variant: 'base', note: 'H aspirata; come particella si legge "wa"'},
      {char: 'ひ', romaji: 'hi', row: 'H', col: 'i', variant: 'base'},
      {char: 'ふ', romaji: 'fu', row: 'H', col: 'u', variant: 'base', note: 'Soffio leggero tra le labbra, tra "fu" e "hu"'},
      {char: 'へ', romaji: 'he', row: 'H', col: 'e', variant: 'base', note: 'Come particella di direzione si legge "e"'},
      {char: 'ほ', romaji: 'ho', row: 'H', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'M',
    items: [
      {char: 'ま', romaji: 'ma', row: 'M', col: 'a', variant: 'base'},
      {char: 'み', romaji: 'mi', row: 'M', col: 'i', variant: 'base'},
      {char: 'む', romaji: 'mu', row: 'M', col: 'u', variant: 'base'},
      {char: 'め', romaji: 'me', row: 'M', col: 'e', variant: 'base'},
      {char: 'も', romaji: 'mo', row: 'M', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'Y',
    items: [
      {char: 'や', romaji: 'ya', row: 'Y', col: 'a', variant: 'base'},
      null,
      {char: 'ゆ', romaji: 'yu', row: 'Y', col: 'u', variant: 'base'},
      null,
      {char: 'よ', romaji: 'yo', row: 'Y', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'R',
    items: [
      {char: 'ら', romaji: 'ra', row: 'R', col: 'a', variant: 'base', note: 'R dolce giapponese, tocco singolo dietro i denti'},
      {char: 'り', romaji: 'ri', row: 'R', col: 'i', variant: 'base'},
      {char: 'る', romaji: 'ru', row: 'R', col: 'u', variant: 'base'},
      {char: 'れ', romaji: 're', row: 'R', col: 'e', variant: 'base'},
      {char: 'ろ', romaji: 'ro', row: 'R', col: 'o', variant: 'base'},
    ],
  },
  {
    rowLabel: 'W / N',
    items: [
      {char: 'わ', romaji: 'wa', row: 'W / N', col: 'a', variant: 'base'},
      null,
      {char: 'ん', romaji: 'n', row: 'W / N', col: 'u', variant: 'base', note: 'Unica consonante isolata (nasale finale)'},
      null,
      {char: 'を', romaji: 'wo', row: 'W / N', col: 'o', variant: 'base', note: 'Usata solo come particella oggetto, letta "o"'},
    ],
  },
];

export const HIRAGANA_ROWS_DAKUTEN: Array<{rowLabel: string; items: Array<KanaItem | null>}> = [
  {
    rowLabel: 'G',
    items: [
      {char: 'が', romaji: 'ga', row: 'G', col: 'a', variant: 'dakuten'},
      {char: 'ぎ', romaji: 'gi', row: 'G', col: 'i', variant: 'dakuten', note: 'G dura come in "ghiro"'},
      {char: 'ぐ', romaji: 'gu', row: 'G', col: 'u', variant: 'dakuten'},
      {char: 'げ', romaji: 'ge', row: 'G', col: 'e', variant: 'dakuten', note: 'G dura come in "ghepardo"'},
      {char: 'ご', romaji: 'go', row: 'G', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'Z',
    items: [
      {char: 'ざ', romaji: 'za', row: 'Z', col: 'a', variant: 'dakuten'},
      {char: 'じ', romaji: 'ji', row: 'Z', col: 'i', variant: 'dakuten', note: 'Si pronuncia "gi" come in "giro"'},
      {char: 'ず', romaji: 'zu', row: 'Z', col: 'u', variant: 'dakuten'},
      {char: 'ぜ', romaji: 'ze', row: 'Z', col: 'e', variant: 'dakuten'},
      {char: 'ぞ', romaji: 'zo', row: 'Z', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'D',
    items: [
      {char: 'だ', romaji: 'da', row: 'D', col: 'a', variant: 'dakuten'},
      {char: 'ぢ', romaji: 'ji (di)', row: 'D', col: 'i', variant: 'dakuten'},
      {char: 'づ', romaji: 'zu (du)', row: 'D', col: 'u', variant: 'dakuten'},
      {char: 'で', romaji: 'de', row: 'D', col: 'e', variant: 'dakuten'},
      {char: 'ど', romaji: 'do', row: 'D', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'B',
    items: [
      {char: 'ば', romaji: 'ba', row: 'B', col: 'a', variant: 'dakuten'},
      {char: 'び', romaji: 'bi', row: 'B', col: 'i', variant: 'dakuten'},
      {char: 'ぶ', romaji: 'bu', row: 'B', col: 'u', variant: 'dakuten'},
      {char: 'べ', romaji: 'be', row: 'B', col: 'e', variant: 'dakuten'},
      {char: 'ぼ', romaji: 'bo', row: 'B', col: 'o', variant: 'dakuten'},
    ],
  },
  {
    rowLabel: 'P',
    items: [
      {char: 'ぱ', romaji: 'pa', row: 'P', col: 'a', variant: 'dakuten'},
      {char: 'ぴ', romaji: 'pi', row: 'P', col: 'i', variant: 'dakuten'},
      {char: 'ぷ', romaji: 'pu', row: 'P', col: 'u', variant: 'dakuten'},
      {char: 'ぺ', romaji: 'pe', row: 'P', col: 'e', variant: 'dakuten'},
      {char: 'ぽ', romaji: 'po', row: 'P', col: 'o', variant: 'dakuten'},
    ],
  },
];

export const ALL_HIRAGANA: KanaItem[] = [
  ...HIRAGANA_ROWS_BASE.flatMap((r) => r.items.filter((x): x is KanaItem => x !== null)),
  ...HIRAGANA_ROWS_DAKUTEN.flatMap((r) => r.items.filter((x): x is KanaItem => x !== null)),
];
