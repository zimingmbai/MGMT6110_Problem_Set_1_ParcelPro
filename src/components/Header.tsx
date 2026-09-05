import React from 'react';
import { Manager } from '../types';
import { Truck, Map, ArrowRightLeft, Users, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  managers: Manager[];
  selectedManagerId: string;
  onSelectManager: (managerId: string) => void;
  activeScreen: 'map' | 'dispatch';
  onSelectScreen: (screen: 'map' | 'dispatch') => void;
  totalDelayed: number;
}

export const Header: React.FC<HeaderProps> = ({
  managers,
  selectedManagerId,
  onSelectManager,
  activeScreen,
  onSelectScreen,
  totalDelayed,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black shadow-sm">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                ParcelPro
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Singapore Fleet
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dispatch Operations & Delivery Monitoring System
            </p>
          </div>
        </div>

        {/* Screen Switcher Navigation Tabs */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            id="nav-tab-map-screen"
            type="button"
            onClick={() => onSelectScreen('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
              activeScreen === 'map'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Singapore Map</span>
          </button>

          <button
            id="nav-tab-dispatch-screen"
            type="button"
            onClick={() => onSelectScreen('dispatch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
              activeScreen === 'dispatch'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Reassignment Hub</span>
            {totalDelayed > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-bold">
                {totalDelayed}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3 Managers Selector Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Active Dispatch Manager:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {managers.map((m) => {
              const isSelected = m.id === selectedManagerId;
              return (
                <button
                  key={m.id}
                  id={`manager-tab-${m.id}`}
                  type="button"
                  onClick={() => onSelectManager(m.id)}
                  className={`shrink-0 flex flex-col text-left px-3.5 py-1.5 rounded-xl text-xs transition-all border min-h-[44px] justify-center ${
                    isSelected
                      ? 'bg-emerald-600/20 text-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    {m.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.assignedFleetName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
