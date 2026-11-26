import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Place } from '../../models/place.model';
import { ContextEngineService } from '../../services/context-engine.service';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (placesService.selectedPlace(); as place) {
      <div class="detail-container">
        <!-- Back Navigation -->
        <div class="detail-header-nav">
          <button class="back-btn" (click)="placesService.setView('map')">
            <app-icon name="arrow" [size]="18"></app-icon>
            <span>Volver al mapa</span>
          </button>
          <div class="quick-status">
            <span class="status-indicator" [class]="currentSensoryTone()"></span>
            <span>Ambiente actual: <strong>{{ currentSensorySummary() }}</strong></span>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Main Information Column -->
          <div class="main-info-col">
            <!-- Hero Place Card -->
            <div class="hero-card" [style.border-top-color]="place.color">
              <div class="hero-top">
                <span class="category-tag" [style.background]="place.color + '22'" [style.color]="place.color">
                  {{ place.category }}
                  @if (place.kind === 'zone') {
                    · Zona con rango ({{ place.zoneRadius || 180 }} m)
                  }
                </span>

                @if (place.verified) {
                  <span class="verified-badge" title="Establecimiento verificado por equipo y comunidad">
                    <app-icon name="check" [size]="14"></app-icon>
                    Verificado
                  </span>
                }
              </div>

              <h2>{{ place.name }}</h2>
              <p class="address-text">
                <app-icon name="location" [size]="15"></app-icon>
                {{ place.address }} · A {{ place.distance }}
              </p>
              <p class="desc-text">{{ place.description }}</p>

              <div class="hero-meta">
                <div class="meta-item">
                  <app-icon name="clock" [size]="16"></app-icon>
                  <div>
                    <small>Horario</small>
                    <strong>{{ place.openingHours || 'Abierto' }}</strong>
                  </div>
                </div>
                <div class="meta-item">
                  <app-icon name="sparkles" [size]="16"></app-icon>
                  <div>
                    <small>Fiabilidad comunitaria</small>
                    <strong>{{ place.reliability }}% confirmada</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sensory Meters Breakdown -->
            <div class="section-card">
              <div class="section-title">
                <h3>Condiciones sensoriales calculadas</h3>
                <span class="hour-indicator">
                  A las {{ formatHour(placesService.simulatedHour()) }}
                  @if (placesService.isSimulatingHour()) { (simulado) }
                </span>
              </div>

              <div class="sensory-meters">
                <!-- Ruido -->
                <div class="meter-block">
                  <div class="meter-header">
                    <div class="meter-label">
                      <app-icon name="noise" [size]="18" className="icon-noise"></app-icon>
                      <strong>Ruido</strong>
                    </div>
                    <span class="meter-val-tag" [class]="getNoiseClass()">
                      {{ currentSensory()?.levels?.noise }}% · {{ noiseLabel().level }}
                    </span>
                  </div>
                  <div class="meter-bar-track">
                    <div
                      class="meter-bar-fill fill-noise"
                      [style.width.%]="currentSensory()?.levels?.noise"
                    ></div>
                  </div>
                  <p class="meter-desc">{{ noiseLabel().description }}</p>
                </div>

                <!-- Iluminación -->
                <div class="meter-block">
                  <div class="meter-header">
                    <div class="meter-label">
                      <app-icon name="light" [size]="18" className="icon-light"></app-icon>
                      <strong>Iluminación</strong>
                    </div>
                    <span class="meter-val-tag" [class]="getLightingClass()">
                      {{ currentSensory()?.levels?.lighting }}% · {{ lightingLabel().level }}
                    </span>
                  </div>
                  <div class="meter-bar-track">
                    <div
                      class="meter-bar-fill fill-light"
                      [style.width.%]="currentSensory()?.levels?.lighting"
                    ></div>
                  </div>
                  <p class="meter-desc">{{ lightingLabel().description }}</p>
                </div>

                <!-- Aglomeración -->
                <div class="meter-block">
                  <div class="meter-header">
                    <div class="meter-label">
                      <app-icon name="crowd" [size]="18" className="icon-crowd"></app-icon>
                      <strong>Aglomeración</strong>
                    </div>
                    <span class="meter-val-tag" [class]="getCrowdClass()">
                      {{ currentSensory()?.levels?.crowd }}% · {{ crowdLabel().level }}
                    </span>
                  </div>
                  <div class="meter-bar-track">
                    <div
                      class="meter-bar-fill fill-crowd"
                      [style.width.%]="currentSensory()?.levels?.crowd"
                    ></div>
                  </div>
                  <p class="meter-desc">{{ crowdLabel().description }}</p>
                </div>
              </div>
            </div>

            <!-- Smart Environmental Inferences Section (Crucial Feature Requested by User) -->
            <div class="section-card env-factors-card">
              <div class="section-title">
                <div class="title-with-badge">
                  <app-icon name="sparkles" [size]="20" className="sparkle-icon"></app-icon>
                  <div>
                    <h3>Factores lógicos del entorno (Automáticos)</h3>
                    <p class="sub-desc">
                      Estímulos inferidos por ubicación urbana sin requerir que otro usuario los proponga.
                    </p>
                  </div>
                </div>
              </div>

              @if (place.environmentalFactors.length > 0) {
                <div class="env-factors-list">
                  @for (factor of place.environmentalFactors; track factor.id) {
                    <div
                      class="env-factor-item"
                      [class.active-now]="isFactorActiveNow(factor)"
                    >
                      <div class="factor-icon-wrap">
                        @switch (factor.type) {
                          @case ('train_station') {
                            <app-icon name="train" [size]="22"></app-icon>
                          }
                          @case ('metro') {
                            <app-icon name="train" [size]="22"></app-icon>
                          }
                          @case ('traffic_congestion') {
                            <app-icon name="parking" [size]="22"></app-icon>
                          }
                          @case ('festive_lights') {
                            <app-icon name="sparkles" [size]="22"></app-icon>
                          }
                          @case ('shopping_mall_parking') {
                            <app-icon name="parking" [size]="22"></app-icon>
                          }
                          @case ('school') {
                            <app-icon name="building" [size]="22"></app-icon>
                          }
                          @case ('pedestrian_quiet') {
                            <app-icon name="tree" [size]="22"></app-icon>
                          }
                          @default {
                            <app-icon name="location" [size]="22"></app-icon>
                          }
                        }
                      </div>

                      <div class="factor-content">
                        <div class="factor-header-line">
                          <strong>{{ factor.name }}</strong>
                          @if (isFactorActiveNow(factor)) {
                            <span class="active-badge">Activo ahora (+{{ factor.noiseImpactDelta }}% estímulo)</span>
                          } @else {
                            <span class="inactive-badge">Inactivo en esta hora</span>
                          }
                        </div>
                        <p>{{ factor.description }}</p>
                        @if (factor.peakMinuteNotes) {
                          <div class="peak-note">
                            <app-icon name="clock" [size]="14"></app-icon>
                            <span>{{ factor.peakMinuteNotes }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-factors">No se detectan fuentes masivas de ruido o aglomeración en un radio de 500 m.</p>
              }
            </div>

            <!-- Dispute / Community Verification Block -->
            <div class="section-card community-trust-card">
              <div class="trust-summary">
                <app-icon name="check" [size]="22" className="check-trust"></app-icon>
                <div>
                  <strong>Fiabilidad comunitaria: {{ place.reliability }}%</strong>
                  <p>Basado en {{ place.reviewsCount }} valoraciones verificadas.</p>
                </div>
                <button class="dispute-toggle-btn" (click)="toggleDispute()">
                  <app-icon name="alert" [size]="16"></app-icon>
                  <span>¿No coincide con tu visita?</span>
                </button>
              </div>

              @if (isDisputeOpen()) {
                <div class="dispute-box">
                  @if (disputeSent()) {
                    <div class="dispute-done">
                      <app-icon name="check" [size]="20"></app-icon>
                      <p>Gracias. Hemos registrado tu discrepancia para calibrar la fiabilidad del establecimiento.</p>
                    </div>
                  } @else {
                    <h4>Indica qué dato no coincide</h4>
                    <div class="reason-buttons">
                      @for (reason of ['Ruido', 'Iluminación', 'Aglomeración', 'Horarios', 'Factores del entorno']; track reason) {
                        <button
                          class="reason-btn"
                          [class.active]="selectedDisputeReason() === reason"
                          (click)="selectedDisputeReason.set(reason)"
                        >
                          {{ reason }}
                        </button>
                      }
                    </div>
                    <textarea
                      placeholder="Coméntanos brevemente qué observaste (ej: había obras cerca, o el tren hizo más ruido del previsto)..."
                      [value]="disputeComment()"
                      (input)="onDisputeCommentInput($event)"
                    ></textarea>
                    <div class="dispute-actions">
                      <button class="btn-cancel" (click)="toggleDispute()">Cancelar</button>
                      <button class="btn-send-dispute" (click)="sendDispute()">Enviar reporte</button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Community Reviews List -->
            <div class="section-card reviews-list-card">
              <div class="section-title">
                <h3>Experiencias recientes de usuarios</h3>
                <button class="add-review-link" (click)="placesService.setView('review')">
                  + Publicar mi experiencia
                </button>
              </div>

              @if (placesService.selectedPlaceReviews().length > 0) {
                <div class="reviews-feed">
                  @for (rev of placesService.selectedPlaceReviews(); track rev.id) {
                    <div class="review-entry">
                      <div class="rev-header">
                        <span class="rev-avatar">{{ rev.userAvatar || 'MM' }}</span>
                        <div class="rev-user">
                          <strong>{{ rev.userName }}</strong>
                          <small>{{ rev.dayOfWeek }} · {{ rev.timeSlot }}</small>
                        </div>
                        <span class="rev-date">{{ rev.createdAt }}</span>
                      </div>

                      <div class="rev-tags">
                        <span class="rev-tag">Ruido: {{ rev.noiseLevel }}/5</span>
                        <span class="rev-tag">Luz: {{ rev.lightingLevel }}/5</span>
                        <span class="rev-tag">Gente: {{ rev.crowdLevel }}/5</span>
                      </div>

                      @if (rev.comment) {
                        <p class="rev-comment">{{ rev.comment }}</p>
                      }

                      <div class="rev-footer">
                        <button
                          class="confirm-trust-btn"
                          [class.confirmed]="rev.isConfirmedByMe"
                          (click)="placesService.confirmReview(rev.id)"
                        >
                          <app-icon name="check" [size]="14"></app-icon>
                          <span>
                            @if (rev.isConfirmedByMe) {
                              Confirmado por ti ({{ rev.confirmationsCount }})
                            } @else {
                              Coincido ({{ rev.confirmationsCount }})
                            }
                          </span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-reviews">Aún no hay valoraciones directas de usuarios. Sé la primera persona en compartir tu experiencia.</p>
              }
            </div>
          </div>

          <!-- Schedule & Sidebar Column -->
          <div class="sidebar-col">
            <!-- Recommended Hours Card -->
            <div class="schedule-card">
              <div class="schedule-header">
                <div>
                  <h3>Mejores horas para ir</h3>
                  <p>Previsión horaria para planificar tu visita</p>
                </div>
                <app-icon name="clock" [size]="20"></app-icon>
              </div>

              <!-- Recommendation Banner -->
              <div class="best-slot-box">
                <app-icon name="check" [size]="20" className="best-icon"></app-icon>
                <div>
                  <small>TRAMO RECOMENDADO MÁS TRANQUILO</small>
                  <strong>{{ place.recommendedSlot || '16:00 — 18:00' }}</strong>
                  <p>Mínimo estímulo de ruido y poca concurrencia esperada.</p>
                </div>
              </div>

              <!-- 24-Hour Forecast Bar Chart -->
              <div class="hourly-forecast-chart">
                <div class="chart-bars">
                  @for (slot of placesService.selectedPlaceForecast(); track slot.hour) {
                    <div
                      class="hour-col"
                      [class.current]="slot.hourNumber === placesService.simulatedHour()"
                      (click)="placesService.setSimulatedHour(slot.hourNumber)"
                      [title]="slot.hour + ': Ruido ' + slot.noise + '%, Gente ' + slot.crowd + '%'"
                    >
                      <div class="bar-fill-wrap">
                        <span
                          class="bar-fill"
                          [class]="slot.tone"
                          [style.height.%]="getBarHeight(slot)"
                        ></span>
                      </div>
                      <small class="hour-txt">{{ slot.hour.slice(0, 2) }}</small>
                    </div>
                  }
                </div>

                <div class="chart-legend">
                  <span><i class="dot calm"></i> Tranquilo</span>
                  <span><i class="dot medium"></i> Moderado</span>
                  <span><i class="dot busy"></i> Intenso</span>
                </div>
              </div>

              <div class="action-cta-wrap">
                <button class="primary-rate-cta" (click)="placesService.setView('review')">
                  <app-icon name="plus" [size]="18"></app-icon>
                  <span>Añadir valoración</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="detail-empty-state">
        <app-icon name="map" [size]="36"></app-icon>
        <h2>Ningún lugar seleccionado</h2>
        <p>Elige cualquier local o zona de Málaga en el mapa o en la lista para consultar sus niveles sensoriales.</p>
        <button class="back-btn" (click)="placesService.setView('map')">
          <app-icon name="arrow" [size]="16"></app-icon>
          <span>Ir al mapa</span>
        </button>
      </div>
    }
  `,
  styles: [`
    .detail-empty-state {
      max-width: 480px;
      margin: 72px auto;
      padding: 36px 28px;
      text-align: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
    }
    .detail-empty-state h2 {
      font-size: 20px;
      color: var(--text-primary);
      margin: 4px 0 0;
    }
    .detail-empty-state p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 8px;
    }
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      width: 100%;
    }
    .detail-header-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-weight: 600;
      font-size: 13.5px;
      color: var(--text-primary);
      transition: background 0.2s;
    }
    .back-btn:hover {
      background: var(--bg-surface-soft);
    }
    .quick-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .status-indicator.calm { background: var(--accent-green); }
    .status-indicator.medium { background: var(--accent-amber); }
    .status-indicator.busy { background: var(--accent-coral); }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }
    .main-info-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .hero-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-top: 4px solid var(--accent-calm);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .category-tag {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-green);
      background: var(--accent-green-light);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .hero-card h2 {
      font-family: var(--font-display);
      font-size: 1.85rem;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .address-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .desc-text {
      font-size: 14.5px;
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .hero-meta {
      display: flex;
      gap: 24px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .meta-item small {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
    }
    .meta-item strong {
      font-size: 13.5px;
      color: var(--text-primary);
    }

    .section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 22px;
      box-shadow: var(--shadow-sm);
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .section-title h3 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      color: var(--text-primary);
    }
    .hour-indicator {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-calm);
      background: var(--accent-calm-light);
      padding: 3px 9px;
      border-radius: var(--radius-full);
    }

    /* Sensory Meters */
    .sensory-meters {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .meter-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .meter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meter-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-primary);
    }
    .meter-val-tag {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .meter-val-tag.calm { background: var(--accent-green-light); color: var(--accent-green); }
    .meter-val-tag.medium { background: var(--accent-amber-light); color: var(--accent-amber); }
    .meter-val-tag.busy { background: var(--accent-coral-light); color: var(--accent-coral); }

    .meter-bar-track {
      width: 100%;
      height: 8px;
      background: var(--bg-surface-soft);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .meter-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.35s ease;
    }
    .fill-noise { background: var(--accent-calm); }
    .fill-light { background: var(--accent-amber); }
    .fill-crowd { background: var(--accent-coral); }
    .meter-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
    }

    /* Environmental Factors Card */
    .title-with-badge {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .sparkle-icon {
      color: var(--accent-amber);
    }
    .sub-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .env-factors-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .env-factor-item {
      display: flex;
      gap: 14px;
      padding: 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      transition: all 0.25s;
    }
    .env-factor-item.active-now {
      border-color: var(--accent-amber);
      background: var(--accent-amber-light);
    }
    .factor-icon-wrap {
      color: var(--accent-calm);
    }
    .env-factor-item.active-now .factor-icon-wrap {
      color: var(--accent-amber);
    }
    .factor-content {
      flex: 1;
    }
    .factor-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .factor-header-line strong {
      font-size: 13.5px;
      color: var(--text-primary);
    }
    .active-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-amber);
    }
    .inactive-badge {
      font-size: 11px;
      color: var(--text-muted);
    }
    .factor-content p {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.45;
    }
    .peak-note {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--accent-amber);
    }

    /* Community Trust & Dispute */
    .trust-summary {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .check-trust {
      color: var(--accent-green);
    }
    .trust-summary strong {
      font-size: 14px;
      color: var(--text-primary);
      display: block;
    }
    .trust-summary p {
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .dispute-toggle-btn {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--accent-calm);
      border: 1px solid var(--border-subtle);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
    }
    .dispute-toggle-btn:hover {
      background: var(--bg-surface-soft);
    }
    .dispute-box {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }
    .dispute-box h4 {
      font-size: 13.5px;
      margin-bottom: 10px;
      color: var(--text-primary);
    }
    .reason-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .reason-btn {
      padding: 5px 12px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .reason-btn.active {
      background: var(--accent-calm);
      color: white;
      border-color: var(--accent-calm);
    }
    .dispute-box textarea {
      width: 100%;
      min-height: 70px;
      resize: vertical;
      margin-bottom: 10px;
    }
    .dispute-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-cancel {
      padding: 6px 12px;
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .btn-send-dispute {
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      background: var(--accent-calm);
      color: white;
      font-size: 12.5px;
      font-weight: 600;
    }
    .dispute-done {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent-green);
      font-size: 13px;
    }

    /* Reviews Feed */
    .add-review-link {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent-calm);
    }
    .reviews-feed {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .review-entry {
      padding: 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
    }
    .rev-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .rev-avatar {
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
    .rev-user strong {
      font-size: 13px;
      color: var(--text-primary);
      display: block;
    }
    .rev-user small {
      font-size: 11px;
      color: var(--text-muted);
    }
    .rev-date {
      margin-left: auto;
      font-size: 11px;
      color: var(--text-muted);
    }
    .rev-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .rev-tag {
      font-size: 11.5px;
      font-weight: 600;
      background: var(--bg-surface);
      padding: 2px 7px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }
    .rev-comment {
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-primary);
      margin-bottom: 10px;
    }
    .confirm-trust-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      transition: all 0.2s;
    }
    .confirm-trust-btn.confirmed {
      background: var(--accent-green-light);
      color: var(--accent-green);
      border-color: var(--accent-green);
    }

    /* Schedule Card */
    .schedule-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 22px;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 90px;
    }
    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .schedule-header h3 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      color: var(--text-primary);
    }
    .schedule-header p {
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .best-slot-box {
      display: flex;
      gap: 12px;
      background: var(--accent-green-light);
      padding: 14px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(72, 128, 101, 0.2);
      margin-bottom: 20px;
    }
    .best-icon {
      color: var(--accent-green);
    }
    .best-slot-box small {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--accent-green);
      letter-spacing: 0.5px;
      display: block;
    }
    .best-slot-box strong {
      font-size: 1.1rem;
      color: var(--text-primary);
      display: block;
      margin: 2px 0;
    }
    .best-slot-box p {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Hourly Forecast Chart */
    .hourly-forecast-chart {
      margin-bottom: 24px;
    }
    .chart-bars {
      display: flex;
      align-items: flex-end;
      height: 130px;
      gap: 6px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .hour-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      cursor: pointer;
    }
    .bar-fill-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .bar-fill {
      width: 100%;
      max-width: 14px;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
    }
    .bar-fill.calm { background: var(--accent-calm); }
    .bar-fill.medium { background: var(--accent-amber); }
    .bar-fill.busy { background: var(--accent-coral); }

    .hour-col.current .bar-fill {
      outline: 2px solid var(--text-primary);
      outline-offset: 1px;
    }
    .hour-txt {
      font-size: 10.5px;
      color: var(--text-muted);
      margin-top: 6px;
    }
    .hour-col.current .hour-txt {
      font-weight: 700;
      color: var(--accent-calm);
    }
    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 12px;
      font-size: 11.5px;
      color: var(--text-secondary);
    }
    .chart-legend span {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .chart-legend .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .chart-legend .dot.calm { background: var(--accent-calm); }
    .chart-legend .dot.medium { background: var(--accent-amber); }
    .chart-legend .dot.busy { background: var(--accent-coral); }

    .primary-rate-cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--accent-calm);
      color: white;
      padding: 12px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 700;
      box-shadow: var(--shadow-sm);
      transition: background 0.2s;
    }
    .primary-rate-cta:hover {
      background: var(--accent-calm-dark);
    }

    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .schedule-card {
        position: static;
      }
    }
  `],
})
export class PlaceDetailComponent {
  readonly placesService = inject(PlacesService);
  private readonly contextEngine = inject(ContextEngineService);

  readonly isDisputeOpen = signal<boolean>(false);
  readonly selectedDisputeReason = signal<string>('Ruido');
  readonly disputeComment = signal<string>('');
  readonly disputeSent = signal<boolean>(false);

  readonly currentSensory = computed(() => {
    return this.placesService.effectiveSelectedSensory();
  });

  readonly noiseLabel = computed(() => {
    const val = this.currentSensory()?.levels?.noise || 30;
    return this.contextEngine.getSensoryLabel('noise', val);
  });

  readonly lightingLabel = computed(() => {
    const val = this.currentSensory()?.levels?.lighting || 30;
    return this.contextEngine.getSensoryLabel('lighting', val);
  });

  readonly crowdLabel = computed(() => {
    const val = this.currentSensory()?.levels?.crowd || 30;
    return this.contextEngine.getSensoryLabel('crowd', val);
  });

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  getNoiseClass(): string {
    const val = this.currentSensory()?.levels?.noise || 0;
    if (val <= 33) return 'calm';
    if (val <= 66) return 'medium';
    return 'busy';
  }

  getLightingClass(): string {
    const val = this.currentSensory()?.levels?.lighting || 0;
    if (val <= 33) return 'calm';
    if (val <= 66) return 'medium';
    return 'busy';
  }

  getCrowdClass(): string {
    const val = this.currentSensory()?.levels?.crowd || 0;
    if (val <= 33) return 'calm';
    if (val <= 66) return 'medium';
    return 'busy';
  }

  currentSensoryTone(): string {
    const val = this.currentSensory()?.levels?.noise || 30;
    if (val <= 35) return 'calm';
    if (val <= 65) return 'medium';
    return 'busy';
  }

  currentSensorySummary(): string {
    const val = this.currentSensory()?.levels?.noise || 30;
    if (val <= 35) return 'Tranquilo y apacible';
    if (val <= 65) return 'Estímulos moderados';
    return 'Ruido o afluencia elevada';
  }

  isFactorActiveNow(factor: any): boolean {
    const hour = this.placesService.simulatedHour();
    return factor.activeHours.includes(hour);
  }

  getBarHeight(slot: any): number {
    return Math.max(15, Math.min(100, (slot.noise * 0.6) + (slot.crowd * 0.4)));
  }

  toggleDispute() {
    this.isDisputeOpen.set(!this.isDisputeOpen());
    this.disputeSent.set(false);
  }

  onDisputeCommentInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.disputeComment.set(textarea.value);
  }

  sendDispute() {
    const place = this.placesService.selectedPlace();
    if (!place) return;
    this.placesService.submitDispute({
      placeId: place.id,
      placeName: place.name,
      reason: this.selectedDisputeReason() as any,
      comment: this.disputeComment(),
    });
    this.disputeSent.set(true);
    setTimeout(() => {
      this.isDisputeOpen.set(false);
    }, 2500);
  }
}
