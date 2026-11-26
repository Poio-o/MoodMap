import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Place } from '../../models/place.model';
import { ContextEngineService } from '../../services/context-engine.service';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-place-list',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-container">
      <div class="list-header">
        <div class="list-title-group">
          <h2>Lugares y zonas registradas</h2>
          <p>Alternativa accesible en formato lista sin sobrecarga visual.</p>
        </div>

        <button class="switch-map-btn" (click)="placesService.setView('map')">
          <app-icon name="map" [size]="17"></app-icon>
          <span>Ver en el mapa</span>
        </button>
      </div>

      <!-- Filters & Sort Bar -->
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input
            type="text"
            placeholder="Filtrar por nombre o dirección..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            aria-label="Buscar en la lista"
          />
        </div>

        <div class="category-filters">
          @for (cat of categories; track cat) {
            <button
              class="cat-btn"
              [class.active]="placesService.selectedCategory() === cat"
              (click)="placesService.setCategory(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- Places List Grid -->
      <div class="cards-grid">
        @for (place of filteredResults(); track place.id) {
          <div
            class="place-card"
            [class.selected]="placesService.selectedPlaceId() === place.id"
            (click)="selectAndOpen(place)"
          >
            <div class="card-badge-row">
              <span class="cat-pill" [style.color]="place.color">
                {{ place.category }}
                @if (place.kind === 'zone') {
                  · Zona ({{ place.zoneRadius || 180 }} m)
                }
              </span>

              <span class="sensory-status" [class]="getSensoryTone(place)">
                {{ getSensoryLabel(place) }}
              </span>
            </div>

            <h3>{{ place.name }}</h3>
            <p class="address">{{ place.address }} · {{ place.distance }}</p>
            <p class="desc">{{ place.description }}</p>

            <!-- Environmental Factor Tag (if active) -->
            @if (getActiveFactorName(place); as factorMsg) {
              <div class="env-factor-tag">
                <app-icon name="alert" [size]="14"></app-icon>
                <span>{{ factorMsg }}</span>
              </div>
            }

            <div class="card-footer">
              <div class="sensory-mini-bars">
                <span title="Ruido">
                  <app-icon name="noise" [size]="13"></app-icon>
                  {{ getNoiseLevel(place) }}%
                </span>
                <span title="Iluminación">
                  <app-icon name="light" [size]="13"></app-icon>
                  {{ getLightingLevel(place) }}%
                </span>
                <span title="Aglomeración">
                  <app-icon name="crowd" [size]="13"></app-icon>
                  {{ getCrowdLevel(place) }}%
                </span>
              </div>

              <span class="open-link">
                Ver ficha
                <app-icon name="chevron" [size]="15"></app-icon>
              </span>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <app-icon name="search" [size]="32"></app-icon>
            <p>No se han encontrado lugares con los filtros actuales.</p>
            <button (click)="placesService.setCategory('Todos'); searchQuery.set('')">
              Restablecer filtros
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
      width: 100%;
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .list-title-group h2 {
      font-family: var(--font-display);
      font-size: 1.6rem;
      color: var(--text-primary);
    }
    .list-title-group p {
      font-size: 13.5px;
      color: var(--text-secondary);
    }
    .switch-map-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent-calm-light);
      color: var(--accent-calm);
      border: 1px solid var(--accent-calm);
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .switch-map-btn:hover {
      background: var(--accent-calm);
      color: white;
    }

    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 8px 14px;
      box-shadow: var(--shadow-sm);
    }
    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      flex: 1;
      font-size: 14px;
    }
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-bottom: 4px;
    }
    .cat-btn {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      transition: all 0.2s;
    }
    .cat-btn:hover {
      background: var(--bg-surface-soft);
      color: var(--text-primary);
    }
    .cat-btn.active {
      background: var(--accent-calm);
      color: white;
      border-color: var(--accent-calm);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
    }
    .place-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 18px;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .place-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent-calm);
    }
    .card-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .cat-pill {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .sensory-status {
      font-size: 11.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .sensory-status.calm { background: var(--accent-green-light); color: var(--accent-green); }
    .sensory-status.medium { background: var(--accent-amber-light); color: var(--accent-amber); }
    .sensory-status.busy { background: var(--accent-coral-light); color: var(--accent-coral); }

    .place-card h3 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .address {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 14px;
      flex: 1;
    }
    .env-factor-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      background: var(--accent-amber-light);
      color: var(--accent-amber);
      font-size: 11.5px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
    }
    .sensory-mini-bars {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .sensory-mini-bars span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .open-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--accent-calm);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }
    .empty-state button {
      margin-top: 14px;
      background: var(--accent-calm);
      color: white;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-weight: 600;
    }
  `],
})
export class PlaceListComponent {
  readonly placesService = inject(PlacesService);
  private readonly contextEngine = inject(ContextEngineService);

  readonly searchQuery = signal<string>('');

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

  readonly filteredResults = computed(() => {
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
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  selectAndOpen(place: Place) {
    this.placesService.selectPlace(place.id);
    this.placesService.setView('detail');
  }

  getNoiseLevel(place: Place): number {
    const hour = this.placesService.simulatedHour();
    return this.contextEngine.calculateDynamicSensory(place, hour).levels.noise;
  }

  getLightingLevel(place: Place): number {
    const hour = this.placesService.simulatedHour();
    return this.contextEngine.calculateDynamicSensory(place, hour).levels.lighting;
  }

  getCrowdLevel(place: Place): number {
    const hour = this.placesService.simulatedHour();
    return this.contextEngine.calculateDynamicSensory(place, hour).levels.crowd;
  }

  getSensoryTone(place: Place): string {
    const noise = this.getNoiseLevel(place);
    if (noise <= 35) return 'calm';
    if (noise <= 65) return 'medium';
    return 'busy';
  }

  getSensoryLabel(place: Place): string {
    const noise = this.getNoiseLevel(place);
    if (noise <= 35) return 'Tranquilo';
    if (noise <= 65) return 'Moderado';
    return 'Concurrido';
  }

  getActiveFactorName(place: Place): string | null {
    const hour = this.placesService.simulatedHour();
    const result = this.contextEngine.calculateDynamicSensory(place, hour);
    if (result.activeAlerts.length > 0) {
      return result.activeAlerts[0];
    }
    return null;
  }
}
