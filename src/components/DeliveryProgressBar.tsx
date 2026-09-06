import React from 'react';
import { TransitStage } from '../types';
import { Check, Truck, Package, PackageCheck } from 'lucide-react';

interface DeliveryProgressBarProps {
  currentStage?: TransitStage;
  isDelayed?: boolean;
  onSelectStage?: (stage: TransitStage) => void;
  compact?: boolean;
}

const STAGES: { stage: TransitStage; step: number; label: string; icon: React.FC<{ className?: string }> }[] = [
  { stage: 'Picking Up', step: 1, label: '1) Picking Up', icon: Package },
  { stage: 'In Transit', step: 2, label: '2) In Transit', icon: Truck },
  { stage: 'Delivered', step: 3, label: '3) Delivered', icon: PackageCheck },
];

export const DeliveryProgressBar: React.FC<DeliveryProgressBarProps> = ({
  currentStage = 'In Transit' as TransitStage,
  isDelayed = false,
  onSelectStage,
  compact = false,
}) => {
  const getStageIndex = (stage: TransitStage) => {
    switch (stage) {
      case 'Picking Up':
        return 0;
      case 'In Transit':
        return 1;
      case 'Delivered':
        return 2;
      default:
        return 1;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div
      className={`rounded-xl border p-3 ${
        isDelayed && currentStage !== 'Delivered'
          ? 'bg-rose-50/70 border-rose-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Header with Title and Current Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentStage === 'Delivered'
                  ? 'bg-emerald-400'
                  : isDelayed
                  ? 'bg-rose-400'
                  : 'bg-blue-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                currentStage === 'Delivered'
                  ? 'bg-emerald-500'
                  : isDelayed
                  ? 'bg-rose-500'
                  : 'bg-blue-600'
              }`}
            />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Current In-Transit Mission Progress:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              currentStage === 'Delivered'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : isDelayed
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}
          >
            {currentStage}
          </span>
          {onSelectStage && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Click stage to update)
            </span>
          )}
        </div>
      </div>

      {/* Visual Stepper / Progress Bar */}
      <div className="relative pt-1 pb-1">
        {/* Background Track */}
        <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 rounded-full z-0" />

        {/* Filled Track Line */}
        <div
          className={`absolute top-4 left-6 h-1 rounded-full z-0 transition-all duration-300 ${
            currentStage === 'Delivered'
              ? 'bg-emerald-500'
              : isDelayed
              ? 'bg-rose-500'
              : 'bg-blue-600'
          }`}
          style={{
            width:
              currentIndex === 0
                ? '0%'
                : currentIndex === 1
                ? 'calc(50% - 12px)'
                : 'calc(100% - 24px)',
          }}
        />

        {/* 3 Steps: 1) Picking Up 2) In Transit 3) Delivered */}
        <div className="relative z-10 flex items-start justify-between">
          {STAGES.map((item, idx) => {
            const isCompleted = idx < currentIndex || (idx === 2 && currentIndex === 2);
            const isActive = idx === currentIndex && currentIndex !== 2;
            const Icon = item.icon;

            return (
              <button
                key={item.stage}
                type="button"
                onClick={() => onSelectStage?.(item.stage)}
                className={`flex flex-col items-center group text-center focus:outline-none transition-all ${
                  onSelectStage ? 'cursor-pointer' : 'cursor-default'
                } ${compact ? 'max-w-[80px]' : 'max-w-[120px]'}`}
                title={onSelectStage ? `Set status to ${item.label}` : item.label}
              >
                {/* Node Circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isActive
                      ? isDelayed
                        ? 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100'
                        : 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Step Label: 1) Picking Up 2) In Transit 3) Delivered */}
                <span
                  className={`mt-1.5 text-xs transition-colors ${
                    isActive
                      ? isDelayed
                        ? 'font-bold text-rose-700'
                        : 'font-bold text-blue-700'
                      : isCompleted
                      ? 'font-bold text-emerald-700'
                      : 'font-medium text-slate-500'
                  }`}
                >
                  {item.label}
                </span>

                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {idx === 0 ? 'At Pickup' : idx === 1 ? 'On The Road' : 'Completed'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
