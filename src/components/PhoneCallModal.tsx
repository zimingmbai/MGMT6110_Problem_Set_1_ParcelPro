import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, X, User, Car } from 'lucide-react';
import { Vehicle } from '../types';

interface PhoneCallModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [callStatus, setCallStatus] = useState<'prompt' | 'calling' | 'connected'>('prompt');

  if (!isOpen || !vehicle) return null;

  const handleStartCall = () => {
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 1200);
  };

  const handleEndCall = () => {
    setCallStatus('prompt');
    onClose();
  };

  return (
    <div
      id="phone-call-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={() => {
        if (callStatus === 'prompt') onClose();
      }}
    >
      <div
        id="phone-call-dialog"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {callStatus === 'prompt' && (
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Call Driver</h3>
                  <p className="text-xs text-slate-500">ParcelPro Dispatch Voice Channel</p>
                </div>
              </div>
              <button
                id="close-phone-modal-btn"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-6 rounded-xl bg-slate-50 p-4 border border-slate-200/70">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{vehicle.driverName}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-medium text-slate-700">
                  <Car className="h-3.5 w-3.5 text-slate-500" />
                  <span>{vehicle.carPlate}</span>
                </div>
              </div>

              <div className="text-2xl font-mono font-bold text-slate-900 tracking-wide text-center py-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                {vehicle.driverContact}
              </div>

              <p className="text-xs text-slate-500 text-center mt-3">
                Current Location: <span className="font-semibold text-slate-700">{vehicle.uraArea} URA Area</span>
              </p>
            </div>

            <div className="text-sm text-slate-600 mb-6 text-center">
              Confirm initiating direct voice call with driver <strong className="text-slate-900">{vehicle.driverName}</strong>?
            </div>

            <div className="flex items-center gap-3">
              <button
                id="cancel-call-btn"
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                id="confirm-call-btn"
                type="button"
                onClick={handleStartCall}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-colors min-h-[44px]"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Confirm Call</span>
              </button>
            </div>
          </div>
        )}

        {(callStatus === 'calling' || callStatus === 'connected') && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-pulse">
              <PhoneCall className="h-10 w-10" />
            </div>

            <h4 className="text-xl font-bold text-slate-900">{vehicle.driverName}</h4>
            <p className="text-sm font-mono text-slate-500 mb-2">{vehicle.driverContact}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              {callStatus === 'calling' ? 'Connecting dispatch line...' : 'Connected (00:14) • High HD Audio'}
            </div>

            <div className="mt-8">
              <button
                id="end-call-btn"
                type="button"
                onClick={handleEndCall}
                className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 shadow-md transition-colors min-h-[44px]"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
