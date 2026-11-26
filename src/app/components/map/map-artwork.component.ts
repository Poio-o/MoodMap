import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Place } from '../../models/place.model';
import { ContextEngineService } from '../../services/context-engine.service';
import { OsmPlacesService } from '../../services/osm-places.service';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

const STYLE_DAY = 'https://tiles.openfreemap.org/styles/positron';
const STYLE_NIGHT = 'https://tiles.openfreemap.org/styles/fiord';

@Component({
  selector: 'app-map-artwork',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="map-container"
      [class.inspect-cursor]="inspectMode()"
      aria-label="Mapa interactivo de estímulos sensoriales de Málaga"
    >
      <!-- Compact Environmental Context HUD -->
      <div class="env-context-hud" (click)="$event.stopPropagation()">
        <div class="env-chip" [class.highlight]="isTrainRushActive()">
          <app-icon name="train" [size]="15"></app-icon>
          <span>
            @if (isTrainRushActive()) {
              <strong>Metro / Cercanías:</strong> Hora punta en Málaga
            } @else {
              <strong>Metro / Tren:</strong> Frecuencia regular
            }
          </span>
        </div>

        <div class="env-chip" [class.highlight]="isLariosLightsActive() || isAlamedaTrafficActive()">
          <app-icon [name]="isLariosLightsActive() ? 'sparkles' : 'car'" [size]="15"></app-icon>
          <span>
            @if (isLariosLightsActive()) {
              <strong>Calle Larios:</strong> Luces, música y alta afluencia
            } @else if (isAlamedaTrafficActive()) {
              <strong>Alameda Principal:</strong> Tráfico denso
            } @else {
              <strong>Centro de Málaga:</strong> Tránsito moderado
            }
          </span>
        </div>

        @if (inspectMode()) {
          <div class="env-chip inspect-active-chip">
            <app-icon name="location" [size]="14"></app-icon>
            <span>Haz clic sobre cualquier calle o edificio para inspeccionarlo</span>
          </div>
        }

        @if (osmPlacesService.isLoading()) {
          <div class="env-chip loading-chip">
            <span class="mini-spinner"></span>
            <span>Consultando punto en Málaga...</span>
          </div>
        }

        @if (osmPlacesService.statusMessage(); as msg) {
          <div class="env-chip status-note-chip">
            <app-icon name="info" [size]="14"></app-icon>
            <span>{{ msg }}</span>
          </div>
        }
      </div>

      <!-- Clean Vector Map (MapLibre GL + OpenFreeMap without distracting POI icons) -->
      <div #realMapContainer class="real-map-canvas"></div>

      <!-- Floating Selected Place Preview Card -->
      @if (placesService.selectedPlace(); as selected) {
        <div class="floating-quick-card" (click)="$event.stopPropagation()">
          <div class="card-left">
            <div class="card-meta-badges">
              <span class="category-pill" [style.color]="selected.color">
                <app-icon [name]="getPlaceIcon(selected.category)" [size]="14"></app-icon>
                {{ selected.category }}
                @if (selected.kind === 'zone') {
                  · Radio {{ selected.zoneRadius || 180 }} m
                }
              </span>
              @if (selected.isOsmDiscovered) {
                <span class="osm-source-pill">Mapa Málaga · Estimado</span>
              }
            </div>
            <h3>{{ selected.name }}</h3>
            <p class="address-line">{{ selected.address }} · {{ selected.distance }}</p>

            <!-- Dynamic sensory pills -->
            <div class="sensory-pills">
              <span class="sens-pill" [class]="getSensoryTone('noise', selected)">
                <app-icon name="noise" [size]="14"></app-icon>
                Ruido: {{ getSensoryText('noise', selected) }}
              </span>
              <span class="sens-pill" [class]="getSensoryTone('crowd', selected)">
                <app-icon name="crowd" [size]="14"></app-icon>
                Gente: {{ getSensoryText('crowd', selected) }}
              </span>
              <span class="sens-pill" [class]="getSensoryTone('lighting', selected)">
                <app-icon name="light" [size]="14"></app-icon>
                Luz: {{ getSensoryText('lighting', selected) }}
              </span>
            </div>

            @if (activeSelectedContextAlert(); as alert) {
              <div class="quick-env-alert">
                <app-icon name="alert" [size]="14"></app-icon>
                <span>{{ alert }}</span>
              </div>
            }
          </div>

          <div class="card-right">
            <button
              class="close-quick-card-btn"
              (click)="placesService.clearSelection()"
              title="Cerrar selección"
              aria-label="Cerrar tarjeta de lugar"
            >
              <app-icon name="close" [size]="15"></app-icon>
            </button>
            <button class="view-detail-btn" (click)="placesService.setView('detail')">
              Ver ficha
              <app-icon name="arrow" [size]="15"></app-icon>
            </button>
            <button class="rate-btn" (click)="rateSelectedPlace(selected)">
              Valorar
            </button>
          </div>
        </div>
      }

      <!-- Map Controls Dock -->
      <div class="map-controls-dock" (click)="$event.stopPropagation()">
        <div
          class="day-night-pill"
          [class.night]="isMapNight()"
          [title]="isMapNight() ? 'Mapa nocturno (20:00 - 06:59)' : 'Mapa diurno (07:00 - 19:59)'"
        >
          <app-icon [name]="isMapNight() ? 'moon' : 'sun'" [size]="14"></app-icon>
          <span>{{ isMapNight() ? 'Noche' : 'Día' }}</span>
        </div>

        <button
          class="tool-toggle-btn"
          [class.active]="inspectMode()"
          (click)="toggleInspectMode()"
          title="Activar para clicar cualquier edificio o calle y consultar su ambiente"
        >
          <app-icon name="location" [size]="15"></app-icon>
          <span>Inspeccionar local</span>
        </button>

        <button
          class="tool-toggle-btn"
          [class.active]="showExtraOsmPois()"
          (click)="toggleExtraOsmPois()"
          title="Cargar puntualmente locales cercanos desde OpenStreetMap"
        >
          <app-icon name="building" [size]="15"></app-icon>
          <span>Más locales</span>
        </button>

        <button (click)="zoomIn()" aria-label="Acercar mapa" title="Acercar">
          <app-icon name="plus" [size]="18"></app-icon>
        </button>
        <button (click)="zoomOut()" aria-label="Alejar mapa" title="Alejar">
          <span class="minus-sign">−</span>
        </button>
        <button (click)="centerOnMalagaCentro()" aria-label="Centrar en Málaga Centro" title="Centrar en Málaga">
          <app-icon name="map" [size]="16"></app-icon>
        </button>
      </div>

      <!-- Map Sensory Legend -->
      <div class="map-legend" (click)="$event.stopPropagation()">
        <div class="legend-item"><span class="dot calm"></span> Tranquilo</div>
        <div class="legend-item"><span class="dot medium"></span> Moderado</div>
        <div class="legend-item"><span class="dot busy"></span> Intenso</div>
        <div class="legend-item"><span class="dot zone"></span> Zona (m)</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100%;
      min-height: 520px;
      position: relative;
    }

    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 520px;
      overflow: hidden;
      background: var(--bg-surface-soft);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
    }

    .map-container.inspect-cursor .real-map-canvas {
      cursor: crosshair !important;
    }

    .real-map-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* Compact Environmental Context HUD */
    .env-context-hud {
      position: absolute;
      top: 14px;
      left: 14px;
      right: 170px;
      display: flex;
      gap: 8px;
      z-index: 10;
      pointer-events: none;
      flex-wrap: wrap;
    }
    .env-chip {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      font-size: 12px;
      color: var(--text-secondary);
      opacity: 0.96;
    }
    .env-chip.highlight {
      border-color: var(--accent-amber);
      color: var(--text-primary);
    }
    .env-chip.highlight app-icon {
      color: var(--accent-amber);
    }
    .inspect-active-chip {
      border-color: var(--accent-calm);
      color: var(--accent-calm);
      font-weight: 600;
    }
    .loading-chip {
      color: var(--accent-calm);
    }
    .status-note-chip {
      color: var(--text-secondary);
      font-size: 11.5px;
    }
    .mini-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid var(--accent-calm-light);
      border-top-color: var(--accent-calm);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Pulse ring for environmental peaks */
    :host ::ng-deep .context-pulse {
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 2px solid var(--accent-amber);
      opacity: 0.55;
      animation: pulse-ring 2.6s infinite;
      pointer-events: none;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.65; }
      75% { transform: scale(1.35); opacity: 0; }
      100% { transform: scale(1.35); opacity: 0; }
    }

    /* Floating Quick Card */
    .floating-quick-card {
      position: absolute;
      bottom: 18px;
      left: 18px;
      right: 18px;
      max-width: 720px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      z-index: 20;
      animation: slide-up 0.18s ease-out;
    }
    @keyframes slide-up {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .card-left {
      flex: 1;
      min-width: 0;
    }
    .card-meta-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .category-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .osm-source-pill {
      font-size: 10.5px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-soft);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .card-left h3 {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .address-line {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .sensory-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .sens-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }
    .sens-pill.calm { background: var(--accent-green-light); color: var(--accent-green); }
    .sens-pill.medium { background: var(--accent-amber-light); color: var(--accent-amber); }
    .sens-pill.busy { background: var(--accent-coral-light); color: var(--accent-coral); }

    .quick-env-alert {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--accent-amber);
      font-weight: 600;
    }

    .card-right {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 140px;
      position: relative;
    }
    .close-quick-card-btn {
      align-self: flex-end;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .close-quick-card-btn:hover {
      color: var(--text-primary);
      border-color: var(--accent-calm);
    }
    .view-detail-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--accent-calm);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .view-detail-btn:hover {
      background: var(--accent-calm-dark);
    }
    .rate-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 7px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
    }
    .rate-btn:hover {
      border-color: var(--accent-calm);
    }

    /* Dock Controls */
    .map-controls-dock {
      position: absolute;
      top: 14px;
      right: 14px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      z-index: 15;
    }
    .map-controls-dock button {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: grid;
      place-items: center;
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .map-controls-dock button:hover {
      background: var(--bg-surface-soft);
      border-color: var(--accent-calm);
    }
    .map-controls-dock .tool-toggle-btn {
      width: auto;
      height: 33px;
      padding: 0 11px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .map-controls-dock .tool-toggle-btn.active {
      background: var(--accent-calm);
      border-color: var(--accent-calm);
      color: #ffffff;
    }
    .day-night-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      font-size: 11.5px;
      font-weight: 700;
      color: var(--accent-amber);
    }
    .day-night-pill.night {
      color: var(--accent-calm);
    }

    /* Map Legend */
    .map-legend {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 7px 12px;
      box-shadow: var(--shadow-sm);
      display: flex;
      gap: 12px;
      z-index: 10;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .dot.calm { background: var(--accent-green); }
    .dot.medium { background: var(--accent-amber); }
    .dot.busy { background: var(--accent-coral); }
    .dot.zone { background: transparent; border: 2px dashed var(--accent-calm); }

    @media (max-width: 768px) {
      .env-context-hud {
        right: 14px;
        top: 60px;
      }
      .floating-quick-card {
        flex-direction: column;
        align-items: stretch;
        bottom: 10px;
        left: 10px;
        right: 10px;
        padding: 12px 14px;
      }
      .card-right {
        flex-direction: row;
        align-items: center;
      }
      .card-right .view-detail-btn,
      .card-right .rate-btn {
        flex: 1;
      }
      .map-legend {
        display: none;
      }
    }
  `],
})
export class MapArtworkComponent implements OnDestroy {
  readonly placesService = inject(PlacesService);
  readonly osmPlacesService = inject(OsmPlacesService);
  private readonly contextEngine = inject(ContextEngineService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly realMapContainer = viewChild<ElementRef<HTMLDivElement>>('realMapContainer');
  readonly showExtraOsmPois = signal<boolean>(false);
  readonly inspectMode = signal<boolean>(false);

  private map: any = null;
  private maplibregl: any = null;
  private activeMarkers: any[] = [];
  private activeOsmMarkers: any[] = [];
  private currentStyleMode: 'day' | 'night' | null = null;
  private styleLoaded = false;

  readonly isMapNight = computed(() => {
    const hour = this.placesService.simulatedHour();
    return hour < 7 || hour >= 20;
  });

  readonly activeSelectedContextAlert = computed(() => {
    const place = this.placesService.selectedPlace();
    if (!place) return null;
    const hour = this.placesService.simulatedHour();
    const result = this.contextEngine.calculateDynamicSensory(place, hour);
    return result.activeAlerts.length > 0 ? result.activeAlerts[0] : null;
  });

  readonly isTrainRushActive = computed(() => {
    const hour = this.placesService.simulatedHour();
    return [7, 8, 9, 13, 14, 15, 18, 19, 20].includes(hour);
  });

  readonly isLariosLightsActive = computed(() => {
    const hour = this.placesService.simulatedHour();
    return hour >= 18 && hour <= 23;
  });

  readonly isAlamedaTrafficActive = computed(() => {
    const hour = this.placesService.simulatedHour();
    return [8, 9, 10, 13, 14, 15, 18, 19, 20].includes(hour);
  });

  constructor() {
    effect(() => {
      const filtered = this.placesService.filteredPlaces();
      const hour = this.placesService.simulatedHour();
      const selectedId = this.placesService.selectedPlaceId();
      const osmList = this.osmPlacesService.osmPlaces();
      const showOsm = this.showExtraOsmPois();
      const night = this.isMapNight();
      const transient = this.placesService.transientSelectedPlace();

      if (!this.map || !this.maplibregl) return;

      const targetStyle: 'day' | 'night' = night ? 'night' : 'day';
      if (this.currentStyleMode !== targetStyle) {
        this.currentStyleMode = targetStyle;
        this.styleLoaded = false;
        this.map.setStyle(night ? STYLE_NIGHT : STYLE_DAY);
      }

      if (this.styleLoaded) {
        this.updateZoneGeoJson(filtered, hour, selectedId);
      }

      // Include inspected transient OSM place as marker if it isn't in osmList/filtered
      const extraVisible = [...(showOsm ? osmList : [])];
      if (transient && !extraVisible.some((p) => p.id === transient.id) && !filtered.some((p) => p.id === transient.id)) {
        extraVisible.push(transient);
      }

      this.renderCuratedMarkers(filtered, hour, selectedId);
      this.renderOsmMarkers(extraVisible, hour, selectedId);
    });

    effect(() => {
      const geo = this.placesService.focusGeoRequest();
      if (geo && this.map) {
        this.map.flyTo({
          center: [geo.lng, geo.lat],
          zoom: Math.max(this.map.getZoom(), 16),
          duration: 600,
        });
      }
    });
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.maplibregl = await import('maplibre-gl');
      this.maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
      const containerEl = this.realMapContainer()?.nativeElement;
      if (!containerEl) return;

      const initialNight = this.isMapNight();
      this.currentStyleMode = initialNight ? 'night' : 'day';

      this.map = new this.maplibregl.Map({
        container: containerEl,
        style: initialNight ? STYLE_NIGHT : STYLE_DAY,
        center: [-4.4215, 36.7185], // [lng, lat] Málaga Centro
        zoom: 15.2,
        attributionControl: true,
      });

      this.map.on('style.load', () => {
        this.styleLoaded = true;
        this.ensureZoneLayers();
        this.updateZoneGeoJson(
          this.placesService.filteredPlaces(),
          this.placesService.simulatedHour(),
          this.placesService.selectedPlaceId()
        );
      });

      this.map.on('click', async (e: any) => {
        if (this.styleLoaded && this.map.getLayer('zones-fill')) {
          const features = this.map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] });
          if (features.length > 0 && !this.inspectMode()) {
            const zoneId = features[0].properties?.['id'];
            if (zoneId) {
              this.placesService.selectPlace(zoneId);
              return;
            }
          }
        }

        if (this.inspectMode()) {
          const found = await this.osmPlacesService.inspectPointInMalaga(e.lngLat.lat, e.lngLat.lng);
          if (found) {
            this.placesService.selectExternalPlace(found);
          }
          return;
        }

        // Click outside any marker or zone -> deselect cleanly
        this.placesService.clearSelection();
      });

      // Right-click anywhere to inspect a building/local directly
      this.map.on('contextmenu', async (e: any) => {
        const found = await this.osmPlacesService.inspectPointInMalaga(e.lngLat.lat, e.lngLat.lng);
        if (found) {
          this.placesService.selectExternalPlace(found);
        }
      });

      this.renderCuratedMarkers(
        this.placesService.filteredPlaces(),
        this.placesService.simulatedHour(),
        this.placesService.selectedPlaceId()
      );
    } catch (e) {
      console.warn('MapLibre GL could not be initialized', e);
    }
  }

  ngOnDestroy() {
    this.clearMarkerList(this.activeMarkers);
    this.clearMarkerList(this.activeOsmMarkers);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private ensureZoneLayers() {
    if (!this.map) return;
    if (!this.map.getSource('mood-zones')) {
      this.map.addSource('mood-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
    if (!this.map.getLayer('zones-fill')) {
      this.map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'mood-zones',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['case', ['==', ['get', 'selected'], true], 0.24, 0.12],
        },
      });
    }
    if (!this.map.getLayer('zones-outline')) {
      this.map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'mood-zones',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['==', ['get', 'selected'], true], 2.5, 1.5],
          'line-dasharray': [3, 2],
        },
      });
    }
  }

  private updateZoneGeoJson(places: Place[], hour: number, selectedId: string | null) {
    if (!this.map) return;
    const src = this.map.getSource('mood-zones');
    if (!src) return;

    const features = places
      .filter((p) => p.kind === 'zone' && p.geoCoordinates)
      .map((zone) => {
        const result = this.contextEngine.calculateDynamicSensory(zone, hour);
        let color = '#2c6e7f';
        if (result.levels.noise > 60) color = '#b94a48';
        else if (result.levels.noise > 38) color = '#b4691e';

        const ring = this.createCirclePolygon(
          zone.geoCoordinates.lng,
          zone.geoCoordinates.lat,
          zone.zoneRadius || 180
        );
        return {
          type: 'Feature',
          properties: {
            id: zone.id,
            color,
            selected: selectedId === zone.id,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [ring],
          },
        };
      });

    src.setData({ type: 'FeatureCollection', features });
  }

  private createCirclePolygon(lng: number, lat: number, radiusMeters: number, steps = 64): number[][] {
    const coords: number[][] = [];
    const earthRadius = 6378137;
    const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const dLng = dLat / Math.cos((lat * Math.PI) / 180);
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * (2 * Math.PI);
      coords.push([lng + dLng * Math.cos(theta), lat + dLat * Math.sin(theta)]);
    }
    return coords;
  }

  private clearMarkerList(list: any[]) {
    for (const m of list) {
      m.remove();
    }
    list.length = 0;
  }

  private renderCuratedMarkers(places: Place[], hour: number, selectedId: string | null) {
    if (!this.map || !this.maplibregl) return;
    this.clearMarkerList(this.activeMarkers);

    // 1. Zone center pills
    for (const zone of places.filter((p) => p.kind === 'zone')) {
      if (!zone.geoCoordinates) continue;
      const isSelected = selectedId === zone.id;
      const radiusMeters = zone.zoneRadius || 180;

      const el = document.createElement('div');
      el.className = 'mood-marker-root';
      el.innerHTML = `
        <div class="mood-zone-badge ${isSelected ? 'selected' : ''}">
          <span>${this.escapeHtml(zone.name)}</span>
          <small>${radiusMeters} m</small>
        </div>
      `;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.placesService.selectPlace(zone.id);
      });

      const marker = new this.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([zone.geoCoordinates.lng, zone.geoCoordinates.lat])
        .addTo(this.map);
      this.activeMarkers.push(marker);
    }

    // 2. Local Place pins
    for (const place of places.filter((p) => p.kind === 'local')) {
      if (!place.geoCoordinates) continue;
      const result = this.contextEngine.calculateDynamicSensory(place, hour);
      const isSelected = selectedId === place.id;
      const statusTone = result.levels.noise <= 35 ? 'calm' : result.levels.noise <= 65 ? 'medium' : 'busy';
      const statusText = result.isPeakEnvironmental
        ? 'Pico de entorno'
        : result.levels.noise <= 35
          ? 'Calmado'
          : 'Moderado';
      const pulseHtml = result.isPeakEnvironmental ? '<span class="context-pulse"></span>' : '';

      const el = document.createElement('div');
      el.className = 'mood-marker-root';
      if (isSelected) el.style.zIndex = '20';
      el.innerHTML = `
        <div class="mood-pin-wrapper ${isSelected ? 'selected' : ''}">
          <div class="mood-pin-avatar" style="background: ${place.color};">
            ${pulseHtml}
            ${this.getCategorySvg(place.category)}
          </div>
          <div class="mood-pin-label">
            <strong>${this.escapeHtml(place.name)}</strong>
            <small><span class="mood-status-dot ${statusTone}"></span>${statusText}</small>
          </div>
        </div>
      `;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.placesService.selectPlace(place.id);
      });

      const marker = new this.maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.geoCoordinates.lng, place.geoCoordinates.lat])
        .addTo(this.map);
      this.activeMarkers.push(marker);
    }
  }

  private renderOsmMarkers(osmPlaces: Place[], hour: number, selectedId: string | null) {
    if (!this.map || !this.maplibregl) return;
    this.clearMarkerList(this.activeOsmMarkers);

    for (const poi of osmPlaces) {
      if (!poi.geoCoordinates) continue;
      const isSelected = selectedId === poi.id;
      const result = this.contextEngine.calculateDynamicSensory(poi, hour);
      const dotColor =
        result.levels.noise <= 35 ? '#2f7a5b' : result.levels.noise <= 65 ? '#b4691e' : '#b94a48';

      const el = document.createElement('div');
      el.className = 'mood-marker-root';
      if (isSelected) el.style.zIndex = '18';
      el.innerHTML = `
        <div class="mood-osm-poi ${isSelected ? 'selected' : ''}">
          <div class="mood-osm-dot" style="border-color: ${dotColor}; color: ${dotColor};">
            ${this.getCategorySvg(poi.category, 12)}
          </div>
          <span class="mood-osm-tag">${this.escapeHtml(poi.name)}</span>
        </div>
      `;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.placesService.selectExternalPlace(poi);
      });

      const marker = new this.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([poi.geoCoordinates.lng, poi.geoCoordinates.lat])
        .addTo(this.map);
      this.activeOsmMarkers.push(marker);
    }
  }

  private getCategorySvg(category: string, size = 16): string {
    let paths = '<path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"/><circle cx="12" cy="9" r="2.2"/>';
    switch (category) {
      case 'Cafetería':
        paths = '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>';
        break;
      case 'Biblioteca':
        paths = '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>';
        break;
      case 'Estación':
        paths = '<rect width="14" height="15" x="5" y="3" rx="2"/><path d="M5 11h14M12 3v8M8 18l-2 3M16 18l2 3"/><circle cx="8.5" cy="14.5" r="1"/><circle cx="15.5" cy="14.5" r="1"/>';
        break;
      case 'Mercado':
      case 'Comercio':
      case 'Centro Comercial':
        paths = '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>';
        break;
      case 'Cultura':
        paths = '<path d="M2 10s3-3 3-8"/><path d="M22 10s-3-3-3-8"/><path d="M10 2c0 4.4-3.6 8-8 8"/><path d="M14 2c0 4.4 3.6 8 8 8"/><path d="M2 10s2 2 2 5"/><path d="M22 10s-2 2-2 5"/><path d="M8 15h8"/><path d="M6 20h12"/>';
        break;
      case 'Restaurante':
        paths = '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>';
        break;
      case 'Parque':
      case 'Playa':
      case 'Puerto / Paseo':
        paths = '<path d="m12 3-5 7h3l-4 6h12l-4-6h3Z"/><path d="M12 16v5"/>';
        break;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  toggleInspectMode() {
    this.inspectMode.set(!this.inspectMode());
  }

  toggleExtraOsmPois() {
    const next = !this.showExtraOsmPois();
    this.showExtraOsmPois.set(next);
    if (next && this.map) {
      const b = this.map.getBounds();
      this.osmPlacesService.fetchNearbyPlacesOnDemand(
        {
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast(),
        },
        this.placesService.places()
      );
    } else {
      this.osmPlacesService.statusMessage.set(null);
    }
  }

  rateSelectedPlace(place: Place) {
    if (place.isOsmDiscovered) {
      this.placesService.promoteExternalPlace(place);
    }
    this.placesService.setView('review');
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  centerOnMalagaCentro() {
    this.map?.flyTo({ center: [-4.4215, 36.7185], zoom: 15.2, duration: 700 });
  }

  getPlaceIcon(category: string): any {
    switch (category) {
      case 'Cafetería': return 'home';
      case 'Biblioteca':
      case 'Comercio':
      case 'Mercado':
      case 'Cultura':
      case 'Restaurante': return 'building';
      case 'Estación': return 'train';
      case 'Centro Comercial': return 'parking';
      case 'Parque':
      case 'Playa':
      case 'Puerto / Paseo': return 'tree';
      default: return 'location';
    }
  }

  getSensoryTone(type: 'noise' | 'lighting' | 'crowd', place: Place): string {
    const hour = this.placesService.simulatedHour();
    const result = this.contextEngine.calculateDynamicSensory(place, hour);
    const val = result.levels[type];
    if (val <= 35) return 'calm';
    if (val <= 65) return 'medium';
    return 'busy';
  }

  getSensoryText(type: 'noise' | 'lighting' | 'crowd', place: Place): string {
    const hour = this.placesService.simulatedHour();
    const result = this.contextEngine.calculateDynamicSensory(place, hour);
    return this.contextEngine.getSensoryLabel(type, result.levels[type]).level;
  }
}
