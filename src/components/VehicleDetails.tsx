import React from 'react';
import { Vehicle, Delivery } from '../types';
import {
  Car,
  User,
  Phone,
  MessageSquare,
  Package,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Share2,
  Info,
} from 'lucide-react';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  allManagerVehicles: Vehicle[];
  onSelectVehicle: (vehicleId: string) => void;
  onPhoneClick: (vehicle: Vehicle) => void;
  onMessageClick: (vehicle: Vehicle) => void;
  onReassignClick: (delivery: Delivery, vehicle: Vehicle) => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  allManagerVehicles,
  onSelectVehicle,
  onPhoneClick,
  onMessageClick,
  onReassignClick,
}) => {
  const hasDelayedDelivery = vehicle.deliveries.some((d) => d.isDelayed);
  const deliveryCount = vehicle.deliveries.length;
  const isFull = deliveryCount >= 10;

  return (
    <div
      id={`vehicle-details-${vehicle.id}`}
      className="w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6 transition-all"
    >
      {/* 10-Vehicle Quick Switcher Carousel */}
      <div className="mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Manager Fleet Vehicles (10 Vans)
          </span>
          <span className="text-xs text-slate-400">Tap to view van</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allManagerVehicles.map((v, i) => {
            const isDelayed = v.deliveries.some((d) => d.isDelayed);
            const isSelected = v.id === vehicle.id;
            return (
              <button
                key={v.id}
                id={`fleet-van-pill-${v.id}`}
                type="button"
                onClick={() => onSelectVehicle(v.id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border min-h-[44px] ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : isDelayed
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDelayed ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className="font-mono">{v.carPlate}</span>
                <span className="text-[11px] opacity-75">({v.deliveries.length}/10)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vehicle Header: Car Plate, Driver Name, Contact + Phone & Message */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6 border-b border-slate-100">
        {/* a. Car Plate Number & Status */}
        <div className="lg:col-span-4 flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              hasDelayedDelivery
                ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300'
                : 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
            }`}
          >
            <Car className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Car Plate Number
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-wide text-slate-900">
              {vehicle.carPlate}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hasDelayedDelivery
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {hasDelayedDelivery ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    Delivery Delayed
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Fleet On Time
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500">
                GPS: <strong>{vehicle.uraArea} Area</strong>
              </span>
            </div>
          </div>
        </div>

        {/* b. Driver Name */}
        <div className="lg:col-span-3 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Driver Name
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {vehicle.driverName}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Assigned Logistics Partner
            </div>
          </div>
        </div>

        {/* c. Driver Contact Number + Phone & Message Buttons */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Driver Contact Number
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {vehicle.driverContact}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Phone Button */}
            <button
              id={`call-driver-btn-${vehicle.id}`}
              type="button"
              onClick={() => onPhoneClick(vehicle)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all min-h-[44px]"
              title="Call driver directly"
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </button>

            {/* Message Button */}
            <button
              id={`message-driver-btn-${vehicle.id}`}
              type="button"
              onClick={() => onMessageClick(vehicle)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all min-h-[44px]"
              title="Send text message to driver"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* d. List of Deliveries Scheduled (Max 10 Deliveries) */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              List of Deliveries Scheduled
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                isFull
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {deliveryCount} / 10 Max Deliveries
            </span>
          </div>

          {hasDelayedDelivery && (
            <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                <strong>Action:</strong> Reassign subsequent deliveries below to prevent delay snowballing.
              </span>
            </div>
          )}
        </div>

        {deliveryCount === 0 ? (
          <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No scheduled deliveries</p>
            <p className="text-xs text-slate-400 mt-1">This vehicle is free to receive reassignments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicle.deliveries.map((delivery, index) => {
              const isFirstDelivery = index === 0;
              const isDelayed = delivery.isDelayed;
              const isInTransit = delivery.isInTransit || isFirstDelivery;

              return (
                <div
                  key={delivery.id}
                  id={`delivery-item-${delivery.id}`}
                  className={`rounded-xl border p-4 transition-all ${
                    isDelayed
                      ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Delivery Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {delivery.item}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDelayed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" />
                          {isInTransit ? 'Delayed (In-Transit)' : 'Subsequent (At Risk)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          {isInTransit ? 'In-Transit' : 'Scheduled'}
                        </span>
                      )}

                      {/* 2) Reassignment Button for Each Delivery */}
                      <button
                        id={`reassign-btn-${delivery.id}`}
                        type="button"
                        onClick={() => onReassignClick(delivery, vehicle)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs min-h-[38px] ${
                          isDelayed
                            ? 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                        title="Reassign this delivery to an available on-time vehicle"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Reassign Delivery</span>
                      </button>
                    </div>
                  </div>

                  {/* Pickup & Dropoff Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Pickup */}
                    <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
                          Pickup Location
                        </span>
                        <p className="font-medium text-slate-800 mt-0.5">{delivery.pickupLocation}</p>
                        <p className="text-[11px] text-slate-500">URA Area: <strong>{delivery.pickupUra}</strong></p>
                      </div>
                    </div>

                    {/* Dropoff */}
                    <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
                          Dropoff Location
                        </span>
                        <p className="font-medium text-slate-800 mt-0.5">{delivery.dropoffLocation}</p>
                        <p className="text-[11px] text-slate-500">URA Area: <strong>{delivery.dropoffUra}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time & Distance Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Estimated Time: <strong className="text-slate-900">{delivery.estimatedTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                        <span>Estimated Distance: <strong className="text-slate-900">{delivery.estimatedDistance}</strong></span>
                      </div>
                    </div>

                    {delivery.notes && (
                      <div className="text-[11px] text-rose-600 italic">
                        {delivery.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
