export type PlaceKind = 'local' | 'zone';

export type PlaceCategory =
  | 'Cafetería'
  | 'Biblioteca'
  | 'Comercio'
  | 'Mercado'
  | 'Cultura'
  | 'Parque'
  | 'Playa'
  | 'Puerto / Paseo'
  | 'Estación'
  | 'Restaurante'
  | 'Zona de calle'
  | 'Centro Comercial';

export interface EnvironmentalFactor {
  id: string;
  type:
    | 'train_station'
    | 'metro'
    | 'traffic_congestion'
    | 'festive_lights'
    | 'shopping_mall_parking'
    | 'school'
    | 'nightlife'
    | 'pedestrian_quiet';
  name: string;
  description: string;
  distanceMeters: number;
  noiseImpactDelta: number; // e.g. +20 during peak
  crowdImpactDelta: number; // e.g. +30 during peak
  lightingImpactDelta?: number; // e.g. +35 for festive lights
  activeHours: number[]; // e.g. [8, 9, 14, 18, 19, 20]
  peakMinuteNotes?: string; // e.g. "Paso de tren a las :15 y :45"
}

export interface SensoryLevels {
  noise: number; // 0-100
  lighting: number; // 0-100
  crowd: number; // 0-100
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  kind: PlaceKind;
  distance: string;
  address: string;
  description: string;
  coordinates: { x: number; y: number }; // Percentage 0-100 in vector canvas
  geoCoordinates: { lat: number; lng: number }; // Real GPS coordinates (Lat, Lng)
  zoneRadius?: number; // In meters (for zones)
  baseSensory: SensoryLevels;
  color: string;
  reliability: number; // 0-100%
  reviewsCount: number;
  verified: boolean;
  isOsmDiscovered?: boolean;
  openingHours?: string;
  recommendedSlot?: string;
  environmentalFactors: EnvironmentalFactor[];
}

export interface HourlySensoryForecast {
  hour: string;
  hourNumber: number;
  noise: number;
  crowd: number;
  lighting: number;
  tone: 'calm' | 'medium' | 'busy';
  environmentalAlert?: string;
}
