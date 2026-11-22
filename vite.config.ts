import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function serveJapaneseCharDataPlugin(): Plugin {
  const pkgDataDir = path.resolve(__dirname, 'node_modules/@k1low/hanzi-writer-data-jp');

  return {
    name: 'serve-japanese-char-data',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const q = (url.searchParams.get('q') || '').trim();
          if (!q || q.length > 40) {
            res.statusCode = 400;
            res.end('Missing or invalid text query');
            return;
          }
          const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=ja&client=tw-ob`;
          const upstream = await fetch(ttsUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(5000),
          });
          if (!upstream.ok) {
            res.statusCode = 502;
            res.end('Upstream TTS unavailable');
            return;
          }
          const arrayBuf = await upstream.arrayBuffer();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=604800');
          res.end(Buffer.from(arrayBuf));
        } catch {
          res.statusCode = 502;
          res.end('TTS fetch error');
        }
      });

      server.middlewares.use('/char-data', (req, res, next) => {
        const cleanUrl = (req.url || '').split('?')[0].replace(/^\/+/, '');
        if (!cleanUrl.endsWith('.json')) {
          return next();
        }
        const hex = cleanUrl.slice(0, -5);
        const codePoint = parseInt(hex, 16);
        if (!Number.isFinite(codePoint) || codePoint <= 0) {
          res.statusCode = 400;
          res.end(JSON.stringify({error: 'Invalid character codepoint'}));
          return;
        }
        const char = String.fromCodePoint(codePoint);
        const filePath = path.join(pkgDataDir, `${char}.json`);
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        res.statusCode = 404;
        res.end(JSON.stringify({error: `Character data not found for ${char}`}));
      });
    },
    closeBundle(error?: Error): void {
      if (error) {
        return;
      }
      const distDir = path.resolve(__dirname, 'dist');
      const targetDir = path.join(distDir, 'char-data');
      if (!fs.existsSync(distDir) || !fs.existsSync(pkgDataDir)) {
        return;
      }
      fs.mkdirSync(targetDir, {recursive: true});
      const files = fs.readdirSync(pkgDataDir);
      for (const file of files) {
        if (!file.endsWith('.json') || file === 'package.json') {
          continue;
        }
        const char = file.slice(0, -5);
        const cp = char.codePointAt(0);
        if (!cp) {
          continue;
        }
        const hexName = `${cp.toString(16).toLowerCase()}.json`;
        fs.copyFileSync(path.join(pkgDataDir, file), path.join(targetDir, hexName));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      serveJapaneseCharDataPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'SumiPad — Scrittura Giapponese',
          short_name: 'SumiPad',
          description:
            'App interattiva per scrivere Hiragana, Katakana, Kanji principali e parole comuni con guide animate tratto per tratto.',
          theme_color: '#0B1120',
          background_color: '#0B1120',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'it',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\/char-data\/.*\.json$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'japanese-stroke-data',
                expiration: {
                  maxEntries: 2000,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\/tts\?.*$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'japanese-tts-audio',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 90,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
