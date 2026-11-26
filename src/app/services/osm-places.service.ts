import { Injectable, signal } from '@angular/core';
import { EnvironmentalFactor, Place, PlaceCategory, SensoryLevels } from '../models/place.model';

interface MalagaAnchor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  type: EnvironmentalFactor['type'];
  noiseImpactDelta: number;
  crowdImpactDelta: number;
  lightingImpactDelta?: number;
  activeHours: number[];
  description: string;
  peakMinuteNotes?: string;
}

const MALAGA_ANCHORS: MalagaAnchor[] = [
  {
    id: 'anchor-metro-atarazanas',
    name: 'Metro de Málaga · Atarazanas',
    lat: 36.7174,
    lng: -4.4222,
    radiusMeters: 300,
    type: 'metro',
    noiseImpactDelta: 20,
    crowdImpactDelta: 24,
    activeHours: [7, 8, 9, 13, 14, 15, 18, 19, 20, 21],
    description: 'Proximidad a la estación de Metro (L1/L2) con paso continuo y salida de viajeros.',
    peakMinuteNotes: 'Metro cada 5-6 min en hora punta',
  },
  {
    id: 'anchor-metro-guadalmedina',
    name: 'Metro de Málaga · Guadalmedina',
    lat: 36.7166,
    lng: -4.4282,
    radiusMeters: 300,
    type: 'metro',
    noiseImpactDelta: 20,
    crowdImpactDelta: 24,
    activeHours: [7, 8, 9, 13, 14, 15, 18, 19, 20, 21],
    description: 'Intercambiador de metro cercano; vibración leve y flujo constante de peatones.',
    peakMinuteNotes: 'Metro cada 5-6 min en hora punta',
  },
  {
    id: 'anchor-metro-perchel',
    name: 'Estación María Zambrano / Metro El Perchel',
    lat: 36.7116,
    lng: -4.4316,
    radiusMeters: 380,
    type: 'train_station',
    noiseImpactDelta: 26,
    crowdImpactDelta: 30,
    activeHours: [7, 8, 9, 14, 15, 18, 19, 20],
    description: 'Nudo ferroviario AVE, Cercanías y Metro con alta afluencia de viajeros.',
    peakMinuteNotes: 'Cercanías cada 20 min y llegadas AVE',
  },
  {
    id: 'anchor-larios-lights',
    name: 'Calle Larios · Iluminación y eje comercial',
    lat: 36.7203,
    lng: -4.4216,
    radiusMeters: 220,
    type: 'festive_lights',
    noiseImpactDelta: 28,
    crowdImpactDelta: 34,
    lightingImpactDelta: 36,
    activeHours: [18, 19, 20, 21, 22, 23],
    description: 'Zona de luces navideñas, música sincronizada y gran densidad peatonal al anochecer.',
    peakMinuteNotes: 'Pases de luz y sonido a las 18:30, 20:00 y 22:00',
  },
  {
    id: 'anchor-alameda-traffic',
    name: 'Congestión Alameda Principal / EMT',
    lat: 36.7175,
    lng: -4.4218,
    radiusMeters: 240,
    type: 'traffic_congestion',
    noiseImpactDelta: 24,
    crowdImpactDelta: 18,
    activeHours: [8, 9, 10, 13, 14, 15, 18, 19, 20],
    description: 'Eje principal de autobuses urbanos y tráfico denso con paradas frecuentes.',
    peakMinuteNotes: 'Mayor densidad de tráfico a mediodía y tarde',
  },
  {
    id: 'anchor-parque-malaga',
    name: 'Arboleda del Paseo del Parque',
    lat: 36.7192,
    lng: -4.4150,
    radiusMeters: 180,
    type: 'pedestrian_quiet',
    noiseImpactDelta: -12,
    crowdImpactDelta: -6,
    activeHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    description: 'Vegetación densa que amortigua el sonido urbano y suaviza la luz.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class OsmPlacesService {
  readonly osmPlaces = signal<Place[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly statusMessage = signal<string | null>(null);
  readonly searchResults = signal<Place[]>([]);
  readonly isSearching = signal<boolean>(false);

  private readonly cache = new Map<string, Place[]>();
  private lastOverpassRequestAt = 0;

  /**
   * Resolves any clicked coordinate/building on the map via Nominatim reverse geocoding
   * so users can inspect existing real places without cluttering the map or overloading Overpass.
   */
  async inspectPointInMalaga(lat: number, lng: number): Promise<Place | null> {
    this.isLoading.set(true);
    this.statusMessage.set(null);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      if (!res.ok) {
        this.statusMessage.set('No se pudo consultar este punto ahora.');
        return null;
      }
      const item = await res.json();
      const category = this.inferCategoryFromNominatim(item.category || item.class, item.type);
      const addr = item.address || {};
      const streetName = addr.road
        ? `${addr.road}${addr.house_number ? ', ' + addr.house_number : ''}`
        : addr.pedestrian || addr.suburb || 'Málaga';
      const resolvedName =
        item.name?.trim() ||
        addr.amenity ||
        addr.shop ||
        addr.building ||
        streetName;

      return this.buildPlaceFromCoordinates({
        id: `osm-point-${item.osm_id || Date.now()}`,
        name: resolvedName,
        category,
        address: streetName,
        lat,
        lng,
        kind: category === 'Parque' || category === 'Zona de calle' || category === 'Playa' ? 'zone' : 'local',
      });
    } catch {
      this.statusMessage.set('Servicio de mapas ocupado, inténtalo en unos segundos.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Optional on-demand fetch with cooldown and fallback mirror (never auto-spammed on pan).
   */
  async fetchNearbyPlacesOnDemand(
    bounds: { south: number; west: number; north: number; east: number },
    existingPlaces: Place[]
  ): Promise<void> {
    const key = `${bounds.south.toFixed(3)},${bounds.west.toFixed(3)},${bounds.north.toFixed(3)},${bounds.east.toFixed(3)}`;
    const cached = this.cache.get(key);
    if (cached) {
      this.osmPlaces.set(this.deduplicatePlaces(cached, existingPlaces));
      return;
    }

    const now = Date.now();
    if (now - this.lastOverpassRequestAt < 15000) {
      this.statusMessage.set('Espera unos segundos antes de consultar otra zona.');
      return;
    }
    this.lastOverpassRequestAt = now;
    this.isLoading.set(true);
    this.statusMessage.set(null);

    const bbox = `${bounds.south.toFixed(5)},${bounds.west.toFixed(5)},${bounds.north.toFixed(5)},${bounds.east.toFixed(5)}`;
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"~"^(cafe|library|restaurant|theatre|cinema|marketplace)$"]["name"](${bbox});
        node["railway"~"^(station|subway_entrance)$"]["name"](${bbox});
        way["leisure"~"^(park|garden)$"]["name"](${bbox});
      );
      out center 25;
    `.trim();

    const endpoints = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
    ];

    try {
      let data: any = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query),
          });
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch {
          // try next mirror silently
        }
      }

      if (!data) {
        this.statusMessage.set('Los servidores públicos de OSM están ocupados; usa el buscador o haz clic en "Inspeccionar local".');
        return;
      }

      const elements = Array.isArray(data?.elements) ? data.elements : [];
      const parsed: Place[] = [];
      for (const el of elements) {
        const mapped = this.mapOsmElementToPlace(el);
        if (mapped) parsed.push(mapped);
      }

      const uniqueByName = new Map<string, Place>();
      for (const p of parsed) {
        const norm = p.name.trim().toLowerCase();
        if (!uniqueByName.has(norm)) uniqueByName.set(norm, p);
      }
      const cleanList = Array.from(uniqueByName.values()).slice(0, 25);
      this.cache.set(key, cleanList);
      this.osmPlaces.set(this.deduplicatePlaces(cleanList, existingPlaces));
    } finally {
      this.isLoading.set(false);
    }
  }

  async searchInMalaga(queryText: string): Promise<Place[]> {
    const q = queryText.trim();
    if (q.length < 3) {
      this.searchResults.set([]);
      return [];
    }

    this.isSearching.set(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&viewbox=-4.50,36.76,-4.35,36.68&bounded=1&q=${encodeURIComponent(q + ', Málaga')}`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'es' },
      });
      if (!res.ok) return [];
      const items = await res.json();
      const mapped: Place[] = (Array.isArray(items) ? items : []).map((item: any, idx: number) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const category = this.inferCategoryFromNominatim(item.category || item.class, item.type);
        const name = item.name || item.display_name?.split(',')[0] || q;
        const street = item.address?.road
          ? `${item.address.road}${item.address.house_number ? ', ' + item.address.house_number : ''}`
          : item.display_name?.split(',').slice(1, 3).join(',').trim() || 'Málaga';

        return this.buildPlaceFromCoordinates({
          id: `osm-search-${item.osm_id || idx}`,
          name,
          category,
          address: street,
          lat,
          lng,
          kind: category === 'Parque' || category === 'Zona de calle' || category === 'Playa' ? 'zone' : 'local',
        });
      });

      this.searchResults.set(mapped);
      return mapped;
    } catch {
      this.searchResults.set([]);
      return [];
    } finally {
      this.isSearching.set(false);
    }
  }

  buildPlaceFromCoordinates(input: {
    id: string;
    name: string;
    category: PlaceCategory;
    address: string;
    lat: number;
    lng: number;
    kind?: 'local' | 'zone';
  }): Place {
    const baseSensory = this.getCategoryBaseline(input.category);
    const factors = this.inferEnvironmentalFactors(input.lat, input.lng);
    const distanceFromCenter = this.haversineMeters(input.lat, input.lng, 36.7203, -4.4216);
    const distLabel =
      distanceFromCenter < 1000
        ? `${Math.round(distanceFromCenter)} m`
        : `${(distanceFromCenter / 1000).toFixed(1).replace('.', ',')} km`;

    return {
      id: input.id,
      name: input.name,
      category: input.category,
      kind: input.kind ?? 'local',
      distance: distLabel,
      address: input.address,
      description: `Lugar de OpenStreetMap (${input.category}). Niveles sensoriales estimados automáticamente según su entorno en Málaga.`,
      coordinates: { x: 50, y: 50 },
      geoCoordinates: { lat: input.lat, lng: input.lng },
      zoneRadius: input.kind === 'zone' ? 160 : undefined,
      baseSensory,
      color: this.getCategoryColor(input.category),
      reliability: 72,
      reviewsCount: 0,
      verified: false,
      isOsmDiscovered: true,
      openingHours: 'Según establecimiento',
      recommendedSlot: baseSensory.noise <= 35 ? '09:30 — 13:00' : '10:00 — 12:30',
      environmentalFactors: factors,
    };
  }

  private mapOsmElementToPlace(el: any): Place | null {
    const tags = el.tags || {};
    const name = tags.name?.trim();
    if (!name) return null;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    const category = this.inferCategoryFromOsmTags(tags);
    const street = tags['addr:street']
      ? `${tags['addr:street']}${tags['addr:housenumber'] ? ', ' + tags['addr:housenumber'] : ''}`
      : 'Málaga Centro';

    return this.buildPlaceFromCoordinates({
      id: `osm-${el.type}-${el.id}`,
      name,
      category,
      address: street,
      lat,
      lng,
      kind: 'local',
    });
  }

  private deduplicatePlaces(osmList: Place[], existing: Place[]): Place[] {
    return osmList.filter((osm) => {
      const osmName = osm.name.toLowerCase();
      return !existing.some((cur) => {
        const curName = cur.name.toLowerCase();
        if (curName.includes(osmName) || osmName.includes(curName)) return true;
        const dist = this.haversineMeters(
          osm.geoCoordinates.lat,
          osm.geoCoordinates.lng,
          cur.geoCoordinates.lat,
          cur.geoCoordinates.lng
        );
        return dist < 35 && cur.kind === 'local';
      });
    });
  }

  private inferEnvironmentalFactors(lat: number, lng: number): EnvironmentalFactor[] {
    const factors: EnvironmentalFactor[] = [];
    for (const anchor of MALAGA_ANCHORS) {
      const dist = Math.round(this.haversineMeters(lat, lng, anchor.lat, anchor.lng));
      if (dist <= anchor.radiusMeters) {
        factors.push({
          id: `${anchor.id}-${dist}`,
          type: anchor.type,
          name: anchor.name,
          description: anchor.description,
          distanceMeters: dist,
          noiseImpactDelta: anchor.noiseImpactDelta,
          crowdImpactDelta: anchor.crowdImpactDelta,
          lightingImpactDelta: anchor.lightingImpactDelta,
          activeHours: anchor.activeHours,
          peakMinuteNotes: anchor.peakMinuteNotes,
        });
      }
    }
    return factors;
  }

  private inferCategoryFromOsmTags(tags: Record<string, string>): PlaceCategory {
    if (tags['railway']) return 'Estación';
    if (tags['leisure'] === 'park' || tags['leisure'] === 'garden') return 'Parque';
    switch (tags['amenity']) {
      case 'cafe':
        return 'Cafetería';
      case 'library':
        return 'Biblioteca';
      case 'restaurant':
        return 'Restaurante';
      case 'theatre':
      case 'cinema':
        return 'Cultura';
      case 'marketplace':
        return 'Mercado';
      default:
        break;
    }
    if (tags['shop'] === 'mall' || tags['shop'] === 'department_store') return 'Centro Comercial';
    return 'Comercio';
  }

  private inferCategoryFromNominatim(cls?: string, type?: string): PlaceCategory {
    if (type === 'cafe') return 'Cafetería';
    if (type === 'library') return 'Biblioteca';
    if (type === 'restaurant' || type === 'bar') return 'Restaurante';
    if (type === 'theatre' || type === 'cinema' || type === 'museum') return 'Cultura';
    if (type === 'station' || type === 'subway_entrance' || cls === 'railway') return 'Estación';
    if (type === 'park' || type === 'garden') return 'Parque';
    if (type === 'beach') return 'Playa';
    if (type === 'mall' || type === 'department_store') return 'Centro Comercial';
    if (cls === 'highway' || type === 'pedestrian' || type === 'square') return 'Zona de calle';
    return 'Comercio';
  }

  private getCategoryBaseline(category: PlaceCategory): SensoryLevels {
    switch (category) {
      case 'Biblioteca':
        return { noise: 18, lighting: 36, crowd: 20 };
      case 'Parque':
        return { noise: 30, lighting: 42, crowd: 25 };
      case 'Cafetería':
        return { noise: 44, lighting: 48, crowd: 42 };
      case 'Cultura':
        return { noise: 30, lighting: 42, crowd: 34 };
      case 'Restaurante':
        return { noise: 56, lighting: 52, crowd: 56 };
      case 'Mercado':
        return { noise: 66, lighting: 64, crowd: 70 };
      case 'Estación':
        return { noise: 70, lighting: 64, crowd: 72 };
      case 'Centro Comercial':
        return { noise: 62, lighting: 74, crowd: 66 };
      default:
        return { noise: 48, lighting: 58, crowd: 46 };
    }
  }

  private getCategoryColor(category: PlaceCategory): string {
    switch (category) {
      case 'Cafetería':
        return '#3b6d8c';
      case 'Biblioteca':
        return '#3e745c';
      case 'Estación':
        return '#b4691e';
      case 'Parque':
      case 'Playa':
        return '#2f7a68';
      case 'Cultura':
        return '#675682';
      case 'Mercado':
      case 'Restaurante':
        return '#b15349';
      case 'Centro Comercial':
        return '#78568a';
      default:
        return '#486581';
    }
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
