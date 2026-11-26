export interface Review {
  id: string;
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  kind: 'local' | 'zone';
  zoneRadius?: number;
  zoneCoordinates?: { x: number; y: number };
  geoCoordinates?: { lat: number; lng: number };
  noiseLevel: number; // 1-5
  lightingLevel: number; // 1-5
  crowdLevel: number; // 1-5
  dayOfWeek: string;
  timeSlot: string; // e.g. "16:30 — 17:30"
  exactStartTime?: string; // e.g. "16:30"
  exactEndTime?: string; // e.g. "17:30"
  timePreset: 'now' | '2h' | 'day' | 'custom';
  comment?: string;
  createdAt: string;
  confirmationsCount: number;
  isConfirmedByMe?: boolean;
}

export interface DisputeReport {
  id: string;
  placeId: string;
  placeName: string;
  reason: 'Ruido' | 'Iluminación' | 'Aglomeración' | 'Horarios' | 'Factores del entorno';
  comment?: string;
  createdAt: string;
}
