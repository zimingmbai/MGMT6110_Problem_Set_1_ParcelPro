import React, { useState } from 'react';
import { Vehicle, UraAreaBoundary } from '../types';
import { URA_AREAS } from '../data';
import { Truck, ZoomIn, ZoomOut, RotateCcw, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

interface SingaporeMapProps {
  vehicles: Vehicle[]; // Exactly 10 vehicles for the active manager
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  activeManagerName: string;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  activeManagerName,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const isVehicleDelayed = (v: Vehicle) => v.deliveries.some((d) => d.isDelayed);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getRegionColor = (region: UraAreaBoundary['region']) => {
    switch (region) {
      case 'Central':
        return '#f1f5f9'; // slate-100
      case 'East':
        return '#f8fafc'; // slate-50
      case 'North':
        return '#f1f5f9';
      case 'North-East':
        return '#f8fafc';
      case 'West':
        return '#f1f5f9';
      default:
        return '#f8fafc';
    }
  };

  const delayedCount = vehicles.filter(isVehicleDelayed).length;
  const onTimeCount = vehicles.length - delayedCount;

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Map Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:px-4 sm:py-3 bg-slate-50 border-b border-slate-200 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Singapore Live GPS Fleet Map
            </h2>
            <p className="text-[11px] text-slate-500">
              Showing 10 vehicles for <span className="font-semibold text-slate-700">{activeManagerName}</span>
            </p>
          </div>
        </div>

        {/* Live status pills & Zoom buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onTimeCount} On Time</span>
          </div>

          {delayedCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>{delayedCount} Delayed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>All On Time!</span>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-95"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-95"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-95"
              title="Reset View"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-[#f4f7fb] overflow-hidden select-none touch-manipulation">
        {/* Hovered Area Badge overlay */}
        {hoveredArea && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none rounded-lg bg-slate-900/85 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-xs">
            URA Area: <span className="font-bold text-emerald-400">{hoveredArea}</span>
          </div>
        )}

        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Water pattern / background */}
            <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2ecf8" />
              <stop offset="100%" stopColor="#dbe8f6" />
            </linearGradient>

            {/* Pulsing ring filter */}
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6" />
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Sea / Straits Background */}
          <rect width="1000" height="620" fill="url(#seaGrad)" />

          {/* Straits Watermark Labels */}
          <text x="350" y="70" fill="#94a3b8" fontSize="13" fontWeight="600" letterSpacing="3" opacity="0.6">
            STRAITS OF JOHOR
          </text>
          <text x="500" y="590" fill="#94a3b8" fontSize="13" fontWeight="600" letterSpacing="3" opacity="0.6">
            SINGAPORE STRAIT
          </text>

          {/* Pulau Ubin & Tekong (East offshore) */}
          <g id="offshore-islands" opacity="0.8">
            <path
              d="M 750,150 Q 790,135 830,160 Q 800,180 750,165 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <text x="770" y="160" fontSize="9" fill="#64748b" fontWeight="600">Pulau Ubin</text>

            <path
              d="M 860,150 Q 920,130 940,170 Q 900,210 850,185 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <text x="880" y="175" fontSize="9" fill="#64748b" fontWeight="600">Pulau Tekong</text>
          </g>

          {/* URA Planning Areas Segmentation */}
          <g id="ura-areas">
            {URA_AREAS.map((area) => {
              const isHovered = hoveredArea === area.name;
              return (
                <g key={area.id}>
                  <path
                    d={area.path}
                    fill={isHovered ? '#e2e8f0' : getRegionColor(area.region)}
                    stroke="#94a3b8"
                    strokeWidth={isHovered ? '2' : '1.2'}
                    strokeLinejoin="round"
                    className="cursor-pointer transition-colors duration-150"
                    onMouseEnter={() => setHoveredArea(area.name)}
                    onMouseLeave={() => setHoveredArea(null)}
                    onClick={() => setHoveredArea(area.name)}
                  />
                  {/* URA Area Center Label */}
                  <text
                    x={area.center.x}
                    y={area.center.y}
                    fontSize="10"
                    fill="#64748b"
                    fontWeight="500"
                    textAnchor="middle"
                    pointerEvents="none"
                    className="select-none opacity-75"
                  >
                    {area.name.split('&')[0]}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 10 Mini Van Icons for Current Manager */}
          <g id="van-gps-markers">
            {vehicles.map((vehicle, idx) => {
              const delayed = isVehicleDelayed(vehicle);
              const isSelected = selectedVehicleId === vehicle.id;
              const { x, y } = vehicle.gpsLocation;

              return (
                <g
                  key={vehicle.id}
                  id={`marker-${vehicle.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  {/* Expanded invisible click target (min 48x48) */}
                  <circle r="26" fill="transparent" />

                  {/* Selected halo ring */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={delayed ? '#ef4444' : '#10b981'}
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ transformOrigin: '0px 0px', animationDuration: '8s' }}
                    />
                  )}

                  {/* Delayed pulsing ripple */}
                  {delayed && (
                    <circle
                      r="18"
                      fill="#ef4444"
                      opacity="0.3"
                      className="animate-ping"
                      style={{ transformOrigin: '0px 0px', animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Van Pin Base Container */}
                  <circle
                    r="15"
                    fill={delayed ? '#dc2626' : '#059669'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter={delayed ? 'url(#glow-red)' : 'url(#glow-green)'}
                    className="transition-transform group-hover:scale-110 group-active:scale-95"
                  />

                  {/* Van Icon inside pin */}
                  <g transform="translate(-7.5, -7.5)">
                    {/* SVG Van Silhouette */}
                    <path
                      d="M 1 4 L 9 4 L 11 7 L 14 7 C 14.5 7 15 7.5 15 8 L 15 11 C 15 11.5 14.5 12 14 12 L 13.5 12 C 13.5 13.1 12.6 14 11.5 14 C 10.4 14 9.5 13.1 9.5 12 L 5.5 12 C 5.5 13.1 4.6 14 3.5 14 C 2.4 14 1.5 13.1 1.5 12 L 1 12 C 0.5 12 0 11.5 0 11 L 0 5 C 0 4.5 0.5 4 1 4 Z"
                      fill="#ffffff"
                    />
                    {/* Van Window */}
                    <path d="M 9.5 5 L 9.5 7 L 12.8 7 L 11.2 5 Z" fill={delayed ? '#b91c1c' : '#047857'} />
                    {/* Wheels */}
                    <circle cx="3.5" cy="12" r="1.5" fill="#1e293b" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="11.5" cy="12" r="1.5" fill="#1e293b" stroke="#ffffff" strokeWidth="0.5" />
                  </g>

                  {/* Plate label tag right below or above van */}
                  <g transform="translate(0, 24)">
                    <rect
                      x="-38"
                      y="-7"
                      width="76"
                      height="15"
                      rx="3"
                      fill={isSelected ? '#0f172a' : '#ffffff'}
                      stroke={delayed ? '#ef4444' : isSelected ? '#0f172a' : '#cbd5e1'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isSelected ? '#ffffff' : delayed ? '#dc2626' : '#1e293b'}
                    >
                      {vehicle.carPlate}
                    </text>
                  </g>

                  {/* Sequence number badge on top */}
                  <g transform="translate(10, -10)">
                    <circle r="6" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {idx + 1}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 flex items-center gap-3 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md border border-slate-200/80 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px]">On Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="text-[11px] text-rose-700 font-bold">Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
