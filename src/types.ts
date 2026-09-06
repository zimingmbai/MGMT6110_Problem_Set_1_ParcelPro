export type DeliveryStatus = 'in_transit' | 'scheduled' | 'completed' | 'delayed';
export type TransitStage = 'Picking Up' | 'In Transit' | 'Delivered';

export interface Delivery {
  id: string;
  item: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupUra: string;
  dropoffUra: string;
  estimatedTime: string;
  estimatedDistance: string;
  status: DeliveryStatus;
  isDelayed: boolean;
  isInTransit?: boolean;
  transitStage?: TransitStage;
  sequence: number; // 1 to 10 sequence
  notes?: string;
}

export interface Vehicle {
  id: string;
  managerId: string;
  carPlate: string;
  driverName: string;
  driverContact: string;
  uraArea: string;
  // Normalized coordinates for SVG rendering on Singapore map (0 - 1000 width, 0 - 620 height)
  gpsLocation: {
    x: number;
    y: number;
    lat: number;
    lng: number;
  };
  deliveries: Delivery[]; // Max 10 deliveries
}

export interface Manager {
  id: string;
  name: string;
  role: string;
  assignedFleetName: string;
  focusRegion: string;
  phone: string;
}

export interface UraAreaBoundary {
  id: string;
  name: string;
  region: 'Central' | 'East' | 'North' | 'North-East' | 'West';
  path: string; // SVG path
  center: { x: number; y: number };
}
