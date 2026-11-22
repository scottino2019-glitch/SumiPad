import {Plus} from 'lucide-react';
import {AREA_ORDER, AREA_THEMES} from '../data/themes';
import type {StudyAreaId} from '../types/japanese';
import {PWAInstallButton} from './PWAControls';

interface TopBarProps {
  activeArea: StudyAreaId;
  onSelectArea: (area: StudyAreaId) => void;
  onOpenAddWord: () => void;
}

export function TopBar({activeArea, onSelectArea, onOpenAddWord}: TopBarProps) {
  return (
    <header className="bg-[#0F172A] border-b border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectArea('hiragana')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-md cursor-pointer"
        >
          SumiPad
        </button>

        <nav
          aria-label="Aree di studio giapponese"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          {AREA_ORDER.map((areaId) => {
            const theme = AREA_THEMES[areaId];
            const isActive = activeArea === areaId;
            return (
              <button
                key={areaId}
                type="button"
                onClick={() => onSelectArea(areaId)}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {theme.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-0.5 ${theme.accentBg}`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={onOpenAddWord}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] focus-visible:ring-orange-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Aggiungi Parola</span>
          </button>
        </div>
      </div>
    </header>
  );
}
