import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top-header">
      <div class="header-main">
        <div class="branding-group">
          <div class="mobile-logo" (click)="placesService.setView('map')">
            <span class="logo-leaf"></span>
            <span class="logo-text">MoodMap</span>
          </div>
          <div class="titles">
            <h1>{{ getTitle() }}</h1>
            <p>{{ getSubtitle() }}</p>
          </div>
        </div>

        <div class="header-controls">
          <!-- Time Simulator Bar -->
          <div class="time-sim-badge" [class.simulating]="placesService.isSimulatingHour()">
            <div class="time-info">
              <app-icon name="clock" [size]="16"></app-icon>
              <span>{{ formatHour(placesService.simulatedHour()) }}</span>
              @if (placesService.isSimulatingHour()) {
                <span class="sim-label">(Simulada)</span>
              } @else {
                <span class="sim-label">(Hora actual)</span>
              }
            </div>
            <div class="time-slider-wrap">
              <input
                type="range"
                min="0"
                max="23"
                [value]="placesService.simulatedHour()"
                (input)="onHourChange($event)"
                aria-label="Simulador de hora del día"
              />
            </div>
            @if (placesService.isSimulatingHour()) {
              <button class="reset-hour-btn" (click)="placesService.resetSimulatedHour()" title="Volver a hora real">
                <app-icon name="close" [size]="14"></app-icon>
              </button>
            }
          </div>

          <!-- Theme Switcher -->
          <button
            class="theme-toggle-btn"
            (click)="placesService.toggleTheme()"
            [attr.aria-label]="placesService.theme() === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'"
            [title]="placesService.theme() === 'light' ? 'Modo oscuro' : 'Modo claro'"
          >
            @if (placesService.theme() === 'light') {
              <app-icon name="moon" [size]="18"></app-icon>
            } @else {
              <app-icon name="sun" [size]="18"></app-icon>
            }
          </button>

          <!-- User Profile -->
          <div class="user-pill" title="Lucía Martín - Perfil activo">
            <span class="user-avatar">LM</span>
            <span class="user-name">Lucía M.</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 14px 24px;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .branding-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .mobile-logo {
      display: none;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .logo-leaf {
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 8%;
      background: var(--accent-calm);
      display: inline-block;
    }
    .logo-text {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 18px;
      color: var(--text-primary);
    }
    .titles h1 {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .titles p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .time-sim-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-surface-soft);
      padding: 6px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-subtle);
    }
    .time-sim-badge.simulating {
      border-color: var(--accent-calm);
      background: var(--accent-calm-light);
    }
    .time-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .sim-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .time-slider-wrap {
      display: flex;
      align-items: center;
    }
    .time-slider-wrap input[type="range"] {
      width: 80px;
      height: 6px;
      cursor: pointer;
      accent-color: var(--accent-calm);
      padding: 0;
    }
    .reset-hour-btn {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--border-subtle);
      color: var(--text-secondary);
    }
    .theme-toggle-btn {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      transition: background 0.2s;
    }
    .theme-toggle-btn:hover {
      background: var(--accent-calm-light);
      color: var(--accent-calm);
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent-calm);
      color: white;
      font-size: 11px;
      font-weight: 700;
      display: grid;
      place-items: center;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    @media (max-width: 900px) {
      .mobile-logo {
        display: flex;
      }
      .user-name {
        display: none;
      }
      .titles {
        display: none;
      }
    }
  `],
})
export class HeaderComponent {
  readonly placesService = inject(PlacesService);

  getTitle(): string {
    const view = this.placesService.currentView();
    if (view === 'map') return 'Mapa sensorial accesible';
    if (view === 'list') return 'Lugares y zonas registradas';
    if (view === 'detail') return 'Ficha sensorial detallada';
    return 'Publicar valoración o zona';
  }

  getSubtitle(): string {
    const view = this.placesService.currentView();
    if (view === 'map') return 'Explora niveles de ruido, iluminación y afluencia en tiempo real.';
    if (view === 'list') return 'Consulta la lista completa con filtros y factores del entorno.';
    if (view === 'detail') return 'Información sensorial objetiva e inferida del entorno.';
    return 'Comparte las condiciones que has percibido para ayudar a la comunidad.';
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  onHourChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.placesService.setSimulatedHour(parseInt(input.value, 10));
  }
}
