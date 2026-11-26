import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="side-nav">
      <div class="logo" (click)="placesService.setView('map')">
        <span class="logo-mark">
          <span></span>
        </span>
        <span class="logo-text">MoodMap</span>
      </div>

      <nav class="nav-links" aria-label="Navegación principal">
        <button
          class="nav-item"
          [class.active]="placesService.currentView() === 'map'"
          (click)="placesService.setView('map')"
        >
          <app-icon name="map" [size]="19"></app-icon>
          <span>Explorar mapa</span>
        </button>

        <button
          class="nav-item"
          [class.active]="placesService.currentView() === 'list'"
          (click)="placesService.setView('list')"
        >
          <app-icon name="list" [size]="19"></app-icon>
          <span>Vista de lista</span>
        </button>

        <button
          class="nav-item"
          [class.active]="placesService.currentView() === 'detail'"
          (click)="placesService.setView('detail')"
        >
          <app-icon name="home" [size]="19"></app-icon>
          <span>Ficha de lugar</span>
        </button>

        <button
          class="nav-item cta-nav"
          [class.active]="placesService.currentView() === 'review'"
          (click)="placesService.setView('review')"
        >
          <app-icon name="plus" [size]="19"></app-icon>
          <span>Añadir valoración</span>
        </button>
      </nav>

      <div class="side-bottom">
        <div class="community-card">
          <div class="comm-header">
            <span class="comm-icon">
              <app-icon name="sparkles" [size]="18"></app-icon>
            </span>
            <strong>Accesibilidad sensorial</strong>
          </div>
          <p>
            Algoritmo inteligente de entorno: estimamos ruido, luz y afluencia por cercanía al metro, tráfico, tren o luces festivas de Málaga.
          </p>
          <button class="comm-action" (click)="placesService.setView('review')">
            + Señalar zona o local
          </button>
        </div>

        <div class="profile-card">
          <span class="profile-avatar">LM</span>
          <div class="profile-meta">
            <strong>Lucía Martín</strong>
            <small>Sensibilidad auditiva</small>
          </div>
          <app-icon name="chevron" [size]="16" className="chevron-icon"></app-icon>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .side-nav {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: var(--nav-width);
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      z-index: 30;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      margin-bottom: 32px;
      padding: 0 8px;
    }
    .logo-mark {
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 8%;
      background: var(--accent-calm);
      display: grid;
      place-items: center;
      position: relative;
    }
    .logo-mark span {
      width: 6px;
      height: 14px;
      background: white;
      border-radius: 4px;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-primary);
    }
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .nav-item:hover {
      background: var(--bg-surface-soft);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-calm-light);
      color: var(--accent-calm);
    }
    .cta-nav {
      margin-top: 6px;
    }
    .side-bottom {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .community-card {
      background: var(--bg-surface-soft);
      border-radius: var(--radius-md);
      padding: 14px;
      border: 1px solid var(--border-subtle);
    }
    .comm-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .comm-icon {
      color: var(--accent-calm);
    }
    .community-card strong {
      font-size: 13px;
      color: var(--text-primary);
    }
    .community-card p {
      font-size: 11.5px;
      line-height: 1.45;
      color: var(--text-secondary);
    }
    .comm-action {
      margin-top: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--accent-calm);
      display: inline-block;
    }
    .profile-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
    }
    .profile-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--accent-calm);
      color: white;
      font-weight: 700;
      font-size: 12px;
      display: grid;
      place-items: center;
    }
    .profile-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .profile-meta strong {
      font-size: 13px;
      color: var(--text-primary);
    }
    .profile-meta small {
      font-size: 11px;
      color: var(--text-muted);
    }
    .chevron-icon {
      color: var(--text-muted);
    }
    @media (max-width: 900px) {
      .side-nav {
        display: none;
      }
    }
  `],
})
export class SideNavComponent {
  readonly placesService = inject(PlacesService);
}
