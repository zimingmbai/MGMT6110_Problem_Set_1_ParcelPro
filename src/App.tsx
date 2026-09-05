/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MANAGERS, INITIAL_VEHICLES } from './data';
import { Vehicle, Delivery, Manager } from './types';
import { Header } from './components/Header';
import { SingaporeMap } from './components/SingaporeMap';
import { VehicleDetails } from './components/VehicleDetails';
import { FleetOverviewScreen } from './components/FleetOverviewScreen';
import { PhoneCallModal } from './components/PhoneCallModal';
import { TextMessageModal } from './components/TextMessageModal';
import { ReassignModal } from './components/ReassignModal';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export default function App() {
  // All 30 vehicles maintained in local state
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('mgr-1');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh-01');
  const [activeScreen, setActiveScreen] = useState<'map' | 'dispatch'>('map');

  // Modal states
  const [phoneVehicle, setPhoneVehicle] = useState<Vehicle | null>(null);
  const [messageVehicle, setMessageVehicle] = useState<Vehicle | null>(null);
  const [reassignData, setReassignData] = useState<{
    delivery: Delivery;
    vehicle: Vehicle;
  } | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = (title: string, description: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, description, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Current manager
  const currentManager = useMemo(
    () => MANAGERS.find((m) => m.id === selectedManagerId) || MANAGERS[0],
    [selectedManagerId]
  );

  // Current manager's 10 vehicles
  const currentManagerVehicles = useMemo(
    () => vehicles.filter((v) => v.managerId === selectedManagerId),
    [vehicles, selectedManagerId]
  );

  // Active selected vehicle (must be within manager's vehicles)
  const activeVehicle = useMemo(() => {
    const found = currentManagerVehicles.find((v) => v.id === selectedVehicleId);
    return found || currentManagerVehicles[0] || null;
  }, [currentManagerVehicles, selectedVehicleId]);

  // When manager changes, reset selected vehicle to first vehicle in manager's fleet
  const handleSelectManager = (managerId: string) => {
    setSelectedManagerId(managerId);
    const mgrVehicles = vehicles.filter((v) => v.managerId === managerId);
    if (mgrVehicles.length > 0) {
      setSelectedVehicleId(mgrVehicles[0].id);
    }
  };

  // Count delayed vehicles in current manager's fleet
  const currentManagerDelayedCount = useMemo(
    () => currentManagerVehicles.filter((v) => v.deliveries.some((d) => d.isDelayed)).length,
    [currentManagerVehicles]
  );

  // Reassignment handler
  const handleConfirmReassign = (
    deliveryId: string,
    sourceVehicleId: string,
    targetVehicleId: string
  ) => {
    setVehicles((prevVehicles) => {
      // Find source vehicle and target vehicle
      const sourceVeh = prevVehicles.find((v) => v.id === sourceVehicleId);
      const targetVeh = prevVehicles.find((v) => v.id === targetVehicleId);

      if (!sourceVeh || !targetVeh) return prevVehicles;

      // Delivery to move
      const deliveryToMove = sourceVeh.deliveries.find((d) => d.id === deliveryId);
      if (!deliveryToMove) return prevVehicles;

      // Updated target deliveries: add the reassigned delivery, reset delayed status
      const updatedDelivery: Delivery = {
        ...deliveryToMove,
        status: 'scheduled',
        isDelayed: false,
        isInTransit: false,
        sequence: targetVeh.deliveries.length + 1,
        notes: `Reassigned from ${sourceVeh.driverName} (${sourceVeh.carPlate}) to prevent delay snowballing.`,
      };

      // Guardrail check: max 10 deliveries
      if (targetVeh.deliveries.length >= 10) {
        showToast('Capacity Limit Reached', 'Target vehicle already has 10 deliveries.', 'info');
        return prevVehicles;
      }

      // Updated source deliveries: remove the delivery
      const updatedSourceDeliveries = sourceVeh.deliveries
        .filter((d) => d.id !== deliveryId)
        .map((d, index) => {
          // If subsequent deliveries were marked delayed purely due to cascade, resolve them
          return {
            ...d,
            sequence: index + 1,
            // As specified in user prompt: "Once reassignment is complete, the affected van icon will turn from red to green"
            // If the driver is already in transit for the delayed delivery, he will complete it, but subsequent delays are relieved!
            isDelayed: false,
          };
        });

      const nextVehicles = prevVehicles.map((v) => {
        if (v.id === sourceVehicleId) {
          return {
            ...v,
            deliveries: updatedSourceDeliveries,
          };
        }
        if (v.id === targetVehicleId) {
          return {
            ...v,
            deliveries: [...v.deliveries, updatedDelivery],
          };
        }
        return v;
      });

      return nextVehicles;
    });

    const targetVeh = vehicles.find((v) => v.id === targetVehicleId);
    showToast(
      'Delivery Reassigned Successfully',
      `Moved to ${targetVeh?.driverName || 'new driver'} (${targetVeh?.carPlate}). Affected van icon updated to On Time (Green)!`,
      'success'
    );

    setReassignData(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        managers={MANAGERS}
        selectedManagerId={selectedManagerId}
        onSelectManager={handleSelectManager}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        totalDelayed={currentManagerDelayedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Active Fleet: {currentManager.assignedFleetName}
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-xs text-slate-500">
              Region: {currentManager.focusRegion}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Manager Hotline: <strong className="text-slate-800 font-mono">{currentManager.phone}</strong>
            </span>
          </div>
        </div>

        {/* SCREEN 1: Singapore Fleet Map + Vehicle Details */}
        {activeScreen === 'map' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1) Singapore Map with URA Areas & 10 Van GPS Icons */}
            <SingaporeMap
              vehicles={currentManagerVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              activeManagerName={currentManager.name}
            />

            {/* Van Details appearing below the map */}
            {activeVehicle && (
              <VehicleDetails
                vehicle={activeVehicle}
                allManagerVehicles={currentManagerVehicles}
                onSelectVehicle={setSelectedVehicleId}
                onPhoneClick={(veh) => setPhoneVehicle(veh)}
                onMessageClick={(veh) => setMessageVehicle(veh)}
                onReassignClick={(del, veh) => setReassignData({ delivery: del, vehicle: veh })}
              />
            )}
          </div>
        )}

        {/* SCREEN 2: Reassignment Hub & Fleet Overview */}
        {activeScreen === 'dispatch' && (
          <div className="animate-fadeIn">
            <FleetOverviewScreen
              vehicles={currentManagerVehicles}
              managerName={currentManager.name}
              onPhoneClick={(veh) => setPhoneVehicle(veh)}
              onMessageClick={(veh) => setMessageVehicle(veh)}
              onReassignClick={(del, veh) => setReassignData({ delivery: del, vehicle: veh })}
              onViewOnMap={(vehId) => {
                setSelectedVehicleId(vehId);
                setActiveScreen('map');
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-alert"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700 flex items-start gap-3 animate-slideUp"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {toastMessage.title}
            </h5>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              {toastMessage.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Phone Call Modal */}
      <PhoneCallModal
        vehicle={phoneVehicle}
        isOpen={Boolean(phoneVehicle)}
        onClose={() => setPhoneVehicle(null)}
      />

      {/* Text Message Modal */}
      <TextMessageModal
        vehicle={messageVehicle}
        isOpen={Boolean(messageVehicle)}
        onClose={() => setMessageVehicle(null)}
        onSendSuccess={(msg) => {
          showToast(
            'Message Dispatched',
            `Dispatch note sent to ${messageVehicle?.driverName}: "${msg.slice(0, 35)}..."`
          );
        }}
      />

      {/* Reassign Delivery Modal */}
      <ReassignModal
        isOpen={Boolean(reassignData)}
        delivery={reassignData?.delivery || null}
        sourceVehicle={reassignData?.vehicle || null}
        allFleetVehicles={currentManagerVehicles}
        onClose={() => setReassignData(null)}
        onConfirmReassign={handleConfirmReassign}
      />
    </div>
  );
}
