import React, { useState } from 'react';
import { Vehicle, Delivery } from '../types';
import {
  Car,
  User,
  Phone,
  MessageSquare,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Gauge,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface FleetOverviewScreenProps {
  vehicles: Vehicle[];
  managerName: string;
  onPhoneClick: (vehicle: Vehicle) => void;
  onMessageClick: (vehicle: Vehicle) => void;
  onReassignClick: (delivery: Delivery, vehicle: Vehicle) => void;
  onViewOnMap: (vehicleId: string) => void;
}

export const FleetOverviewScreen: React.FC<FleetOverviewScreenProps> = ({
  vehicles,
  managerName,
  onPhoneClick,
  onMessageClick,
  onReassignClick,
  onViewOnMap,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'delayed' | 'ontime'>('all');

  const isVehicleDelayed = (v: Vehicle) => v.deliveries.some((d) => d.isDelayed);

  const delayedVehicles = vehicles.filter(isVehicleDelayed);
  const onTimeVehicles = vehicles.filter((v) => !isVehicleDelayed(v));

  const displayedVehicles =
    filterMode === 'delayed'
      ? delayedVehicles
      : filterMode === 'ontime'
      ? onTimeVehicles
      : vehicles;

  return (
    <div className="space-y-6">
      {/* Overview Banner & Delay Alert */}
      {delayedVehicles.length > 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  {delayedVehicles.length} Vehicle{delayedVehicles.length > 1 ? 's' : ''} Delayed in Fleet
                </h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  Drivers in transit will complete their active deliveries. Reassign subsequent deliveries below to on-time vehicles to stop delays from snowballing.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterMode('delayed')}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs shrink-0"
            >
              Focus Delayed Deliveries ({delayedVehicles.length})
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">All Fleet Deliveries On Schedule</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              All 10 vehicles for {managerName} are running on time with zero delay cascades.
            </p>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Fleet:</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All 10 Vans
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('delayed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'delayed'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>Delayed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-900 font-bold">
                {delayedVehicles.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ontime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'ontime'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>On Time</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-bold">
                {onTimeVehicles.length}
              </span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{displayedVehicles.length}</strong> of 10 Vehicles
        </div>
      </div>

      {/* Grid of Vehicles and Deliveries */}
      <div className="space-y-5">
        {displayedVehicles.map((vehicle) => {
          const isDelayed = isVehicleDelayed(vehicle);
          const full = vehicle.deliveries.length >= 10;

          return (
            <div
              key={vehicle.id}
              id={`overview-vehicle-${vehicle.id}`}
              className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs bg-white ${
                isDelayed ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              {/* Vehicle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                      isDelayed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {vehicle.carPlate}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isDelayed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDelayed ? 'Delay Active' : 'On Time'}
                      </span>
                      {full && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          10/10 MAX CAPACITY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Driver: <strong>{vehicle.driverName}</strong></span>
                      <span>•</span>
                      <span>URA Location: <strong>{vehicle.uraArea}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Driver Contact Options & Map Link */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline font-mono text-xs text-slate-600">
                    {vehicle.driverContact}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPhoneClick(vehicle)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold min-h-[38px]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMessageClick(vehicle)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold min-h-[38px]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewOnMap(vehicle.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold min-h-[38px]"
                  >
                    View on Map
                  </button>
                </div>
              </div>

              {/* Deliveries Scheduled under this vehicle */}
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Assigned Deliveries ({vehicle.deliveries.length}/10):
                </div>

                <div className="space-y-2">
                  {vehicle.deliveries.map((delivery, dIdx) => (
                    <div
                      key={delivery.id}
                      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
                        delivery.isDelayed
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] mt-0.5">
                          {dIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{delivery.item}</span>
                            {delivery.isDelayed && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                Delayed
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-600 mt-1">
                            <span>From: <strong>{delivery.pickupLocation}</strong></span>
                            <span>→</span>
                            <span>To: <strong>{delivery.dropoffLocation}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-slate-500 text-[11px] hidden sm:block">
                          <div>Window: <strong>{delivery.estimatedTime}</strong></div>
                          <div>Distance: {delivery.estimatedDistance}</div>
                        </div>

                        {/* Reassign Button */}
                        <button
                          type="button"
                          id={`hub-reassign-btn-${delivery.id}`}
                          onClick={() => onReassignClick(delivery, vehicle)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs min-h-[38px] ${
                            delivery.isDelayed
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          <span>Reassign</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
