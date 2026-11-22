import {Download, Share, WifiOff} from 'lucide-react';
import {useState} from 'react';
import {useOnlineStatus, usePWAInstall} from '../hooks/usePWA';

export function PWAInstallButton() {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Installa App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Installa su iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-xl bg-[#151E2E] border border-slate-700 p-6 shadow-2xl">
              <h3 className="text-base font-semibold text-white">
                Installa SumiPad su iPhone / iPad
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>
                  Tocca il pulsante <strong>Condividi</strong> nella barra di Safari.
                </li>
                <li>
                  Scorri e seleziona <strong>Aggiungi alla schermata Home</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 text-sm font-medium text-white cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-amber-500">
      <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Modalità Offline · Dati locali in uso</span>
    </div>
  );
}
