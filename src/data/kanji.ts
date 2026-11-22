import type {KanjiItem} from '../types/japanese';

export const CORE_KANJI: KanjiItem[] = [
  // Numeri
  {char: '一', onyomi: 'イチ・イツ', kunyomi: 'ひと(つ)', meaning: 'Uno', category: 'Numeri', strokes: 1, jlpt: 'N5', example: {word: '一つ', reading: 'ひとつ', meaning: 'una cosa'}},
  {char: '二', onyomi: 'ニ', kunyomi: 'ふた(つ)', meaning: 'Due', category: 'Numeri', strokes: 2, jlpt: 'N5', example: {word: '二月', reading: 'にがつ', meaning: 'febbraio'}},
  {char: '三', onyomi: 'サン', kunyomi: 'みっ(つ)', meaning: 'Tre', category: 'Numeri', strokes: 3, jlpt: 'N5', example: {word: '三日', reading: 'みっか', meaning: '3 giorni / giorno 3'}},
  {char: '四', onyomi: 'シ', kunyomi: 'よん・よっ(つ)', meaning: 'Quattro', category: 'Numeri', strokes: 5, jlpt: 'N5', example: {word: '四月', reading: 'しがつ', meaning: 'aprile'}},
  {char: '五', onyomi: 'ゴ', kunyomi: 'いつ(つ)', meaning: 'Cinque', category: 'Numeri', strokes: 4, jlpt: 'N5', example: {word: '五分', reading: 'ごふん', meaning: '5 minuti'}},
  {char: '六', onyomi: 'ロク', kunyomi: 'むっ(つ)', meaning: 'Sei', category: 'Numeri', strokes: 4, jlpt: 'N5', example: {word: '六時', reading: 'ろくじ', meaning: 'le sei'}},
  {char: '七', onyomi: 'シチ', kunyomi: 'なな(つ)', meaning: 'Sette', category: 'Numeri', strokes: 2, jlpt: 'N5', example: {word: '七月', reading: 'しちがつ', meaning: 'luglio'}},
  {char: '八', onyomi: 'ハチ', kunyomi: 'やっ(つ)', meaning: 'Otto', category: 'Numeri', strokes: 2, jlpt: 'N5', example: {word: '八百屋', reading: 'やおや', meaning: 'fruttivendolo'}},
  {char: '九', onyomi: 'キュウ・ク', kunyomi: 'ここの(つ)', meaning: 'Nove', category: 'Numeri', strokes: 2, jlpt: 'N5', example: {word: '九月', reading: 'くがつ', meaning: 'settembre'}},
  {char: '十', onyomi: 'ジュウ', kunyomi: 'とお', meaning: 'Dieci', category: 'Numeri', strokes: 2, jlpt: 'N5', example: {word: '十円', reading: 'じゅうえん', meaning: '10 yen'}},
  {char: '百', onyomi: 'ヒャク', kunyomi: '—', meaning: 'Cento', category: 'Numeri', strokes: 6, jlpt: 'N5', example: {word: '三百', reading: 'さんびゃく', meaning: 'trecento'}},
  {char: '千', onyomi: 'セン', kunyomi: 'ち', meaning: 'Mille', category: 'Numeri', strokes: 3, jlpt: 'N5', example: {word: '千円', reading: 'せんえん', meaning: '1000 yen'}},

  // Natura
  {char: '山', onyomi: 'サン', kunyomi: 'やま', meaning: 'Montagna', category: 'Natura', strokes: 3, jlpt: 'N5', example: {word: '富士山', reading: 'ふじさん', meaning: 'Monte Fuji'}},
  {char: '川', onyomi: 'セン', kunyomi: 'かわ', meaning: 'Fiume', category: 'Natura', strokes: 3, jlpt: 'N5', example: {word: '川口', reading: 'かわぐち', meaning: 'foce del fiume'}},
  {char: '木', onyomi: 'モク・ボク', kunyomi: 'き', meaning: 'Albero / Legno', category: 'Natura', strokes: 4, jlpt: 'N5', example: {word: '木曜日', reading: 'もくようび', meaning: 'giovedì'}},
  {char: '火', onyomi: 'カ', kunyomi: 'ひ', meaning: 'Fuoco', category: 'Natura', strokes: 4, jlpt: 'N5', example: {word: '花火', reading: 'はなび', meaning: 'fuochi d’artificio'}},
  {char: '水', onyomi: 'スイ', kunyomi: 'みず', meaning: 'Acqua', category: 'Natura', strokes: 4, jlpt: 'N5', example: {word: '水曜日', reading: 'すいようび', meaning: 'mercoledì'}},
  {char: '土', onyomi: 'ド・ト', kunyomi: 'つち', meaning: 'Terra / Suolo', category: 'Natura', strokes: 3, jlpt: 'N5', example: {word: '土曜日', reading: 'どようび', meaning: 'sabato'}},
  {char: '金', onyomi: 'キン・コン', kunyomi: 'かね', meaning: 'Oro / Denaro', category: 'Natura', strokes: 8, jlpt: 'N5', example: {word: 'お金', reading: 'おかね', meaning: 'denaro'}},
  {char: '空', onyomi: 'クウ', kunyomi: 'そら・あ(く)', meaning: 'Cielo / Vuoto', category: 'Natura', strokes: 8, jlpt: 'N5', example: {word: '空港', reading: 'くうこう', meaning: 'aeroporto'}},
  {char: '雨', onyomi: 'ウ', kunyomi: 'あめ', meaning: 'Pioggia', category: 'Natura', strokes: 8, jlpt: 'N5', example: {word: '大雨', reading: 'おおあめ', meaning: 'pioggia forte'}},
  {char: '花', onyomi: 'カ', kunyomi: 'はな', meaning: 'Fiore', category: 'Natura', strokes: 7, jlpt: 'N5', example: {word: '花見', reading: 'はなみ', meaning: 'ammirare i fiori'}},
  {char: '桜', onyomi: 'オウ', kunyomi: 'さくら', meaning: 'Ciliegio in fiore', category: 'Natura', strokes: 10, jlpt: 'N4', example: {word: '桜色', reading: 'さくらいろ', meaning: 'rosa ciliegio'}},

  // Tempo
  {char: '日', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・か', meaning: 'Sole / Giorno', category: 'Tempo', strokes: 4, jlpt: 'N5', example: {word: '日本', reading: 'にほん', meaning: 'Giappone'}},
  {char: '月', onyomi: 'ゲツ・ガツ', kunyomi: 'つき', meaning: 'Luna / Mese', category: 'Tempo', strokes: 4, jlpt: 'N5', example: {word: '今月', reading: 'こんげつ', meaning: 'questo mese'}},
  {char: '年', onyomi: 'ネン', kunyomi: 'とし', meaning: 'Anno', category: 'Tempo', strokes: 6, jlpt: 'N5', example: {word: '今年', reading: 'ことし', meaning: 'quest’anno'}},
  {char: '今', onyomi: 'コン・キン', kunyomi: 'いま', meaning: 'Adesso / Ora', category: 'Tempo', strokes: 4, jlpt: 'N5', example: {word: '今日', reading: 'きょう', meaning: 'oggi'}},
  {char: '時', onyomi: 'ジ', kunyomi: 'とき', meaning: 'Ora / Tempo', category: 'Tempo', strokes: 10, jlpt: 'N5', example: {word: '時間', reading: 'じかん', meaning: 'tempo / durata'}},
  {char: '分', onyomi: 'フン・ブン', kunyomi: 'わ(かる)', meaning: 'Minuto / Capire', category: 'Tempo', strokes: 4, jlpt: 'N5', example: {word: '十分', reading: 'じゅっぷん', meaning: '10 minuti'}},
  {char: '先', onyomi: 'セン', kunyomi: 'さき', meaning: 'Prima / Precedente', category: 'Tempo', strokes: 6, jlpt: 'N5', example: {word: '先生', reading: 'せんせい', meaning: 'insegnante'}},
  {char: '週', onyomi: 'シュウ', kunyomi: '—', meaning: 'Settimana', category: 'Tempo', strokes: 11, jlpt: 'N5', example: {word: '来週', reading: 'らいしゅう', meaning: 'settimana prossima'}},

  // Persone
  {char: '人', onyomi: 'ジン・ニン', kunyomi: 'ひと', meaning: 'Persona', category: 'Persone', strokes: 2, jlpt: 'N5', example: {word: '日本人', reading: 'にほんじん', meaning: 'giapponese'}},
  {char: '私', onyomi: 'シ', kunyomi: 'わたし', meaning: 'Io / Privato', category: 'Persone', strokes: 7, jlpt: 'N4', example: {word: '私たち', reading: 'わたしたち', meaning: 'noi'}},
  {char: '友', onyomi: 'ユウ', kunyomi: 'とも', meaning: 'Amico', category: 'Persone', strokes: 4, jlpt: 'N5', example: {word: '友達', reading: 'ともだち', meaning: 'amico'}},
  {char: '子', onyomi: 'シ・ス', kunyomi: 'こ', meaning: 'Bambino / Figlio', category: 'Persone', strokes: 3, jlpt: 'N5', example: {word: '子ども', reading: 'こども', meaning: 'bambino'}},
  {char: '女', onyomi: 'ジョ・ニョ', kunyomi: 'おんな', meaning: 'Donna', category: 'Persone', strokes: 3, jlpt: 'N5', example: {word: '女性', reading: 'じょせい', meaning: 'donna'}},
  {char: '男', onyomi: 'ダン・ナン', kunyomi: 'おとこ', meaning: 'Uomo', category: 'Persone', strokes: 7, jlpt: 'N5', example: {word: '男の子', reading: 'おとこのこ', meaning: 'ragazzo'}},
  {char: '目', onyomi: 'モク', kunyomi: 'め', meaning: 'Occhio', category: 'Persone', strokes: 5, jlpt: 'N5', example: {word: '目的', reading: 'もくてき', meaning: 'obiettivo'}},
  {char: '口', onyomi: 'コウ・ク', kunyomi: 'くち', meaning: 'Bocca / Uscita', category: 'Persone', strokes: 3, jlpt: 'N5', example: {word: '入口', reading: 'いりぐち', meaning: 'entrata'}},
  {char: '手', onyomi: 'シュ', kunyomi: 'て', meaning: 'Mano', category: 'Persone', strokes: 4, jlpt: 'N5', example: {word: '手紙', reading: 'てがみ', meaning: 'lettera'}},
  {char: '心', onyomi: 'シン', kunyomi: 'こころ', meaning: 'Cuore / Mente', category: 'Persone', strokes: 4, jlpt: 'N4', example: {word: '安心', reading: 'あんしん', meaning: 'sollievo'}},

  // Azioni
  {char: '見', onyomi: 'ケン', kunyomi: 'み(る)', meaning: 'Vedere / Guardare', category: 'Azioni', strokes: 7, jlpt: 'N5', example: {word: '見る', reading: 'みる', meaning: 'guardare'}},
  {char: '行', onyomi: 'コウ・ギョウ', kunyomi: 'い(く)', meaning: 'Andare', category: 'Azioni', strokes: 6, jlpt: 'N5', example: {word: '行く', reading: 'いく', meaning: 'andare'}},
  {char: '来', onyomi: 'ライ', kunyomi: 'く(る)', meaning: 'Venire', category: 'Azioni', strokes: 7, jlpt: 'N5', example: {word: '来る', reading: 'くる', meaning: 'venire'}},
  {char: '食', onyomi: 'ショク', kunyomi: 'た(べる)', meaning: 'Mangiare / Cibo', category: 'Azioni', strokes: 9, jlpt: 'N5', example: {word: '食べる', reading: 'たべる', meaning: 'mangiare'}},
  {char: '飲', onyomi: 'イン', kunyomi: 'の(む)', meaning: 'Bere', category: 'Azioni', strokes: 12, jlpt: 'N5', example: {word: '飲む', reading: 'のむ', meaning: 'bere'}},
  {char: '書', onyomi: 'ショ', kunyomi: 'か(く)', meaning: 'Scrivere', category: 'Azioni', strokes: 10, jlpt: 'N5', example: {word: '書く', reading: 'かく', meaning: 'scrivere'}},
  {char: '読', onyomi: 'ドク', kunyomi: 'よ(む)', meaning: 'Leggere', category: 'Azioni', strokes: 14, jlpt: 'N5', example: {word: '読む', reading: 'よむ', meaning: 'leggere'}},
  {char: '話', onyomi: 'ワ', kunyomi: 'はな(す)', meaning: 'Parlare / Storia', category: 'Azioni', strokes: 13, jlpt: 'N5', example: {word: '話す', reading: 'はなす', meaning: 'parlare'}},
  {char: '聞', onyomi: 'ブン・モン', kunyomi: 'き(く)', meaning: 'Ascoltare / Chiedere', category: 'Azioni', strokes: 14, jlpt: 'N5', example: {word: '聞く', reading: 'きく', meaning: 'ascoltare'}},
  {char: '学', onyomi: 'ガク', kunyomi: 'まな(ぶ)', meaning: 'Studiare', category: 'Azioni', strokes: 8, jlpt: 'N5', example: {word: '学生', reading: 'がくせい', meaning: 'studente'}},
  {char: '好', onyomi: 'コウ', kunyomi: 'す(き)', meaning: 'Piacere / Amare', category: 'Azioni', strokes: 6, jlpt: 'N4', example: {word: '好き', reading: 'すき', meaning: 'piacere'}},

  // Luoghi
  {char: '上', onyomi: 'ジョウ', kunyomi: 'うえ', meaning: 'Sopra / Su', category: 'Luoghi', strokes: 3, jlpt: 'N5', example: {word: '上手', reading: 'じょうず', meaning: 'bravo / abile'}},
  {char: '下', onyomi: 'カ・ゲ', kunyomi: 'した', meaning: 'Sotto / Giù', category: 'Luoghi', strokes: 3, jlpt: 'N5', example: {word: '地下鉄', reading: 'ちかてつ', meaning: 'metropolitana'}},
  {char: '中', onyomi: 'チュウ', kunyomi: 'なか', meaning: 'Dentro / Centro', category: 'Luoghi', strokes: 4, jlpt: 'N5', example: {word: '中国', reading: 'ちゅうごく', meaning: 'Cina'}},
  {char: '大', onyomi: 'ダイ・タイ', kunyomi: 'おお(きい)', meaning: 'Grande', category: 'Luoghi', strokes: 3, jlpt: 'N5', example: {word: '大学', reading: 'だいがく', meaning: 'università'}},
  {char: '小', onyomi: 'ショウ', kunyomi: 'ちい(さい)', meaning: 'Piccolo', category: 'Luoghi', strokes: 3, jlpt: 'N5', example: {word: '小学校', reading: 'しょうがっこう', meaning: 'scuola elementare'}},
  {char: '国', onyomi: 'コク', kunyomi: 'くに', meaning: 'Paese / Nazione', category: 'Luoghi', strokes: 8, jlpt: 'N5', example: {word: '外国', reading: 'がいこく', meaning: 'estero'}},
  {char: '本', onyomi: 'ホン', kunyomi: 'もと', meaning: 'Libro / Origine', category: 'Luoghi', strokes: 5, jlpt: 'N5', example: {word: '本屋', reading: 'ほんや', meaning: 'libreria'}},
  {char: '語', onyomi: 'ゴ', kunyomi: 'かた(る)', meaning: 'Lingua / Parola', category: 'Luoghi', strokes: 14, jlpt: 'N5', example: {word: '日本語', reading: 'にほんご', meaning: 'lingua giapponese'}},
  {char: '駅', onyomi: 'エキ', kunyomi: '—', meaning: 'Stazione', category: 'Luoghi', strokes: 14, jlpt: 'N5', example: {word: '東京駅', reading: 'とうきょうえき', meaning: 'stazione di Tokyo'}},
  {char: '東', onyomi: 'トウ', kunyomi: 'ひがし', meaning: 'Est', category: 'Luoghi', strokes: 8, jlpt: 'N5', example: {word: '東京', reading: 'とうきょう', meaning: 'Tokyo'}},
  {char: '京', onyomi: 'キョウ・ケイ', kunyomi: 'みやこ', meaning: 'Capitale', category: 'Luoghi', strokes: 8, jlpt: 'N4', example: {word: '京都', reading: 'きょうと', meaning: 'Kyoto'}},
  {char: '校', onyomi: 'コウ', kunyomi: '—', meaning: 'Scuola', category: 'Luoghi', strokes: 10, jlpt: 'N5', example: {word: '学校', reading: 'がっこう', meaning: 'scuola'}},
];

export const KANJI_CATEGORIES: Array<'Tutti' | KanjiItem['category']> = [
  'Tutti',
  'Numeri',
  'Natura',
  'Tempo',
  'Persone',
  'Azioni',
  'Luoghi',
];
