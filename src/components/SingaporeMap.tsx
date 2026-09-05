import React, { useState, useRef, useCallback } from 'react';
import { Vehicle, UraAreaBoundary } from '../types';
import { URA_AREAS } from '../data';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Navigation,
  Layers,
  Crosshair,
  MapPin,
} from 'lucide-react';

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
  const [center, setCenter] = useState({ x: 500, y: 310 });
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [showUraBoundaries, setShowUraBoundaries] = useState(true);

  // Mouse / Touch drag to pan
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialCenter: { x: number; y: number } } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isVehicleDelayed = (v: Vehicle) => v.deliveries.some((d) => d.isDelayed);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev * 1.3, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev / 1.3, 0.85));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setCenter({ x: 500, y: 310 });
  };

  // Center on current manager's 10 vehicles
  const handleFitFleet = () => {
    if (vehicles.length === 0) return;
    const xs = vehicles.map((v) => v.gpsLocation.x);
    const ys = vehicles.map((v) => v.gpsLocation.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const spanX = Math.max(maxX - minX, 120);
    const spanY = Math.max(maxY - minY, 100);

    const fitZoom = Math.min(Math.max(800 / (spanX + 160), 1), 2.4);

    setCenter({ x: midX, y: midY });
    setZoomLevel(fitZoom);
  };

  // Wheel zoom on map container
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoomLevel((prev) => Math.min(Math.max(prev * zoomFactor, 0.85), 3.5));
  };

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only initiate drag if not clicking on interactive elements directly
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-marker')) return;

    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialCenter: { ...center },
    };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = (1000 / zoomLevel) / svgRect.width;
    const scaleY = (620 / zoomLevel) / svgRect.height;

    const dx = (e.clientX - dragStartRef.current.clientX) * scaleX;
    const dy = (e.clientY - dragStartRef.current.clientY) * scaleY;

    setCenter({
      x: Math.max(200, Math.min(800, dragStartRef.current.initialCenter.x - dx)),
      y: Math.max(150, Math.min(470, dragStartRef.current.initialCenter.y - dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    dragStartRef.current = null;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
  };

  const delayedCount = vehicles.filter(isVehicleDelayed).length;
  const onTimeCount = vehicles.length - delayedCount;

  // Compute viewBox dynamically based on zoom & pan center
  const vbWidth = 1000 / zoomLevel;
  const vbHeight = 620 / zoomLevel;
  const vbX = center.x - vbWidth / 2;
  const vbY = center.y - vbHeight / 2;

  // Counter-scale factor so markers stay readable and accurate without blowing up or shrinking
  const markerScale = 1 / Math.pow(zoomLevel, 0.45);

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
              Live basemap tracking 10 vehicles for <span className="font-semibold text-slate-700">{activeManagerName}</span>
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

          {/* Subtle URA boundary layer toggle */}
          <button
            type="button"
            onClick={() => setShowUraBoundaries((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showUraBoundaries
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle URA Planning Area Boundaries"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">URA Overlay</span>
          </button>

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
              onClick={handleFitFleet}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-95"
              title="Focus on Fleet Vehicles"
              aria-label="Focus on fleet"
            >
              <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-95"
              title="Reset View"
              aria-label="Reset view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className="relative w-full aspect-16/10 sm:aspect-16/9 bg-[#dbe8f5] overflow-hidden select-none"
        onWheel={handleWheel}
      >
        {/* Hovered Area Badge overlay */}
        {hoveredArea && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-xs border border-slate-700/80 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>URA Area: <strong className="text-emerald-300 font-semibold">{hoveredArea}</strong></span>
          </div>
        )}

        {/* Pan instruction tip */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-2xs backdrop-blur-xs border border-slate-200/60">
          <span>Drag to pan • Wheel to zoom</span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${vbX} ${vbY} ${vbWidth} ${vbHeight}`}
          className={`w-full h-full transition-transform duration-75 ease-out ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            {/* Sea water pattern */}
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e3eef8" />
              <stop offset="50%" stopColor="#d5e5f5" />
              <stop offset="100%" stopColor="#c7dcf1" />
            </linearGradient>

            {/* Mainland land subtle gradient */}
            <linearGradient id="mainlandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>

            {/* Nature Reserve subtle green fill */}
            <linearGradient id="natureReserveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#e2f7ed" />
            </linearGradient>

            {/* Reservoir / lake water gradient */}
            <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>

            {/* Pulsing ring filter */}
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6" />
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* ========================================================
              LAYER 1: SEA & WATER BASEMAP
             ======================================================== */}
          <rect x="-500" y="-300" width="2000" height="1300" fill="url(#seaGradient)" />

          {/* Water channel markings & Straits labels */}
          <g id="straits-labels" opacity="0.45" pointerEvents="none">
            <text x="360" y="60" fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="4">
              STRAITS OF JOHOR
            </text>
            <text x="480" y="600" fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="4">
              SINGAPORE STRAIT
            </text>
            <text x="820" y="210" fill="#64748b" fontSize="10" fontWeight="600" letterSpacing="2">
              SERANGOON HARBOUR
            </text>
          </g>

          {/* Malaysia Johor Shoreline across northern border */}
          <path
            id="malaysia-coast"
            d="M -100,-100 L 1100,-100 L 1100,60 C 950,55 830,75 720,105 C 600,65 520,70 430,75 C 340,65 240,80 130,90 C 40,85 -40,100 -100,90 Z"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <text x="320" y="40" fill="#94a3b8" fontSize="10" fontWeight="700" letterSpacing="2" opacity="0.7">
            MALAYSIA (JOHOR)
          </text>

          {/* Causeway bridges connecting Singapore to Malaysia */}
          {/* Woodlands Causeway */}
          <line x1="410" y1="75" x2="410" y2="128" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="410" y1="75" x2="410" y2="128" stroke="#cbd5e1" strokeWidth="2" />
          <text x="415" y="105" fill="#475569" fontSize="7" fontWeight="bold">Causeway</text>

          {/* Tuas Second Link */}
          <line x1="85" y1="90" x2="80" y2="405" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 3" opacity="0.6" />
          <line x1="80" y1="360" x2="85" y2="410" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <text x="92" y="385" fill="#475569" fontSize="7" fontWeight="bold">Tuas 2nd Link</text>

          {/* ========================================================
              LAYER 2: SEAMLESS SINGAPORE LANDMASS (REALISTIC COASTLINE)
             ======================================================== */}
          <g id="singapore-landmass">
            {/* Main Island Contour */}
            <path
              id="singapore-main-island"
              d="
                M 80,490
                C 65,465 65,420 80,395
                C 95,360 135,330 185,295
                C 220,265 245,195 275,175
                C 310,160 345,165 370,145
                C 390,130 435,122 465,118
                C 495,114 530,120 545,135
                C 560,145 575,165 595,160
                C 625,148 670,155 705,170
                C 735,185 770,195 805,210
                C 835,225 855,245 870,260
                C 890,280 895,325 885,365
                C 875,395 845,410 805,415
                C 755,425 685,432 625,442
                C 595,446 575,456 550,466
                C 530,480 490,485 460,480
                C 430,475 390,460 360,455
                C 330,450 280,455 240,460
                C 200,465 160,480 130,510
                C 105,530 85,515 80,490
                Z
              "
              fill="url(#mainlandGradient)"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinejoin="round"
              filter="drop-shadow(0 2px 5px rgba(15, 23, 42, 0.08))"
            />

            {/* Offshore Islands */}
            {/* Sentosa Island */}
            <path
              d="M 470,510 C 495,498 540,505 555,520 C 545,542 505,548 470,528 Z"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            {/* Sentosa Gateway Bridge */}
            <line x1="495" y1="485" x2="495" y2="508" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            <text x="500" y="525" fontSize="8" fill="#475569" fontWeight="bold">Sentosa</text>

            {/* Jurong Island */}
            <path
              d="M 230,500 C 265,475 325,470 345,510 C 335,555 265,568 230,535 Z"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            {/* Jurong Island Highway */}
            <line x1="275" y1="460" x2="275" y2="488" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            <text x="270" y="525" fontSize="8" fill="#475569" fontWeight="bold">Jurong Island</text>

            {/* Pulau Bukom & Semakau */}
            <circle cx="395" cy="545" r="14" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="375" cy="580" r="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />

            {/* St. John's Island & Lazarus */}
            <path
              d="M 545,558 C 565,550 580,562 570,578 C 550,582 538,572 545,558 Z"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1"
            />

            {/* Pulau Ubin */}
            <path
              d="M 740,150 C 780,135 825,155 810,180 C 780,185 745,175 740,150 Z"
              fill="#eef6f0"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <text x="765" y="165" fontSize="8" fill="#475569" fontWeight="bold">Pulau Ubin</text>

            {/* Pulau Tekong */}
            <path
              d="M 850,150 C 910,130 948,165 918,210 C 878,215 848,190 850,150 Z"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <text x="880" y="175" fontSize="8" fill="#475569" fontWeight="bold">Pulau Tekong</text>

            {/* Coney Island */}
            <path
              d="M 685,165 C 710,158 725,170 710,182 C 690,182 680,175 685,165 Z"
              fill="#eef6f0"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
          </g>

          {/* ========================================================
              LAYER 3: NATURE RESERVES & GREENERY
             ======================================================== */}
          <g id="nature-reserves" opacity="0.85">
            {/* Central Catchment Nature Reserve */}
            <path
              d="M 430,195 C 480,185 530,220 525,290 C 520,340 460,350 430,320 C 400,280 400,230 430,195 Z"
              fill="url(#natureReserveGrad)"
              stroke="#a7f3d0"
              strokeWidth="1"
            />
            <text x="445" y="275" fontSize="8" fill="#059669" fontWeight="bold" opacity="0.7">
              Central Catchment Reserve
            </text>

            {/* Bukit Timah Nature Reserve */}
            <ellipse cx="420" cy="335" rx="18" ry="14" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="0.8" />
            <text x="408" y="338" fontSize="7" fill="#047857" fontWeight="bold">Bt Timah</text>

            {/* Sungei Buloh Wetland */}
            <ellipse cx="280" cy="185" rx="16" ry="10" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="0.8" />
            <text x="268" y="188" fontSize="6.5" fill="#047857" fontWeight="bold">Sungei Buloh</text>

            {/* East Coast Park coastal green belt */}
            <path
              d="M 630,442 C 690,432 760,422 810,412 C 808,416 758,426 628,446 Z"
              fill="#10b981"
              opacity="0.35"
            />
          </g>

          {/* ========================================================
              LAYER 4: REAL IN-LAND WATER BODIES & RESERVOIRS
             ======================================================== */}
          <g id="reservoirs">
            {/* Upper Seletar */}
            <path
              d="M 430,200 C 455,195 465,220 445,235 C 425,235 415,215 430,200 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* Lower Seletar */}
            <path
              d="M 535,190 C 570,185 585,210 565,225 C 535,225 520,205 535,190 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* Upper & Lower Peirce */}
            <path
              d="M 470,250 C 505,245 520,270 495,285 C 465,285 450,265 470,250 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* MacRitchie Reservoir */}
            <path
              d="M 480,315 C 515,310 525,330 500,340 C 470,335 465,325 480,315 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* Kranji Reservoir */}
            <path
              d="M 310,170 C 335,185 330,225 305,220 C 290,195 295,180 310,170 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* Jurong Lake */}
            <ellipse cx="320" cy="385" rx="14" ry="22" fill="url(#reservoirGrad)" stroke="#60a5fa" strokeWidth="0.8" />
            {/* Pandan Reservoir */}
            <ellipse cx="365" cy="455" rx="18" ry="14" fill="url(#reservoirGrad)" stroke="#60a5fa" strokeWidth="0.8" />
            {/* Bedok Reservoir */}
            <ellipse cx="710" cy="330" rx="20" ry="12" fill="url(#reservoirGrad)" stroke="#60a5fa" strokeWidth="0.8" />
            {/* Marina Reservoir & Marina Bay */}
            <path
              d="M 545,435 C 565,425 575,445 560,460 C 540,455 535,445 545,435 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
            {/* Poyan / Western Catchment */}
            <path
              d="M 190,320 C 220,310 230,350 200,360 C 180,350 175,330 190,320 Z"
              fill="url(#reservoirGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />
          </g>

          {/* ========================================================
              LAYER 5: TRANSPORTATION INFRASTRUCTURE (AIRPORTS & PORTS)
             ======================================================== */}
          <g id="infrastructure">
            {/* Changi Airport & Runways */}
            <g id="changi-airport">
              {/* Airport boundary shape */}
              <path
                d="M 810,290 L 870,270 L 890,360 L 830,380 Z"
                fill="#f1f5f9"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {/* Twin Runways: 02L/20R & 02C/20C */}
              <line x1="840" y1="285" x2="865" y2="375" stroke="#334155" strokeWidth="3" strokeLinecap="square" />
              <line x1="840" y1="285" x2="865" y2="375" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="855" y1="280" x2="880" y2="370" stroke="#334155" strokeWidth="3" strokeLinecap="square" />
              <line x1="855" y1="280" x2="880" y2="370" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
              <text x="830" y="335" fontSize="7.5" fill="#1e293b" fontWeight="bold">Changi Airport</text>
            </g>

            {/* Seletar Airport Runway */}
            <g id="seletar-airport">
              <line x1="600" y1="165" x2="615" y2="205" stroke="#475569" strokeWidth="2.5" strokeLinecap="square" />
              <text x="590" y="160" fontSize="7" fill="#475569" fontWeight="bold">Seletar</text>
            </g>

            {/* PSA Container Port Terminals */}
            <g id="ports" stroke="#94a3b8" strokeWidth="1">
              {/* Tuas Mega Port */}
              <path d="M 85,465 L 115,480 L 105,515 L 75,500 Z" fill="#e2e8f0" />
              <text x="80" y="485" fontSize="6.5" fill="#475569" fontWeight="bold">Tuas Port</text>
              {/* Pasir Panjang Terminal */}
              <path d="M 390,465 L 435,465 L 435,480 L 390,480 Z" fill="#e2e8f0" />
              <text x="395" y="475" fontSize="6.5" fill="#475569" fontWeight="bold">PSA Docks</text>
            </g>

            {/* Marina Bay & CBD Financial District */}
            <g id="cbd-landmark" transform="translate(545, 450)">
              <rect x="-12" y="-10" width="24" height="20" rx="3" fill="#1e293b" opacity="0.1" />
              <text x="0" y="1" fontSize="7" fill="#0f172a" fontWeight="bold" textAnchor="middle">CBD</text>
            </g>
          </g>

          {/* ========================================================
              LAYER 6: REAL ROADS & EXPRESSWAYS NETWORK
             ======================================================== */}
          <g id="road-network">
            {/* Secondary Arterial Roads (subtle grey lines) */}
            <g id="arterial-roads" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round">
              <path d="M 120,490 L 190,450 L 260,420 L 320,400" />
              <path d="M 230,360 L 290,360 L 340,380" />
              <path d="M 360,250 L 360,330 L 390,400" />
              <path d="M 430,340 L 460,380 L 480,440" />
              <path d="M 480,390 L 530,400 L 560,420" />
              <path d="M 520,320 L 560,330 L 600,340" />
              <path d="M 640,240 L 660,300 L 670,360" />
              <path d="M 720,250 L 730,300 L 740,360" />
              <path d="M 770,320 L 820,330 L 850,340" />
              <path d="M 460,130 L 470,180 L 480,240" />
              <path d="M 540,140 L 550,200 L 550,260" />
            </g>

            {/* Major Expressways - Casing & Fill for Real Map Appearance */}
            {/* 1) PIE (Pan Island Expressway) - Transits West to East */}
            <path
              id="pie-expressway"
              d="M 120,460 C 180,420 250,380 320,360 C 380,345 440,340 500,345 C 560,350 620,350 680,335 C 740,315 800,305 860,310"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 120,460 C 180,420 250,380 320,360 C 380,345 440,340 500,345 C 560,350 620,350 680,335 C 740,315 800,305 860,310"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2) AYE (Ayer Rajah Expressway) - Southern West to Downtown */}
            <path
              id="aye-expressway"
              d="M 90,470 C 150,460 220,445 290,430 C 350,425 410,430 470,445 C 500,455 530,465 550,470"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 90,470 C 150,460 220,445 290,430 C 350,425 410,430 470,445 C 500,455 530,465 550,470"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3) ECP (East Coast Parkway) & MCE (Marina Coastal Expressway) */}
            <path
              id="ecp-expressway"
              d="M 865,325 C 845,360 800,395 740,415 C 680,430 620,440 565,455 L 550,465 C 540,472 520,472 500,470"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 865,325 C 845,360 800,395 740,415 C 680,430 620,440 565,455 L 550,465 C 540,472 520,472 500,470"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 4) CTE (Central Expressway) - North to South */}
            <path
              id="cte-expressway"
              d="M 570,195 C 565,240 550,280 540,325 C 535,355 530,385 525,420 C 520,440 515,455 510,465"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 570,195 C 565,240 550,280 540,325 C 535,355 530,385 525,420 C 520,440 515,455 510,465"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* 5) BKE (Bukit Timah Expressway) */}
            <path
              id="bke-expressway"
              d="M 410,130 C 415,170 420,210 425,250 C 430,280 435,310 440,340"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 410,130 C 415,170 420,210 425,250 C 430,280 435,310 440,340"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* 6) SLE (Seletar Expressway) */}
            <path
              id="sle-expressway"
              d="M 415,175 C 450,175 490,180 530,185 C 550,190 565,190 575,195"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 415,175 C 450,175 490,180 530,185 C 550,190 565,190 575,195"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* 7) TPE (Tampines Expressway) */}
            <path
              id="tpe-expressway"
              d="M 575,195 C 610,195 650,205 690,225 C 730,245 770,270 815,295 L 860,310"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 575,195 C 610,195 650,205 690,225 C 730,245 770,270 815,295 L 860,310"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* 8) KPE (Kallang-Paya Lebar Expressway) */}
            <path
              id="kpe-expressway"
              d="M 660,215 C 650,260 635,310 620,360 C 605,400 590,430 575,455"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 2"
            />
            <path
              d="M 660,215 C 650,260 635,310 620,360 C 605,400 590,430 575,455"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="6 2"
            />

            {/* 9) KJE (Kranji Expressway) */}
            <path
              id="kje-expressway"
              d="M 425,240 C 390,250 355,270 330,300 C 310,325 300,345 295,365"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 425,240 C 390,250 355,270 330,300 C 310,325 300,345 295,365"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Expressway Shields */}
            <g id="expressway-shields" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#ffffff">
              {/* PIE Shields */}
              <g transform="translate(330, 360)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">PIE</text>
              </g>
              <g transform="translate(680, 335)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">PIE</text>
              </g>

              {/* AYE Shields */}
              <g transform="translate(230, 445)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">AYE</text>
              </g>
              <g transform="translate(420, 435)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">AYE</text>
              </g>

              {/* ECP Shield */}
              <g transform="translate(730, 415)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">ECP</text>
              </g>

              {/* CTE Shield */}
              <g transform="translate(545, 290)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">CTE</text>
              </g>

              {/* BKE Shield */}
              <g transform="translate(420, 210)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">BKE</text>
              </g>

              {/* TPE Shield */}
              <g transform="translate(700, 230)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">TPE</text>
              </g>

              {/* SLE Shield */}
              <g transform="translate(485, 180)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">SLE</text>
              </g>

              {/* KPE Shield */}
              <g transform="translate(635, 305)">
                <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#0369a1" />
                <text y="2.5">KPE</text>
              </g>
            </g>
          </g>

          {/* ========================================================
              LAYER 7: URA PLANNING AREAS (SUBTLE OVERLAY WITH LOW-OPACITY)
             ======================================================== */}
          {showUraBoundaries && (
            <g id="ura-areas-subtle-overlay">
              {URA_AREAS.map((area) => {
                const isHovered = hoveredArea === area.name;
                return (
                  <g key={area.id}>
                    <path
                      d={area.path}
                      fill={isHovered ? '#3b82f6' : '#2563eb'}
                      fillOpacity={isHovered ? 0.09 : 0.015}
                      stroke="#475569"
                      strokeWidth={isHovered ? '1.2' : '0.75'}
                      strokeDasharray="4 3"
                      strokeOpacity={isHovered ? 0.8 : 0.3}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-colors duration-150"
                      onMouseEnter={() => setHoveredArea(area.name)}
                      onMouseLeave={() => setHoveredArea(null)}
                      onClick={() => setHoveredArea(area.name)}
                    />
                    {/* Refined, small non-intrusive URA planning area label */}
                    <text
                      x={area.center.x}
                      y={area.center.y}
                      fontSize="7.5"
                      fill="#475569"
                      fontWeight="600"
                      textAnchor="middle"
                      pointerEvents="none"
                      className="select-none"
                      opacity={isHovered ? 0.95 : 0.55}
                      letterSpacing="0.2"
                    >
                      {area.name.split('&')[0].trim()}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ========================================================
              LAYER 8: GPS VEHICLE MARKERS (TOP LAYER, PINPOINT ACCURACY)
             ======================================================== */}
          <g id="van-gps-markers">
            {vehicles.map((vehicle, idx) => {
              const delayed = isVehicleDelayed(vehicle);
              const isSelected = selectedVehicleId === vehicle.id;
              const { x, y } = vehicle.gpsLocation;

              return (
                <g
                  key={vehicle.id}
                  id={`marker-${vehicle.id}`}
                  transform={`translate(${x}, ${y}) scale(${markerScale})`}
                  className="cursor-pointer group interactive-marker"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVehicle(vehicle.id);
                  }}
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
