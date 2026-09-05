import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, X, Package, MapPin, Clock, Gauge, Car, User, ShieldAlert } from 'lucide-react';
import { Delivery, Vehicle } from '../types';

interface ReassignModalProps {
  isOpen: boolean;
  delivery: Delivery | null;
  sourceVehicle: Vehicle | null;
  allFleetVehicles: Vehicle[];
  onClose: () => void;
  onConfirmReassign: (deliveryId: string, sourceVehicleId: string, targetVehicleId: string) => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  delivery,
  sourceVehicle,
  allFleetVehicles,
  onClose,
  onConfirmReassign,
}) => {
  const [selectedTargetVehicleId, setSelectedTargetVehicleId] = useState<string | null>(null);

  if (!isOpen || !delivery || !sourceVehicle) return null;

  // Filter out the source vehicle
  const otherVehicles = allFleetVehicles.filter((v) => v.id !== sourceVehicle.id);

  // An available vehicle is one whose deliveries do NOT have any delayed status
  // AND has fewer than 10 deliveries
  const isVehicleDelayed = (v: Vehicle) => v.deliveries.some((d) => d.isDelayed);
  const isVehicleFull = (v: Vehicle) => v.deliveries.length >= 10;

  const handleConfirm = () => {
    if (!selectedTargetVehicleId) return;
    onConfirmReassign(delivery.id, sourceVehicle.id, selectedTargetVehicleId);
    setSelectedTargetVehicleId(null);
  };

  return (
    <div
      id="reassign-delivery-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="reassign-delivery-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl transition-all border border-slate-200 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <ArrowRight className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Reassign Delivery</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Prevent delay snowballing by delegating this delivery to an available on-time vehicle.
            </p>
          </div>
          <button
            id="close-reassign-modal-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Active Delivery Summary */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                <Package className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{delivery.item}</span>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900">
                Delivery #{delivery.sequence}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-amber-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-semibold uppercase text-[10px] tracking-wider">Pickup</span>
                </div>
                <div className="font-medium text-slate-800 line-clamp-1">{delivery.pickupLocation}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Area: {delivery.pickupUra}</div>
              </div>

              <div className="rounded-lg bg-white p-2.5 border border-amber-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-600" />
                  <span className="font-semibold uppercase text-[10px] tracking-wider">Dropoff</span>
                </div>
                <div className="font-medium text-slate-800 line-clamp-1">{delivery.dropoffLocation}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Area: {delivery.dropoffUra}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-amber-200/70 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Est. Window: <strong>{delivery.estimatedTime}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-slate-400" />
                  Distance: <strong>{delivery.estimatedDistance}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span>Current Driver:</span>
                <strong className="text-slate-900">{sourceVehicle.driverName}</strong>
                <span className="font-mono text-[11px] text-slate-500">({sourceVehicle.carPlate})</span>
              </div>
            </div>
          </div>

          {/* Vehicle Selection List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Available Target Vehicle (On-Time Vehicles Only)
              </label>
              <span className="text-xs text-slate-500">
                Capacity limit: <strong>Max 10 deliveries / vehicle</strong>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {otherVehicles.map((v) => {
                const delayed = isVehicleDelayed(v);
                const full = isVehicleFull(v);
                const isEligible = !delayed && !full;
                const isSelected = selectedTargetVehicleId === v.id;

                return (
                  <div
                    key={v.id}
                    id={`target-vehicle-${v.id}`}
                    onClick={() => {
                      if (isEligible) {
                        setSelectedTargetVehicleId(v.id);
                      }
                    }}
                    className={`relative rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : isEligible
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer'
                        : 'border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                            delayed
                              ? 'bg-rose-100 text-rose-700'
                              : full
                              ? 'bg-amber-100 text-amber-700'
                              : isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Car className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{v.driverName}</span>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {v.carPlate}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>Loc: <strong>{v.uraArea}</strong></span>
                            <span>•</span>
                            <span>Contact: {v.driverContact}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">
                            Load: <strong className="text-slate-900">{v.deliveries.length}</strong>/10
                          </span>
                        </div>

                        {/* Status / eligibility label */}
                        {delayed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Delayed (Ineligible)
                          </span>
                        ) : full ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                            <ShieldAlert className="h-3 w-3" />
                            Max 10 Limit Full
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle className="h-3 w-3" />
                            Available (On Time)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for capacity */}
                    <div className="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          full ? 'bg-amber-500' : delayed ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(v.deliveries.length / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 shrink-0">
          <button
            id="cancel-reassign-btn"
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px]"
          >
            Cancel
          </button>

          <button
            id="confirm-reassignment-btn"
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTargetVehicleId}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-colors min-h-[44px]"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Confirm Reassignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
