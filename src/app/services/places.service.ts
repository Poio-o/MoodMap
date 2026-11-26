import { computed, inject, Injectable, signal } from '@angular/core';
import { Place, PlaceCategory } from '../models/place.model';
import { DisputeReport, Review } from '../models/review.model';
import { ContextEngineService } from './context-engine.service';

const INITIAL_PLACES: Place[] = [
  // ── LOCALES REALES DE MÁLAGA ─────────────────────────────────────────────
  {
    id: 'mercado-atarazanas',
    name: 'Mercado Central de Atarazanas',
    category: 'Mercado',
    kind: 'local',
    distance: '120 m',
    address: 'Calle Atarazanas, 10',
    description: 'Mercado municipal histórico en el Centro de Málaga. Gran afluencia, ecos bajo la cristalera y murmullo intenso por las mañanas.',
    coordinates: { x: 38, y: 50 },
    geoCoordinates: { lat: 36.7185, lng: -4.4241 },
    baseSensory: { noise: 72, lighting: 68, crowd: 78 },
    color: '#b76551',
    reliability: 94,
    reviewsCount: 318,
    verified: true,
    openingHours: '08:00 — 15:00',
    recommendedSlot: '13:45 — 14:45',
    environmentalFactors: [
      {
        id: 'factor-atarazanas-morning',
        type: 'shopping_mall_parking',
        name: 'Actividad máxima de puestos',
        description: 'De 9:00 a 13:00 h hay voces continuas, carros metálicos y música ambiental de bares cercanos.',
        distanceMeters: 0,
        noiseImpactDelta: 26,
        crowdImpactDelta: 32,
        activeHours: [9, 10, 11, 12, 13],
        peakMinuteNotes: 'Máxima afluencia entre las 10:00 y las 12:30',
      },
      {
        id: 'factor-metro-atarazanas-merc',
        type: 'metro',
        name: 'Metro de Málaga (Atarazanas) a 110 m',
        description: 'Salida constante de pasajeros de las líneas 1 y 2 hacia el mercado y Alameda.',
        distanceMeters: 110,
        noiseImpactDelta: 14,
        crowdImpactDelta: 18,
        activeHours: [8, 9, 10, 13, 14, 18, 19, 20],
        peakMinuteNotes: 'Trenes de Metro cada 5-7 min en hora punta',
      },
    ],
  },
  {
    id: 'estacion-maria-zambrano',
    name: 'Estación Málaga María Zambrano',
    category: 'Estación',
    kind: 'local',
    distance: '1,1 km',
    address: 'Explanada de la Estación, s/n',
    description: 'Terminal AVE, Cercanías C1-C2, enlace con Metro El Perchel y Centro Comercial Vialia. Megafonía frecuente y gran flujo de maletas.',
    coordinates: { x: 16, y: 74 },
    geoCoordinates: { lat: 36.7116, lng: -4.4316 },
    baseSensory: { noise: 76, lighting: 72, crowd: 80 },
    color: '#c27d38',
    reliability: 97,
    reviewsCount: 412,
    verified: true,
    openingHours: '05:00 — 00:30',
    recommendedSlot: '11:30 — 13:00',
    environmentalFactors: [
      {
        id: 'factor-ave-arrivals',
        type: 'train_station',
        name: 'Llegadas AVE, Cercanías y Metro El Perchel',
        description: 'Megafonía de andén, frenado de trenes y oleadas masivas de viajeros en el vestíbulo.',
        distanceMeters: 0,
        noiseImpactDelta: 30,
        crowdImpactDelta: 35,
        activeHours: [7, 8, 9, 14, 15, 18, 19, 20],
        peakMinuteNotes: 'Cercanías cada 20 min; Metro cada 6 min; AVE a las :05 y :35',
      },
      {
        id: 'factor-cc-vialia',
        type: 'shopping_mall_parking',
        name: 'Centro Comercial Vialia y parking subterráneo',
        description: 'Música comercial de galería, pantallas luminosas y circulación continua en accesos.',
        distanceMeters: 20,
        noiseImpactDelta: 18,
        crowdImpactDelta: 22,
        lightingImpactDelta: 14,
        activeHours: [10, 11, 12, 13, 17, 18, 19, 20, 21],
      },
    ],
  },
  {
    id: 'cc-larios-centro',
    name: 'Centro Comercial Larios Centro',
    category: 'Centro Comercial',
    kind: 'local',
    distance: '1,0 km',
    address: 'Av. de la Aurora, 25',
    description: 'Gran centro comercial junto a la estación de autobuses y cruce con Av. de Andalucía. Iluminación LED blanca potente y megafonía.',
    coordinates: { x: 14, y: 58 },
    geoCoordinates: { lat: 36.7145, lng: -4.4326 },
    baseSensory: { noise: 64, lighting: 78, crowd: 70 },
    color: '#8e5fa2',
    reliability: 91,
    reviewsCount: 285,
    verified: true,
    openingHours: '10:00 — 22:00',
    recommendedSlot: '10:00 — 11:45',
    environmentalFactors: [
      {
        id: 'factor-larios-centro-traffic',
        type: 'traffic_congestion',
        name: 'Congestión en Av. de Andalucía / Aurora',
        description: 'Tráfico muy denso, autobuses interurbanos y retenciones en la entrada al parking.',
        distanceMeters: 40,
        noiseImpactDelta: 24,
        crowdImpactDelta: 16,
        activeHours: [8, 9, 13, 14, 18, 19, 20],
        peakMinuteNotes: 'Retenciones frecuentes a la salida del trabajo (14h y 19h)',
      },
      {
        id: 'factor-larios-centro-parking',
        type: 'shopping_mall_parking',
        name: 'Parking subterráneo y zona de restauración',
        description: 'Eco de motores en rampas y alto murmullo en planta de ocio.',
        distanceMeters: 0,
        noiseImpactDelta: 22,
        crowdImpactDelta: 28,
        activeHours: [13, 14, 18, 19, 20, 21],
      },
    ],
  },
  {
    id: 'biblioteca-canovas',
    name: 'Biblioteca Cánovas del Castillo',
    category: 'Biblioteca',
    kind: 'local',
    distance: '750 m',
    address: 'Calle Ollerías, 32',
    description: 'Biblioteca pública provincial en el Centro Cultural MVA. Sala de estudio silenciosa, luz difusa y ambiente controlado.',
    coordinates: { x: 52, y: 22 },
    geoCoordinates: { lat: 36.7259, lng: -4.4219 },
    baseSensory: { noise: 14, lighting: 32, crowd: 18 },
    color: '#65806e',
    reliability: 99,
    reviewsCount: 97,
    verified: true,
    openingHours: '09:00 — 20:00',
    recommendedSlot: '09:30 — 13:00',
    environmentalFactors: [
      {
        id: 'factor-ollerias-school',
        type: 'school',
        name: 'Centros educativos en Calle Ollerías',
        description: 'Ligero bullicio exterior al entrar o salir alumnado; en el interior apenas se percibe.',
        distanceMeters: 220,
        noiseImpactDelta: 10,
        crowdImpactDelta: 14,
        activeHours: [9, 14, 17],
      },
    ],
  },
  {
    id: 'teatro-cervantes',
    name: 'Teatro Cervantes',
    category: 'Cultura',
    kind: 'local',
    distance: '550 m',
    address: 'Calle Ramos Marín, 2',
    description: 'Teatro histórico junto a Plaza de la Merced. Muy tranquilo entre semana por la mañana; bullicio notable antes y después de cada función.',
    coordinates: { x: 64, y: 30 },
    geoCoordinates: { lat: 36.7244, lng: -4.4184 },
    baseSensory: { noise: 24, lighting: 40, crowd: 28 },
    color: '#7a6080',
    reliability: 90,
    reviewsCount: 143,
    verified: true,
    openingHours: '10:00 — 23:00 (según función)',
    recommendedSlot: '10:00 — 13:00',
    environmentalFactors: [
      {
        id: 'factor-show-exit',
        type: 'nightlife',
        name: 'Entrada y salida de funciones',
        description: 'Concentración en la puerta antes de empezar (20h) y al finalizar las representaciones (22-23h).',
        distanceMeters: 0,
        noiseImpactDelta: 28,
        crowdImpactDelta: 34,
        activeHours: [20, 22, 23],
        peakMinuteNotes: 'Pico de 15-20 min alrededor de las 20:00 y 22:30',
      },
    ],
  },
  {
    id: 'cafe-central',
    name: 'Café Central (Plaza de la Constitución)',
    category: 'Cafetería',
    kind: 'local',
    distance: '220 m',
    address: 'Plaza de la Constitución, 11',
    description: 'Café emblemático en la cabecera de Calle Larios. Interior resguardado; terraza muy expuesta al bullicio y a las luces en fechas señaladas.',
    coordinates: { x: 48, y: 40 },
    geoCoordinates: { lat: 36.7215, lng: -4.4216 },
    baseSensory: { noise: 52, lighting: 56, crowd: 58 },
    color: '#4f78a8',
    reliability: 89,
    reviewsCount: 276,
    verified: true,
    openingHours: '07:30 — 23:00',
    recommendedSlot: '07:30 — 09:30',
    environmentalFactors: [
      {
        id: 'factor-larios-terraza',
        type: 'festive_lights',
        name: 'Luces y música de Calle Larios a 40 m',
        description: 'Los pases musicales de Navidad (18:30, 20:00, 22:00) multiplican la luz ambiental, el sonido y la multitud en la plaza.',
        distanceMeters: 40,
        noiseImpactDelta: 26,
        crowdImpactDelta: 32,
        lightingImpactDelta: 28,
        activeHours: [18, 19, 20, 21, 22],
        peakMinuteNotes: 'Pases de luz y sonido a las 18:30, 20:00 y 22:00',
      },
      {
        id: 'factor-plaza-constitucion',
        type: 'pedestrian_quiet',
        name: 'Entorno 100% peatonal',
        description: 'Sin coches ni motos; el sonido procede únicamente de conversaciones y peatones.',
        distanceMeters: 0,
        noiseImpactDelta: -6,
        crowdImpactDelta: 8,
        activeHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      },
    ],
  },
  // ── ZONAS REALES DE MÁLAGA ───────────────────────────────────────────────
  {
    id: 'zona-calle-larios',
    name: 'Calle Larios (Luces de Navidad)',
    category: 'Zona de calle',
    kind: 'zone',
    distance: '150 m',
    address: 'Calle Marqués de Larios',
    description: 'Principal eje comercial peatonal de Málaga. Con el alumbrado navideño hay arcos LED muy brillantes, música sincronizada a alto volumen y aglomeración extrema al caer la tarde.',
    coordinates: { x: 48, y: 46 },
    geoCoordinates: { lat: 36.7203, lng: -4.4216 },
    zoneRadius: 160,
    baseSensory: { noise: 62, lighting: 64, crowd: 72 },
    color: '#b76551',
    reliability: 96,
    reviewsCount: 532,
    verified: true,
    openingHours: 'Peatonal 24h · Luces 18:30 — 24:00',
    recommendedSlot: '08:00 — 10:15',
    environmentalFactors: [
      {
        id: 'factor-luces-navidad',
        type: 'festive_lights',
        name: 'Luces de Navidad y espectáculo musical',
        description: 'Arcos LED de altísima luminosidad con destellos rítmicos y altavoces en toda la calle. Sobrecarga visual, auditiva y de público.',
        distanceMeters: 0,
        noiseImpactDelta: 34,
        crowdImpactDelta: 38,
        lightingImpactDelta: 42,
        activeHours: [18, 19, 20, 21, 22, 23],
        peakMinuteNotes: 'Pases de música y luces sincronizadas cada tarde (18:30, 20:00 y 22:00)',
      },
      {
        id: 'factor-larios-dia',
        type: 'pedestrian_quiet',
        name: 'Eje comercial peatonal con alto tránsito',
        description: 'Sin tráfico rodado, pero con flujo continuo de compras y visitantes durante el horario comercial.',
        distanceMeters: 0,
        noiseImpactDelta: 12,
        crowdImpactDelta: 18,
        activeHours: [11, 12, 13, 14, 16, 17],
      },
    ],
  },
  {
    id: 'zona-alameda-metro',
    name: 'Alameda Principal · Metro Atarazanas',
    category: 'Zona de calle',
    kind: 'zone',
    distance: '80 m',
    address: 'Alameda Principal / Boca Metro Atarazanas',
    description: 'Nudo de tráfico e intercambiador de autobuses EMT y Metro de Málaga. Alta contaminación acústica por motores, frenazos, cláxones y salidas continuas del metro.',
    coordinates: { x: 46, y: 58 },
    geoCoordinates: { lat: 36.7174, lng: -4.4222 },
    zoneRadius: 190,
    baseSensory: { noise: 68, lighting: 60, crowd: 66 },
    color: '#c27d38',
    reliability: 95,
    reviewsCount: 264,
    verified: true,
    openingHours: 'Metro 06:30 — 23:00 · Tráfico 24h',
    recommendedSlot: '06:30 — 07:30 o 22:00+',
    environmentalFactors: [
      {
        id: 'factor-metro-atarazanas',
        type: 'metro',
        name: 'Metro de Málaga · Estación Atarazanas',
        description: 'Vibración leve al paso subterráneo de unidades L1/L2 y oleadas de viajeros saliendo a la Alameda cada pocos minutos.',
        distanceMeters: 20,
        noiseImpactDelta: 22,
        crowdImpactDelta: 28,
        activeHours: [7, 8, 9, 13, 14, 15, 18, 19, 20, 21],
        peakMinuteNotes: 'Frecuencia de metro cada 5-6 min en hora punta; salidas en grupo',
      },
      {
        id: 'factor-alameda-congestion',
        type: 'traffic_congestion',
        name: 'Congestión de tráfico y cabecera EMT',
        description: 'Paradas de casi todas las líneas urbanas, acelerones de autobuses, taxis y retenciones frecuentes.',
        distanceMeters: 0,
        noiseImpactDelta: 26,
        crowdImpactDelta: 22,
        activeHours: [8, 9, 10, 13, 14, 15, 18, 19, 20],
        peakMinuteNotes: 'Atascos y bocinas habituales entre 13:30-15:00 y 18:00-20:30',
      },
    ],
  },
  {
    id: 'zona-soho-malaga',
    name: 'Barrio del Soho',
    category: 'Zona de calle',
    kind: 'zone',
    distance: '380 m',
    address: 'C/ Tomás Heredia · C/ Trinidad Grund',
    description: 'Barrio cultural de calles semi-peatonales y arte urbano. Tranquilo durante la mañana; ambiente más ruidoso en terrazas de noche y cerca de la Alameda.',
    coordinates: { x: 40, y: 68 },
    geoCoordinates: { lat: 36.7158, lng: -4.4234 },
    zoneRadius: 210,
    baseSensory: { noise: 40, lighting: 48, crowd: 38 },
    color: '#7a5fa0',
    reliability: 88,
    reviewsCount: 112,
    verified: true,
    openingHours: 'Espacio público 24h',
    recommendedSlot: '09:30 — 13:00',
    environmentalFactors: [
      {
        id: 'factor-soho-metro-edge',
        type: 'metro',
        name: 'Proximidad Metro Atarazanas / Alameda',
        description: 'El borde norte del Soho recibe ruido de paso de tráfico y salidas del metro.',
        distanceMeters: 180,
        noiseImpactDelta: 16,
        crowdImpactDelta: 15,
        activeHours: [8, 9, 14, 18, 19, 20],
      },
      {
        id: 'factor-soho-noche',
        type: 'nightlife',
        name: 'Terrazas y ocio nocturno',
        description: 'Aumento de conversaciones en acera y música de bares a partir de las 21:00.',
        distanceMeters: 0,
        noiseImpactDelta: 26,
        crowdImpactDelta: 30,
        activeHours: [21, 22, 23],
        peakMinuteNotes: 'Mayor bullicio en C/ Tomás Heredia de 21:30 a 00:00',
      },
    ],
  },
  {
    id: 'parque-alameda',
    name: 'Paseo del Parque (Jardines)',
    category: 'Parque',
    kind: 'zone',
    distance: '650 m',
    address: 'Paseo del Parque, s/n',
    description: 'Parque botánico subtropical paralelo al puerto. El interior ajardinado amortigua bastante el sonido, aunque el lateral norte tiene tráfico intenso de autobuses.',
    coordinates: { x: 66, y: 54 },
    geoCoordinates: { lat: 36.7192, lng: -4.4150 },
    zoneRadius: 240,
    baseSensory: { noise: 34, lighting: 36, crowd: 25 },
    color: '#527da9',
    reliability: 94,
    reviewsCount: 145,
    verified: true,
    openingHours: 'Abierto 24h',
    recommendedSlot: '08:00 — 11:30',
    environmentalFactors: [
      {
        id: 'factor-parque-traffic-edge',
        type: 'traffic_congestion',
        name: 'Tráfico lateral de Paseo del Parque',
        description: 'Paso constante de autobuses y vehículos en la calzada norte.',
        distanceMeters: 90,
        noiseImpactDelta: 18,
        crowdImpactDelta: 10,
        activeHours: [8, 9, 14, 18, 19, 20],
      },
      {
        id: 'factor-parque-verde',
        type: 'pedestrian_quiet',
        name: 'Absorción acústica vegetal',
        description: 'Los ficus y palmeras reducen el eco y crean sombra suave frente a la luz directa.',
        distanceMeters: 0,
        noiseImpactDelta: -14,
        crowdImpactDelta: -6,
        activeHours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      },
    ],
  },
  {
    id: 'zona-puerto-malaga',
    name: 'Muelle Uno · Puerto de Málaga',
    category: 'Puerto / Paseo',
    kind: 'zone',
    distance: '1,0 km',
    address: 'Muelle Uno, Puerto de Málaga',
    description: 'Paseo marítimo abierto con tiendas y restaurantes. Espacioso por las mañanas; muy concurrido al desembarcar cruceros o en tardes de paseo.',
    coordinates: { x: 76, y: 68 },
    geoCoordinates: { lat: 36.7155, lng: -4.4117 },
    zoneRadius: 220,
    baseSensory: { noise: 42, lighting: 56, crowd: 44 },
    color: '#3a7a8a',
    reliability: 89,
    reviewsCount: 132,
    verified: true,
    openingHours: 'Paseo 24h · Comercios 10:00 — 22:00',
    recommendedSlot: '08:00 — 10:30',
    environmentalFactors: [
      {
        id: 'factor-cruceros',
        type: 'shopping_mall_parking',
        name: 'Escala de cruceros y música de terrazas',
        description: 'Grupos numerosos de visitantes, música ambiental y alta actividad en restauración.',
        distanceMeters: 0,
        noiseImpactDelta: 22,
        crowdImpactDelta: 34,
        activeHours: [11, 12, 13, 18, 19, 20, 21],
        peakMinuteNotes: 'Mayor afluencia al atardecer (18:30-21:00) y mañanas de crucero',
      },
    ],
  },
  {
    id: 'zona-playa-malagueta',
    name: 'Playa de la Malagueta',
    category: 'Playa',
    kind: 'zone',
    distance: '1,5 km',
    address: 'Paseo Marítimo Pablo Ruiz Picasso',
    description: 'Amplia playa urbana junto a La Farola. Sonido constante y relajante del mar a primera hora; mayor bullicio en zona de chiringuitos al mediodía y tarde.',
    coordinates: { x: 88, y: 60 },
    geoCoordinates: { lat: 36.7173, lng: -4.4060 },
    zoneRadius: 280,
    baseSensory: { noise: 35, lighting: 62, crowd: 34 },
    color: '#4c8fa0',
    reliability: 91,
    reviewsCount: 184,
    verified: true,
    openingHours: 'Acceso libre 24h',
    recommendedSlot: '07:30 — 10:30',
    environmentalFactors: [
      {
        id: 'factor-verano-playa',
        type: 'nightlife',
        name: 'Chiringuitos y paseo marítimo',
        description: 'Ambiente animado en chiringuitos y terrazas, especialmente al mediodía y atardecer.',
        distanceMeters: 40,
        noiseImpactDelta: 24,
        crowdImpactDelta: 32,
        activeHours: [13, 14, 15, 18, 19, 20],
        peakMinuteNotes: 'Más gente entre las 13:30-16:00 y al atardecer',
      },
      {
        id: 'factor-mar-brisa',
        type: 'pedestrian_quiet',
        name: 'Sonido blanco del oleaje',
        description: 'El mar actúa como enmascarador natural frente al tráfico del paseo marítimo.',
        distanceMeters: 0,
        noiseImpactDelta: -8,
        crowdImpactDelta: -5,
        activeHours: [7, 8, 9, 10, 21, 22, 23],
      },
    ],
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    placeId: 'mercado-atarazanas',
    placeName: 'Mercado de Atarazanas',
    userId: 'user-sofia',
    userName: 'Sofía P.',
    userAvatar: 'SP',
    kind: 'local',
    noiseLevel: 4,
    lightingLevel: 4,
    crowdLevel: 5,
    dayOfWeek: 'Sábado',
    timeSlot: '10:30 — 12:00',
    timePreset: 'custom',
    comment: 'Los sábados por la mañana es una locura. Muchísimo ruido, gente por todos lados. Mejor ir entre semana antes de las 9.',
    createdAt: 'Hace 3 horas',
    confirmationsCount: 22,
    isConfirmedByMe: false,
  },
  {
    id: 'rev-2',
    placeId: 'biblioteca-canovas',
    placeName: 'Biblioteca Cánovas del Castillo',
    userId: 'user-marcos',
    userName: 'Marcos L.',
    userAvatar: 'ML',
    kind: 'local',
    noiseLevel: 1,
    lightingLevel: 2,
    crowdLevel: 1,
    dayOfWeek: 'Martes',
    timeSlot: '09:30 — 13:00',
    timePreset: '2h',
    comment: 'Perfecto para estudiar. Sala de lectura con luz cálida y casi sin ruido. Personal muy atento.',
    createdAt: 'Hoy a las 10:00',
    confirmationsCount: 11,
    isConfirmedByMe: false,
  },
  {
    id: 'rev-3',
    placeId: 'zona-calle-larios',
    placeName: 'Calle Larios (Navidad)',
    userId: 'user-ainhoa',
    userName: 'Ainhoa R.',
    userAvatar: 'AR',
    kind: 'zone',
    zoneRadius: 160,
    noiseLevel: 5,
    lightingLevel: 5,
    crowdLevel: 5,
    dayOfWeek: 'Viernes',
    timeSlot: '19:00 — 20:30',
    timePreset: 'custom',
    comment: 'El espectáculo de luces es bonito, pero el ruido y la cantidad de gente es completamente abrumador. No recomendable para personas con sensibilidad sensorial.',
    createdAt: 'Ayer',
    confirmationsCount: 47,
    isConfirmedByMe: false,
  },
];

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private readonly contextEngine = inject(ContextEngineService);

  readonly places = signal<Place[]>(this.loadPlaces());
  readonly reviews = signal<Review[]>(this.loadReviews());
  readonly disputeReports = signal<DisputeReport[]>([]);

  readonly selectedPlaceId = signal<string | null>(null);
  readonly transientSelectedPlace = signal<Place | null>(null);
  readonly focusGeoRequest = signal<{ lat: number; lng: number } | null>(null);
  readonly currentView = signal<'map' | 'list' | 'detail' | 'review'>('map');
  readonly selectedCategory = signal<string>('Todos');
  readonly simulatedHour = signal<number>(new Date().getHours()); // User can test any hour
  readonly isSimulatingHour = signal<boolean>(false);
  readonly theme = signal<'light' | 'dark'>(this.loadTheme());

  readonly selectedPlace = computed(() => {
    const id = this.selectedPlaceId();
    if (!id) return null;
    const found = this.places().find((p) => p.id === id);
    if (found) return found;
    const transient = this.transientSelectedPlace();
    return transient && transient.id === id ? transient : null;
  });

  readonly filteredPlaces = computed(() => {
    const cat = this.selectedCategory();
    const list = this.places();
    if (cat === 'Todos') return list;
    if (cat === 'Zonas abiertas') return list.filter((p) => p.kind === 'zone');
    if (cat === 'Locales') return list.filter((p) => p.kind === 'local');
    if (cat === 'Playas / Puerto') {
      return list.filter((p) => p.category === 'Playa' || p.category === 'Puerto / Paseo');
    }
    return list.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase().slice(0, 5)));
  });

  // Effective sensory status for currently selected place under simulated/current hour
  readonly effectiveSelectedSensory = computed(() => {
    const place = this.selectedPlace();
    if (!place) return null;
    const hour = this.simulatedHour();
    return this.contextEngine.calculateDynamicSensory(place, hour);
  });

  readonly selectedPlaceForecast = computed(() => {
    const place = this.selectedPlace();
    if (!place) return [];
    return this.contextEngine.generateScheduleForecast(place);
  });

  readonly selectedPlaceReviews = computed(() => {
    const place = this.selectedPlace();
    if (!place) return [];
    return this.reviews().filter((r) => r.placeId === place.id);
  });

  constructor() {
    this.applyTheme(this.theme());
  }

  selectPlace(id: string) {
    this.transientSelectedPlace.set(null);
    this.selectedPlaceId.set(id);
    const place = this.places().find((p) => p.id === id);
    if (place?.geoCoordinates) {
      this.focusGeoRequest.set({ ...place.geoCoordinates });
    }
  }

  selectExternalPlace(place: Place, flyTo = false) {
    const existing = this.places().find((p) => p.id === place.id);
    if (existing) {
      this.selectPlace(existing.id);
      return;
    }
    this.transientSelectedPlace.set(place);
    this.selectedPlaceId.set(place.id);
    if (flyTo && place.geoCoordinates) {
      this.focusGeoRequest.set({ ...place.geoCoordinates });
    }
  }

  promoteExternalPlace(place: Place): Place {
    const existing = this.places().find((p) => p.id === place.id);
    if (existing) return existing;
    const savedPlace: Place = {
      ...place,
      isOsmDiscovered: false,
    };
    const updated = [savedPlace, ...this.places()];
    this.places.set(updated);
    this.savePlaces(updated);
    this.transientSelectedPlace.set(null);
    this.selectedPlaceId.set(savedPlace.id);
    return savedPlace;
  }

  clearSelection() {
    this.selectedPlaceId.set(null);
    this.transientSelectedPlace.set(null);
  }

  setView(view: 'map' | 'list' | 'detail' | 'review') {
    this.currentView.set(view);
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSimulatedHour(hour: number) {
    this.simulatedHour.set(Math.max(0, Math.min(23, hour)));
    this.isSimulatingHour.set(true);
  }

  resetSimulatedHour() {
    this.simulatedHour.set(new Date().getHours());
    this.isSimulatingHour.set(false);
  }

  toggleTheme() {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('moodmap-theme', next);
    this.applyTheme(next);
  }

  addReview(newReview: Omit<Review, 'id' | 'createdAt' | 'confirmationsCount'>): Review {
    // If reviewing a newly discovered OSM place, promote it to MoodMap first
    const transient = this.transientSelectedPlace();
    if (transient && transient.id === newReview.placeId) {
      this.promoteExternalPlace(transient);
    }

    const review: Review = {
      ...newReview,
      id: 'rev-' + Date.now(),
      createdAt: 'Hace un momento',
      confirmationsCount: 1,
      isConfirmedByMe: true,
    };

    const updatedReviews = [review, ...this.reviews()];
    this.reviews.set(updatedReviews);
    this.saveReviews(updatedReviews);

    // If it's a review for an existing place, slightly adjust place stats & review count
    this.places.update((current) =>
      current.map((p) => {
        if (p.id !== review.placeId) return p;
        const newCount = p.reviewsCount + 1;
        // Recalculate slightly
        const weight = 0.15;
        const mappedNoise = (review.noiseLevel / 5) * 100;
        const mappedLighting = (review.lightingLevel / 5) * 100;
        const mappedCrowd = (review.crowdLevel / 5) * 100;

        return {
          ...p,
          reviewsCount: newCount,
          baseSensory: {
            noise: Math.round(p.baseSensory.noise * (1 - weight) + mappedNoise * weight),
            lighting: Math.round(p.baseSensory.lighting * (1 - weight) + mappedLighting * weight),
            crowd: Math.round(p.baseSensory.crowd * (1 - weight) + mappedCrowd * weight),
          },
        };
      })
    );
    this.savePlaces(this.places());

    return review;
  }

  addNewZone(zoneData: {
    name: string;
    description: string;
    coordinates: { x: number; y: number };
    geoCoordinates?: { lat: number; lng: number };
    zoneRadius: number;
    noiseLevel: number;
    lightingLevel: number;
    crowdLevel: number;
    timeSlot: string;
    comment?: string;
  }): Place {
    const mappedNoise = (zoneData.noiseLevel / 5) * 100;
    const mappedLighting = (zoneData.lightingLevel / 5) * 100;
    const mappedCrowd = (zoneData.crowdLevel / 5) * 100;

    const geo = zoneData.geoCoordinates || {
      lat: Number((36.7210 + (zoneData.coordinates.y - 50) * 0.0002).toFixed(5)),
      lng: Number((-4.4240 + (zoneData.coordinates.x - 50) * 0.0003).toFixed(5)),
    };

    const newZone: Place = {
      id: 'zone-' + Date.now(),
      name: zoneData.name || 'Zona sensorial personalizada',
      category: 'Zona de calle',
      kind: 'zone',
      distance: 'Aprox. 300 m',
      address: 'Zona seleccionada en mapa',
      description: zoneData.description || 'Área señalada por la comunidad con características sensoriales específicas.',
      coordinates: zoneData.coordinates,
      geoCoordinates: geo,
      zoneRadius: zoneData.zoneRadius,
      baseSensory: {
        noise: Math.round(mappedNoise),
        lighting: Math.round(mappedLighting),
        crowd: Math.round(mappedCrowd),
      },
      color: mappedNoise > 60 ? '#b76551' : mappedNoise > 35 ? '#c27d38' : '#4f78a8',
      reliability: 75,
      reviewsCount: 1,
      verified: false,
      openingHours: 'Espacio abierto',
      recommendedSlot: zoneData.timeSlot,
      environmentalFactors: [
        {
          id: 'factor-user-zone',
          type: 'pedestrian_quiet',
          name: 'Zona delimitada por usuario',
          description: `Radio de cobertura: ${zoneData.zoneRadius} m`,
          distanceMeters: 0,
          noiseImpactDelta: 0,
          crowdImpactDelta: 0,
          activeHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        },
      ],
    };

    const updated = [newZone, ...this.places()];
    this.places.set(updated);
    this.savePlaces(updated);

    // Also add as initial review
    this.addReview({
      placeId: newZone.id,
      placeName: newZone.name,
      userId: 'user-current',
      userName: 'Tú',
      userAvatar: 'TÚ',
      kind: 'zone',
      zoneRadius: zoneData.zoneRadius,
      zoneCoordinates: zoneData.coordinates,
      noiseLevel: zoneData.noiseLevel,
      lightingLevel: zoneData.lightingLevel,
      crowdLevel: zoneData.crowdLevel,
      dayOfWeek: 'Hoy',
      timeSlot: zoneData.timeSlot,
      timePreset: 'now',
      comment: zoneData.comment,
    });

    this.selectedPlaceId.set(newZone.id);
    return newZone;
  }

  confirmReview(reviewId: string) {
    this.reviews.update((current) =>
      current.map((r) => {
        if (r.id !== reviewId) return r;
        if (r.isConfirmedByMe) return r;
        return {
          ...r,
          confirmationsCount: r.confirmationsCount + 1,
          isConfirmedByMe: true,
        };
      })
    );
    this.saveReviews(this.reviews());

    // Boost place reliability
    const targetReview = this.reviews().find((r) => r.id === reviewId);
    if (targetReview) {
      this.places.update((current) =>
        current.map((p) => {
          if (p.id !== targetReview.placeId) return p;
          return {
            ...p,
            reliability: Math.min(99, p.reliability + 1),
          };
        })
      );
      this.savePlaces(this.places());
    }
  }

  submitDispute(report: Omit<DisputeReport, 'id' | 'createdAt'>) {
    const newReport: DisputeReport = {
      ...report,
      id: 'disp-' + Date.now(),
      createdAt: 'Ahora mismo',
    };
    this.disputeReports.update((reports) => [newReport, ...reports]);
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }

  private loadTheme(): 'light' | 'dark' {
    if (typeof localStorage === 'undefined') return 'light';
    return (localStorage.getItem('moodmap-theme') as 'light' | 'dark') || 'light';
  }

  private loadPlaces(): Place[] {
    if (typeof localStorage === 'undefined') return INITIAL_PLACES;
    // Version bump: if stored data is from Madrid (old), clear and use Málaga data
    const dataVersion = localStorage.getItem('moodmap-data-version');
    if (dataVersion !== '3') {
      localStorage.removeItem('moodmap-places');
      localStorage.removeItem('moodmap-reviews');
      localStorage.setItem('moodmap-data-version', '3');
      return INITIAL_PLACES;
    }
    try {
      const stored = localStorage.getItem('moodmap-places');
      if (!stored) return INITIAL_PLACES;
      const parsed = JSON.parse(stored) as Place[];
      return parsed.map((p) => {
        if (!p.geoCoordinates) {
          const match = INITIAL_PLACES.find((ip) => ip.id === p.id);
          p.geoCoordinates = match?.geoCoordinates || {
            lat: Number((36.7210 + (p.coordinates.y - 50) * 0.0002).toFixed(5)),
            lng: Number((-4.4240 + (p.coordinates.x - 50) * 0.0003).toFixed(5)),
          };
        }
        return p;
      });
    } catch {
      return INITIAL_PLACES;
    }
  }

  private savePlaces(places: Place[]) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('moodmap-places', JSON.stringify(places));
      } catch (e) {
        console.error('Failed to save places to localStorage', e);
      }
    }
  }

  private loadReviews(): Review[] {
    if (typeof localStorage === 'undefined') return INITIAL_REVIEWS;
    try {
      const stored = localStorage.getItem('moodmap-reviews');
      return stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  private saveReviews(reviews: Review[]) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('moodmap-reviews', JSON.stringify(reviews));
      } catch (e) {
        console.error('Failed to save reviews to localStorage', e);
      }
    }
  }
}
