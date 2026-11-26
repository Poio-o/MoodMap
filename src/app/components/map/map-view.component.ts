import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Place } from '../../models/place.model';
import { ContextEngineService } from '../../services/context-engine.service';
import { OsmPlacesService } from '../../services/osm-places.service';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';
import { MapArtworkComponent } from './map-artwork.component';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [IconComponent, MapArtworkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="explore-layout">
      <!-- Left Results Panel -->
      <section class="results-panel" (click)="onPanelBackgroundClick($event)">
        <div class="search-box">
          <app-icon name="search" [size]="18" className="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Busca cualquier local, calle o parque en Málaga..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            aria-label="Buscar lugar o zona en Málaga"
          />
          @if (searchQuery()) {
            <button class="clear-search-btn" (click)="clearSearch()" title="Borrar búsqueda">
              <app-icon name="close" [size]="14"></app-icon>
            </button>
          }
        </div>

        <!-- Category Filter Chips (Wrapped cleanly so all are visible) -->
        <div class="filter-row" role="tablist" aria-label="Filtros de categoría">
          @for (cat of categories; track cat) {
            <button
              class="filter-chip"
              [class.active]="placesService.selectedCategory() === cat"
              (click)="placesService.setCategory(cat)"
              role="tab"
            >
              {{ cat }}
            </button>
          }
        </div>

        <div class="result-title-bar">
          <div>
            <strong>{{ displayedPlaces().length }} lugares y zonas en Málaga</strong>
            <small>También puedes clicar cualquier local directo en el mapa</small>
          </div>
          <button class="view-list-link" (click)="placesService.setView('list')">
            <app-icon name="list" [size]="15"></app-icon>
            <span>Lista</span>
          </button>
        </div>

        <!-- Scrollable Place Cards List -->
        <div class="cards-list">
          @for (place of displayedPlaces(); track place.id) {
            <div
              class="place-card-item"
              [class.selected]="placesService.selectedPlaceId() === place.id"
              (click)="selectPlace(place)"
            >
              <div class="place-avatar" [style.background]="place.color">
                <app-icon [name]="getPlaceIcon(place.category)" [size]="19"></app-icon>
              </div>

              <div class="place-info">
                <div class="place-title-line">
                  <strong>{{ place.name }}</strong>
                  <span class="score-tag">
                    <app-icon name="star" [size]="13"></app-icon>
                    {{ (place.reliability / 20).toFixed(1) }}
                  </span>
                </div>

                <span class="place-subtitle">
                  {{ place.category }} · {{ place.distance }}
                  @if (place.kind === 'zone') {
                    · Radio {{ place.zoneRadius || 180 }} m
                  }
                </span>

                <div class="place-badges-row">
                  <span class="busy-status-badge" [class]="getSensoryTone(place)">
                    <i class="status-dot"></i>
                    {{ getSensoryStatusText(place) }}
                  </span>

                  @if (hasEnvironmentalPeak(place)) {
                    <span class="env-mini-badge" title="Estímulo de entorno activo">
                      <app-icon name="sparkles" [size]="11"></app-icon>
                      Entorno activo
                    </span>
                  }
                </div>
              </div>

              <app-icon name="chevron" [size]="16" className="card-chevron"></app-icon>
            </div>
          } @empty {
            <div class="no-places-msg">
              <p>No hay coincidencias en tus sitios guardados.</p>
            </div>
          }

          <!-- Real OpenStreetMap Search Results across Málaga -->
          @if (searchQuery().trim().length >= 3) {
            <div class="osm-search-section">
              <div class="osm-search-header">
                <span>Resultados reales en Málaga (OSM)</span>
                @if (osmPlacesService.isSearching()) {
                  <small>Buscando...</small>
                }
              </div>

              @for (osmPlace of osmPlacesService.searchResults(); track osmPlace.id) {
                <div
                  class="place-card-item osm-result-card"
                  [class.selected]="placesService.selectedPlaceId() === osmPlace.id"
                  (click)="selectOsmSearchResult(osmPlace)"
                >
                  <div class="place-avatar" [style.background]="osmPlace.color">
                    <app-icon [name]="getPlaceIcon(osmPlace.category)" [size]="18"></app-icon>
                  </div>
                  <div class="place-info">
                    <div class="place-title-line">
                      <strong>{{ osmPlace.name }}</strong>
                    </div>
                    <span class="place-subtitle">{{ osmPlace.category }} · {{ osmPlace.address }}</span>
                  </div>
                  <app-icon name="location" [size]="16" className="card-chevron"></app-icon>
                </div>
              } @empty {
                @if (!osmPlacesService.isSearching()) {
                  <p class="osm-empty-note">Sin resultados adicionales en OpenStreetMap.</p>
                }
              }
            </div>
          }
        </div>
      </section>

      <!-- Right Map Canvas Panel -->
      <section class="map-panel">
        <app-map-artwork></app-map-artwork>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100%;
      min-height: 0;
      position: relative;
    }

    .explore-layout {
      width: 100%;
      height: calc(100vh - 68px);
      display: grid;
      grid-template-columns: minmax(340px, 385px) 1fr;
      overflow: hidden;
      background: var(--bg-app);
    }

    /* Left Results Panel */
    .results-panel {
      padding: 18px;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      z-index: 5;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 8px 12px;
    }
    .search-icon {
      color: var(--text-muted);
    }
    .search-box input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 13.5px;
      color: var(--text-primary);
      padding: 0;
    }
    .clear-search-btn {
      color: var(--text-muted);
      display: grid;
      place-items: center;
    }

    /* Category Filter Chips: Wrapped on desktop so ALL categories remain visible */
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .filter-chip {
      padding: 5px 11px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      transition: all 0.15s;
    }
    .filter-chip:hover {
      background: var(--accent-calm-light);
      color: var(--accent-calm);
      border-color: var(--accent-calm);
    }
    .filter-chip.active {
      background: var(--accent-calm);
      border-color: var(--accent-calm);
      color: #ffffff;
    }

    .result-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .result-title-bar strong {
      display: block;
      font-size: 13px;
      color: var(--text-primary);
    }
    .result-title-bar small {
      font-size: 11px;
      color: var(--text-muted);
    }
    .view-list-link {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-calm);
      flex-shrink: 0;
    }

    /* Cards List */
    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .place-card-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .place-card-item:hover {
      border-color: var(--accent-calm);
      box-shadow: var(--shadow-md);
    }
    .place-card-item.selected {
      border-color: var(--accent-calm);
      background: var(--accent-calm-light);
    }
    .place-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      color: #ffffff;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .place-info {
      flex: 1;
      min-width: 0;
    }
    .place-title-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
    }
    .place-title-line strong {
      font-size: 13.5px;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score-tag {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--accent-amber);
      flex-shrink: 0;
    }
    .place-subtitle {
      display: block;
      font-size: 11.5px;
      color: var(--text-muted);
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .place-badges-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }
    .busy-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .busy-status-badge.calm { background: var(--accent-green-light); color: var(--accent-green); }
    .busy-status-badge.medium { background: var(--accent-amber-light); color: var(--accent-amber); }
    .busy-status-badge.busy { background: var(--accent-coral-light); color: var(--accent-coral); }

    .env-mini-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--accent-amber);
      background: var(--accent-amber-light);
      padding: 2px 7px;
      border-radius: var(--radius-full);
    }
    .card-chevron {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .no-places-msg {
      text-align: center;
      padding: 18px;
      color: var(--text-muted);
      font-size: 13px;
    }

    .osm-search-section {
      margin-top: 6px;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .osm-search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .osm-empty-note {
      font-size: 12px;
      color: var(--text-muted);
      padding: 6px 0;
    }

    /* Right Map Panel */
    .map-panel {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 480px;
      overflow: hidden;
      padding: 12px;
      background: var(--bg-app);
    }

    /* Mobile Responsive Adaptation */
    @media (max-width: 900px) {
      .explore-layout {
        display: block;
        height: calc(100vh - 130px);
        position: relative;
      }
      .results-panel {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        background: transparent;
        border-right: none;
        padding: 12px;
        pointer-events: none;
      }
      .results-panel > * {
        pointer-events: auto;
      }
      .filter-row {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .result-title-bar,
      .cards-list {
        display: none;
      }
      .map-panel {
        height: 100%;
        padding: 0;
      }
    }
  `],
})
export class MapViewComponent {
  readonly placesService = inject(PlacesService);
  readonly osmPlacesService = inject(OsmPlacesService);
  private readonly contextEngine = inject(ContextEngineService);

  readonly searchQuery = signal<string>('');
  private searchTimer: any = null;

  readonly categories = [
    'Todos',
    'Cafeterías',
    'Bibliotecas',
    'Mercados',
    'Estaciones',
    'Centro Comercial',
    'Parques',
    'Playas / Puerto',
    'Zonas abiertas',
  ];

  readonly displayedPlaces = computed(() => {
    let list = this.placesService.filteredPlaces();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    return list;
  });

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);

    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (val.trim().length >= 3) {
      this.searchTimer = setTimeout(() => {
        this.osmPlacesService.searchInMalaga(val);
      }, 450);
    } else {
      this.osmPlacesService.searchResults.set([]);
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.osmPlacesService.searchResults.set([]);
  }

  selectPlace(place: Place) {
    this.placesService.selectPlace(place.id);
  }

  selectOsmSearchResult(place: Place) {
    this.placesService.selectExternalPlace(place, true);
  }

  onPanelBackgroundClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.place-card-item, button, input, .search-box, .filter-row')) {
      return;
    }
    this.placesService.clearSelection();
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

  getSensoryTone(place: Place): string {
    const hour = this.placesService.simulatedHour();
    const res = this.contextEngine.calculateDynamicSensory(place, hour);
    if (res.levels.noise <= 35) return 'calm';
    if (res.levels.noise <= 65) return 'medium';
    return 'busy';
  }

  getSensoryStatusText(place: Place): string {
    const hour = this.placesService.simulatedHour();
    const res = this.contextEngine.calculateDynamicSensory(place, hour);
    if (res.isPeakEnvironmental) return 'Pico de entorno';
    if (res.levels.noise <= 35) return 'Calmado';
    if (res.levels.noise <= 65) return 'Moderado';
    return 'Concurrido';
  }

  hasEnvironmentalPeak(place: Place): boolean {
    const hour = this.placesService.simulatedHour();
    const res = this.contextEngine.calculateDynamicSensory(place, hour);
    return res.isPeakEnvironmental;
  }
}
