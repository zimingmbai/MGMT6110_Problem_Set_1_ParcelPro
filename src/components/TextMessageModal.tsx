import React, { useState } from 'react';
import { MessageSquare, Send, X, User, Car, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../types';

interface TextMessageModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess?: (msg: string) => void;
}

export const TextMessageModal: React.FC<TextMessageModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSendSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !vehicle) return null;

  const quickTemplates = [
    'Please advise your updated ETA for current dropoff.',
    'Subsequent delivery will be reassigned to relieve schedule.',
    'Expressway traffic cleared. Drive safely.',
    'Please acknowledge when package is handed over.',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSentSuccess(true);
    if (onSendSuccess) {
      onSendSuccess(message);
    }

    setTimeout(() => {
      setSentSuccess(false);
      setMessage('');
      onClose();
    }, 1400);
  };

  return (
    <div
      id="text-message-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="text-message-dialog"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Send Dispatch Text</h3>
              <p className="text-xs text-slate-500">ParcelPro In-Cab Driver Messenger</p>
            </div>
          </div>
          <button
            id="close-message-modal-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Message Dispatched!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Sent to driver <strong className="text-slate-900">{vehicle.driverName}</strong> ({vehicle.driverContact}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 mb-4 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <User className="h-4 w-4 text-slate-400" />
                <span>{vehicle.driverName}</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-slate-600">{vehicle.driverContact}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-700 px-2 py-0.5 rounded bg-white border border-slate-200">
                <Car className="h-3 w-3 text-slate-400" />
                <span>{vehicle.carPlate}</span>
              </div>
            </div>

            <label htmlFor="driver-message-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Message Content
            </label>
            <textarea
              id="driver-message-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or instruction to the driver here..."
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />

            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Quick Templates:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(template)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 transition-colors text-left"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                id="cancel-message-btn"
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                id="send-message-btn"
                type="submit"
                disabled={!message.trim()}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors min-h-[44px]"
              >
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
