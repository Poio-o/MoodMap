import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bottom-nav" aria-label="Navegación móvil">
      <button
        class="nav-tab"
        [class.active]="placesService.currentView() === 'map'"
        (click)="placesService.setView('map')"
      >
        <app-icon name="map" [size]="20"></app-icon>
        <span>Mapa</span>
      </button>

      <button
        class="nav-tab"
        [class.active]="placesService.currentView() === 'list'"
        (click)="placesService.setView('list')"
      >
        <app-icon name="list" [size]="20"></app-icon>
        <span>Lista</span>
      </button>

      <button class="nav-tab-action" (click)="placesService.setView('review')" title="Añadir valoración o zona">
        <span class="action-circle">
          <app-icon name="plus" [size]="22"></app-icon>
        </span>
        <span>Valorar</span>
      </button>

      <button
        class="nav-tab"
        [class.active]="placesService.currentView() === 'detail'"
        (click)="placesService.setView('detail')"
      >
        <app-icon name="home" [size]="20"></app-icon>
        <span>Ficha</span>
      </button>

      <button class="nav-tab" (click)="placesService.toggleTheme()">
        @if (placesService.theme() === 'light') {
          <app-icon name="moon" [size]="20"></app-icon>
          <span>Oscuro</span>
        } @else {
          <app-icon name="sun" [size]="20"></app-icon>
          <span>Claro</span>
        }
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      z-index: 40;
      justify-content: space-around;
      align-items: center;
      padding: 0 10px;
    }
    .nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      flex: 1;
      padding: 6px 0;
    }
    .nav-tab.active {
      color: var(--accent-calm);
    }
    .nav-tab-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-calm);
      flex: 1;
      margin-top: -14px;
    }
    .action-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-calm);
      color: white;
      display: grid;
      place-items: center;
      box-shadow: 0 4px 10px rgba(70, 115, 153, 0.4);
    }
    @media (max-width: 900px) {
      .bottom-nav {
        display: flex;
      }
    }
  `],
})
export class BottomNavComponent {
  readonly placesService = inject(PlacesService);
}
