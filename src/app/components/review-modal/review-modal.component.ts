import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, PLATFORM_ID, computed, effect, inject, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlacesService } from '../../services/places.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="review-view-container">
      @if (isSubmitted()) {
        <!-- Success State -->
        <div class="success-screen">
          <div class="success-card">
            <div class="success-icon">
              <app-icon name="check" [size]="36"></app-icon>
            </div>
            <span class="success-tag">REGISTRADO CON ÉXITO</span>
            <h2>¡Gracias por tu aportación!</h2>
            <p>
              @if (locationKind() === 'zone') {
                La nueva zona sensorial con radio de {{ zoneRadius() }} m ha sido añadida al mapa con su correspondiente perfil de estímulos para el intervalo {{ formattedTimeSlot() }}.
              } @else {
                Tu valoración para el intervalo de {{ formattedTimeSlot() }} ha sido añadida para calcular las condiciones actuales y mejorar la fiabilidad del establecimiento.
              }
            </p>
            <div class="success-actions">
              <button class="btn-return-map" (click)="goToMap()">
                Ver en el mapa
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Form State -->
        <div class="form-header-nav">
          <button class="back-link" (click)="placesService.setView('map')">
            <app-icon name="arrow" [size]="18"></app-icon>
            <span>Cancelar y volver</span>
          </button>
        </div>

        <div class="form-layout-grid">
          <div class="form-main-col">
            <!-- Kind Selector: Local vs Zone -->
            <div class="kind-selection-box">
              <label class="kind-title">¿Qué deseas señalar o valorar?</label>
              <div class="kind-btn-group">
                <button
                  type="button"
                  class="kind-btn"
                  [class.active]="locationKind() === 'local'"
                  (click)="locationKind.set('local')"
                >
                  <app-icon name="home" [size]="18"></app-icon>
                  <div>
                    <strong>Un local</strong>
                    <small>Cafetería, biblioteca, tienda...</small>
                  </div>
                </button>

                <button
                  type="button"
                  class="kind-btn"
                  [class.active]="locationKind() === 'zone'"
                  (click)="locationKind.set('zone')"
                >
                  <app-icon name="map" [size]="18"></app-icon>
                  <div>
                    <strong>Una zona abierta</strong>
                    <small>Calle, parque, plaza con rango</small>
                  </div>
                </button>
              </div>
            </div>

            <!-- Target Selection -->
            @if (locationKind() === 'local') {
              <div class="field-card">
                <label class="field-label">Selecciona el establecimiento</label>
                <select
                  [value]="selectedLocalPlaceId()"
                  (change)="onPlaceSelected($event)"
                  class="styled-select"
                >
                  @for (place of localPlaces(); track place.id) {
                    <option [value]="place.id">{{ place.name }} ({{ place.address }})</option>
                  }
                </select>
              </div>
            } @else {
              <!-- Interactive Zone Picker with Radius / Range on Mini-Map -->
              <div class="field-card zone-picker-card">
                <div class="zone-picker-header">
                  <div>
                    <label class="field-label">Marca el centro de la zona en el mapa</label>
                    <p class="picker-instruction">Haz clic o pulsa en cualquier punto del mapa para ubicar la zona.</p>
                  </div>
                  @if (zoneCoordinates(); as coords) {
                    <span class="coord-tag">
                      <app-icon name="check" [size]="14"></app-icon>
                      Punto fijado
                    </span>
                  }
                </div>

                <!-- Interactive Real OpenStreetMap Picker for dropping zone center -->
                <div class="mini-map-picker-wrap">
                  <div
                    #zonePickerMap
                    class="real-map-canvas mini-leaflet-map"
                    [class.map-night]="isMapNight()"
                    [class.map-day]="!isMapNight()"
                    aria-label="Mapa real de Málaga para seleccionar la zona"
                  ></div>
                  @if (!zoneGeoCoordinates()) {
                    <div class="mini-map-hint">
                      <app-icon name="location" [size]="15"></app-icon>
                      <span>Haz clic en el mapa para situar el centro de la zona</span>
                    </div>
                  }
                </div>

                <!-- Range / Radius Selector -->
                <div class="radius-control-bar">
                  <div class="radius-info">
                    <strong>Rango / Radio de cobertura:</strong>
                    <span class="radius-val">{{ zoneRadius() }} metros</span>
                  </div>

                  <div class="radius-actions">
                    <button type="button" (click)="adjustRadius(-30)" title="Reducir radio">
                      -
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="400"
                      step="25"
                      [value]="zoneRadius()"
                      (input)="onRadiusSlider($event)"
                      aria-label="Radio en metros"
                    />
                    <button type="button" (click)="adjustRadius(30)" title="Aumentar radio">
                      +
                    </button>
                  </div>
                </div>

                <!-- Zone Name Input -->
                <div class="zone-name-input">
                  <label>Nombre de la zona</label>
                  <input
                    type="text"
                    placeholder="Ej.: Plaza de la Merced, Calle Granada..."
                    [value]="zoneName()"
                    (input)="onZoneNameInput($event)"
                  />
                </div>
              </div>
            }

            <!-- Sensory Sliders Section: Both Slider Bar AND Numbers -->
            <div class="field-card">
              <div class="sensory-section-head">
                <label class="field-label">Niveles de estímulos percibidos</label>
                <small class="head-hint">Puedes pulsar un número o deslizar la barrita</small>
              </div>

              <!-- Ruido: Barrita + Números -->
              <div class="sensory-slider-group">
                <div class="slider-title-row">
                  <div class="slider-name">
                    <app-icon name="noise" [size]="18" className="icon-noise"></app-icon>
                    <strong>Nivel de ruido</strong>
                  </div>
                  <span class="slider-val-tag" [class]="getSensoryTone('noise')">
                    {{ getSensoryLabelText('noise') }} (Nivel {{ noise() }})
                  </span>
                </div>

                <!-- Slider Bar -->
                <div class="slider-bar-wrap">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    [value]="noise()"
                    (input)="onNoiseSlider($event)"
                    class="sensory-range-slider noise-slider"
                    [style.--slider-fill]="getFillPercentage(noise())"
                    aria-label="Barra deslizante de nivel de ruido"
                  />
                </div>

                <!-- Number Buttons (1-5) synchronized with Slider -->
                <div class="rating-scale-buttons">
                  @for (val of [1, 2, 3, 4, 5]; track val) {
                    <button
                      type="button"
                      class="scale-btn"
                      [class.filled]="val <= noise()"
                      [class.active-thumb]="val === noise()"
                      (click)="noise.set(val)"
                      [attr.aria-label]="'Ruido nivel ' + val"
                    >
                      {{ val }}
                    </button>
                  }
                </div>
                <div class="scale-legends">
                  <small>1 · Silencioso</small>
                  <small>3 · Moderado</small>
                  <small>5 · Muy ruidoso</small>
                </div>
              </div>

              <!-- Iluminación: Barrita + Números -->
              <div class="sensory-slider-group">
                <div class="slider-title-row">
                  <div class="slider-name">
                    <app-icon name="light" [size]="18" className="icon-light"></app-icon>
                    <strong>Intensidad de la iluminación</strong>
                  </div>
                  <span class="slider-val-tag" [class]="getSensoryTone('light')">
                    {{ getSensoryLabelText('light') }} (Nivel {{ lighting() }})
                  </span>
                </div>

                <!-- Slider Bar -->
                <div class="slider-bar-wrap">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    [value]="lighting()"
                    (input)="onLightingSlider($event)"
                    class="sensory-range-slider light-slider"
                    [style.--slider-fill]="getFillPercentage(lighting())"
                    aria-label="Barra deslizante de intensidad de la luz"
                  />
                </div>

                <!-- Number Buttons (1-5) synchronized with Slider -->
                <div class="rating-scale-buttons">
                  @for (val of [1, 2, 3, 4, 5]; track val) {
                    <button
                      type="button"
                      class="scale-btn"
                      [class.filled]="val <= lighting()"
                      [class.active-thumb]="val === lighting()"
                      (click)="lighting.set(val)"
                      [attr.aria-label]="'Luz nivel ' + val"
                    >
                      {{ val }}
                    </button>
                  }
                </div>
                <div class="scale-legends">
                  <small>1 · Luz tenue / Indirecta</small>
                  <small>3 · Media equilibrada</small>
                  <small>5 · Muy intensa</small>
                </div>
              </div>

              <!-- Aglomeración: Barrita + Números -->
              <div class="sensory-slider-group">
                <div class="slider-title-row">
                  <div class="slider-name">
                    <app-icon name="crowd" [size]="18" className="icon-crowd"></app-icon>
                    <strong>Cantidad de personas</strong>
                  </div>
                  <span class="slider-val-tag" [class]="getSensoryTone('crowd')">
                    {{ getSensoryLabelText('crowd') }} (Nivel {{ crowd() }})
                  </span>
                </div>

                <!-- Slider Bar -->
                <div class="slider-bar-wrap">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    [value]="crowd()"
                    (input)="onCrowdSlider($event)"
                    class="sensory-range-slider crowd-slider"
                    [style.--slider-fill]="getFillPercentage(crowd())"
                    aria-label="Barra deslizante de aglomeración"
                  />
                </div>

                <!-- Number Buttons (1-5) synchronized with Slider -->
                <div class="rating-scale-buttons">
                  @for (val of [1, 2, 3, 4, 5]; track val) {
                    <button
                      type="button"
                      class="scale-btn"
                      [class.filled]="val <= crowd()"
                      [class.active-thumb]="val === crowd()"
                      (click)="crowd.set(val)"
                      [attr.aria-label]="'Personas nivel ' + val"
                    >
                      {{ val }}
                    </button>
                  }
                </div>
                <div class="scale-legends">
                  <small>1 · Casi vacío</small>
                  <small>3 · Concurrencia media</small>
                  <small>5 · Aglomerado</small>
                </div>
              </div>
            </div>

            <!-- Time Interval: Exact Hours & Presets -->
            <div class="field-card time-interval-card">
              <div class="time-card-head">
                <div>
                  <label class="field-label">¿En qué horario ocurre este ambiente?</label>
                  <p class="time-subhead">Indica las horas exactas de inicio y fin, o pulsa un acceso rápido.</p>
                </div>
                <span class="interval-badge">
                  <app-icon name="clock" [size]="14"></app-icon>
                  {{ formattedDuration() }}
                </span>
              </div>

              <!-- Quick Presets -->
              <div class="time-presets">
                <button
                  type="button"
                  class="preset-btn"
                  [class.active]="timePreset() === 'now'"
                  (click)="applyPreset('now')"
                >
                  Ahora (1 h)
                </button>
                <button
                  type="button"
                  class="preset-btn"
                  [class.active]="timePreset() === '2h'"
                  (click)="applyPreset('2h')"
                >
                  Durante 2 h
                </button>
                <button
                  type="button"
                  class="preset-btn"
                  [class.active]="timePreset() === 'day'"
                  (click)="applyPreset('day')"
                >
                  Todo el día (08:00 - 21:30)
                </button>
                <button
                  type="button"
                  class="preset-btn custom-preset"
                  [class.active]="timePreset() === 'custom'"
                  (click)="timePreset.set('custom')"
                >
                  Hora exacta libre
                </button>
              </div>

              <!-- Exact Time Pickers -->
              <div class="exact-time-grid">
                <div class="time-input-group">
                  <label for="time-start">Hora de inicio:</label>
                  <div class="time-input-box">
                    <app-icon name="clock" [size]="16"></app-icon>
                    <input
                      id="time-start"
                      type="time"
                      [value]="exactStartTime()"
                      (input)="onStartTimeChange($event)"
                      aria-label="Hora de inicio exacta"
                    />
                  </div>
                </div>

                <div class="time-arrow-separator">
                  <span>→</span>
                </div>

                <div class="time-input-group">
                  <label for="time-end">Hora de fin:</label>
                  <div class="time-input-box">
                    <app-icon name="clock" [size]="16"></app-icon>
                    <input
                      id="time-end"
                      type="time"
                      [value]="exactEndTime()"
                      (input)="onEndTimeChange($event)"
                      aria-label="Hora de fin exacta"
                    />
                  </div>
                </div>
              </div>

              <!-- Selected Time Summary Indicator -->
              <div class="selected-time-summary">
                <app-icon name="check" [size]="14"></app-icon>
                <span>Franja seleccionada: <strong>{{ formattedTimeSlot() }}</strong> ({{ formattedDuration() }})</span>
              </div>
            </div>

            <!-- Optional Observations -->
            <div class="field-card">
              <label class="field-label">Detalles u observaciones <span>(Opcional)</span></label>
              <textarea
                rows="3"
                placeholder="Ejemplo: en la terraza se escucha el paso del tren, o las luces parpadean un poco al fondo..."
                [value]="comment()"
                (input)="onCommentInput($event)"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="form-submit-bar">
              <button
                type="button"
                class="btn-submit"
                [disabled]="locationKind() === 'zone' && !zoneCoordinates()"
                (click)="submitForm()"
              >
                <app-icon name="check" [size]="18"></app-icon>
                <span>
                  @if (locationKind() === 'zone') {
                    Guardar nueva zona sensorial
                  } @else {
                    Publicar valoración
                  }
                </span>
              </button>
            </div>
          </div>

          <!-- Sidebar Tips -->
          <div class="form-aside-col">
            <div class="aside-info-card">
              <div class="aside-badge">
                <app-icon name="sparkles" [size]="18"></app-icon>
                <strong>Inferencia contextual automática</strong>
              </div>
              <p>
                MoodMap cruzará tu aportación con las reglas de entorno: cercanía a vías ferroviarias, horarios de paso y parkings de centros comerciales.
              </p>
            </div>

            <div class="aside-info-card">
              <div class="aside-badge">
                <app-icon name="clock" [size]="18"></app-icon>
                <strong>Horas exactas</strong>
              </div>
              <p>
                Al especificar las horas exactas en las que percibiste los estímulos, ayudas a construir la curva horaria más precisa para otras personas.
              </p>
            </div>

            <div class="aside-info-card">
              <div class="aside-badge">
                <app-icon name="check" [size]="18"></app-icon>
                <strong>Comunidad y fiabilidad</strong>
              </div>
              <p>
                Tu valoración será ponderada con la de otros usuarios y perderá peso progresivamente si cambian las condiciones.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .review-view-container {
      max-width: 1050px;
      margin: 0 auto;
      padding: 24px;
      width: 100%;
    }
    .form-header-nav {
      margin-bottom: 20px;
    }
    .back-link {
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
    }

    .form-layout-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
    }
    .form-main-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-aside-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .field-label {
      display: block;
      font-family: var(--font-display);
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    .field-label span {
      font-size: 12px;
      font-weight: 400;
      color: var(--text-muted);
    }

    .kind-selection-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .kind-title {
      display: block;
      font-family: var(--font-display);
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    .kind-btn-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .kind-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      text-align: left;
      transition: all 0.2s;
    }
    .kind-btn.active {
      border-color: var(--accent-calm);
      background: var(--accent-calm-light);
      color: var(--accent-calm);
    }
    .kind-btn strong {
      display: block;
      font-size: 14px;
      color: var(--text-primary);
    }
    .kind-btn small {
      font-size: 11.5px;
      color: var(--text-secondary);
    }

    .styled-select {
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
    }

    /* Zone Picker on Mini Map */
    .zone-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .picker-instruction {
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .coord-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--accent-green);
      background: var(--accent-green-light);
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .mini-map-picker-wrap {
      position: relative;
      width: 100%;
      height: 240px;
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .mini-leaflet-map {
      width: 100%;
      height: 100%;
    }
    .mini-map-hint {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      pointer-events: none;
      white-space: nowrap;
    }

    .radius-control-bar {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      background: var(--bg-surface-soft);
      padding: 10px 14px;
      border-radius: var(--radius-md);
    }
    .radius-info strong {
      font-size: 13px;
      color: var(--text-primary);
    }
    .radius-val {
      margin-left: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--accent-calm);
    }
    .radius-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .radius-actions button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 16px;
      font-weight: bold;
      display: grid;
      place-items: center;
    }
    .radius-actions input[type="range"] {
      width: 110px;
      accent-color: var(--accent-calm);
    }

    .zone-name-input {
      margin-top: 14px;
    }
    .zone-name-input label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .zone-name-input input {
      width: 100%;
    }

    /* Sensory Sliders Header & Groups */
    .sensory-section-head {
      margin-bottom: 16px;
    }
    .sensory-section-head .field-label {
      margin-bottom: 2px;
    }
    .head-hint {
      font-size: 12px;
      color: var(--text-muted);
    }

    .sensory-slider-group {
      margin-bottom: 24px;
      background: var(--bg-surface-soft);
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .sensory-slider-group:last-child {
      margin-bottom: 0;
    }
    .slider-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .slider-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-primary);
    }
    .slider-val-tag {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--radius-full);
    }
    .slider-val-tag.calm { background: var(--accent-green-light); color: var(--accent-green); }
    .slider-val-tag.medium { background: var(--accent-amber-light); color: var(--accent-amber); }
    .slider-val-tag.busy { background: var(--accent-coral-light); color: var(--accent-coral); }

    /* Interactive Range Slider Bar */
    .slider-bar-wrap {
      width: 100%;
      margin-bottom: 12px;
      padding: 4px 0;
    }
    .sensory-range-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 10px;
      border-radius: var(--radius-full);
      background: var(--border-subtle);
      outline: none;
      border: none;
      cursor: pointer;
      position: relative;
    }
    .sensory-range-slider::-webkit-slider-runnable-track {
      height: 10px;
      border-radius: var(--radius-full);
      background: linear-gradient(
        to right,
        var(--accent-calm) 0%,
        var(--accent-calm) var(--slider-fill, 50%),
        var(--border-subtle) var(--slider-fill, 50%),
        var(--border-subtle) 100%
      );
    }
    .sensory-range-slider.noise-slider::-webkit-slider-runnable-track {
      background: linear-gradient(
        to right,
        var(--accent-calm) 0%,
        var(--accent-calm) var(--slider-fill, 50%),
        var(--border-subtle) var(--slider-fill, 50%),
        var(--border-subtle) 100%
      );
    }
    .sensory-range-slider.light-slider::-webkit-slider-runnable-track {
      background: linear-gradient(
        to right,
        var(--accent-amber) 0%,
        var(--accent-amber) var(--slider-fill, 50%),
        var(--border-subtle) var(--slider-fill, 50%),
        var(--border-subtle) 100%
      );
    }
    .sensory-range-slider.crowd-slider::-webkit-slider-runnable-track {
      background: linear-gradient(
        to right,
        var(--accent-coral) 0%,
        var(--accent-coral) var(--slider-fill, 50%),
        var(--border-subtle) var(--slider-fill, 50%),
        var(--border-subtle) 100%
      );
    }
    .sensory-range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 3px solid var(--accent-calm);
      cursor: pointer;
      margin-top: -7px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease;
    }
    .sensory-range-slider.light-slider::-webkit-slider-thumb {
      border-color: var(--accent-amber);
    }
    .sensory-range-slider.crowd-slider::-webkit-slider-thumb {
      border-color: var(--accent-coral);
    }
    .sensory-range-slider::-webkit-slider-thumb:hover,
    .sensory-range-slider:active::-webkit-slider-thumb {
      transform: scale(1.15);
    }

    /* Number Buttons synchronized with slider */
    .rating-scale-buttons {
      display: flex;
      gap: 8px;
    }
    .scale-btn {
      flex: 1;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-weight: 700;
      font-size: 14px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .scale-btn.filled {
      background: var(--accent-calm-light);
      border-color: var(--accent-calm);
      color: var(--accent-calm);
    }
    .scale-btn.active-thumb {
      background: var(--accent-calm);
      border-color: var(--accent-calm);
      color: white;
      box-shadow: 0 2px 6px rgba(70, 115, 153, 0.35);
    }
    .scale-legends {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Time Interval Card: Exact Hours */
    .time-card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .time-subhead {
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .interval-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--accent-calm-light);
      color: var(--accent-calm);
      font-size: 12px;
      font-weight: 700;
    }

    .time-presets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .preset-btn {
      padding: 7px 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-subtle);
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .preset-btn.active {
      background: var(--accent-calm);
      color: white;
      border-color: var(--accent-calm);
    }

    .exact-time-grid {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-surface-soft);
      padding: 14px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      margin-bottom: 12px;
    }
    .time-input-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .time-input-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .time-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
    }
    .time-input-box input[type="time"] {
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      width: 100%;
      padding: 0;
    }
    .time-arrow-separator {
      font-size: 18px;
      font-weight: bold;
      color: var(--text-muted);
      margin-top: 20px;
    }

    .selected-time-summary {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--accent-green);
      font-weight: 500;
    }
    .selected-time-summary strong {
      font-weight: 700;
    }

    textarea {
      width: 100%;
      resize: vertical;
    }

    .form-submit-bar {
      display: flex;
      justify-content: flex-end;
    }
    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      background: var(--accent-calm);
      color: white;
      font-size: 14px;
      font-weight: 700;
      box-shadow: var(--shadow-md);
      transition: background 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--accent-calm-dark);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .aside-info-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 16px;
      box-shadow: var(--shadow-sm);
    }
    .aside-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      color: var(--accent-calm);
      font-size: 13px;
    }
    .aside-info-card p {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Success Screen */
    .success-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 480px;
    }
    .success-card {
      max-width: 500px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--accent-green-light);
      color: var(--accent-green);
      margin: 0 auto 16px;
      display: grid;
      place-items: center;
    }
    .success-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--accent-green);
      display: block;
      margin-bottom: 8px;
    }
    .success-card h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      margin-bottom: 12px;
      color: var(--text-primary);
    }
    .success-card p {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn-return-map {
      background: var(--accent-calm);
      color: white;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 14px;
    }

    @media (max-width: 900px) {
      .form-layout-grid {
        grid-template-columns: 1fr;
      }
      .exact-time-grid {
        flex-direction: column;
        align-items: stretch;
      }
      .time-arrow-separator {
        display: none;
      }
    }
  `],
})
export class ReviewModalComponent implements OnDestroy {
  readonly placesService = inject(PlacesService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly zonePickerMapEl = viewChild<ElementRef<HTMLDivElement>>('zonePickerMap');

  readonly locationKind = signal<'local' | 'zone'>('local');
  readonly selectedLocalPlaceId = signal<string>('mercado-atarazanas');

  // Zone specific state
  readonly zoneCoordinates = signal<{ x: number; y: number } | null>(null);
  readonly zoneGeoCoordinates = signal<{ lat: number; lng: number } | null>(null);
  readonly zoneRadius = signal<number>(150);
  readonly zoneName = signal<string>('');

  private miniMap: any = null;
  private miniStyleLoaded = false;

  readonly isMapNight = computed(() => {
    const h = this.placesService.simulatedHour();
    return h < 7 || h >= 20;
  });

  // Sensory ratings (1 to 5)
  readonly noise = signal<number>(2);
  readonly lighting = signal<number>(2);
  readonly crowd = signal<number>(2);

  // Exact time state
  readonly exactStartTime = signal<string>('16:30');
  readonly exactEndTime = signal<string>('17:30');
  readonly timePreset = signal<'now' | '2h' | 'day' | 'custom'>('now');

  readonly comment = signal<string>('');
  readonly isSubmitted = signal<boolean>(false);

  readonly localPlaces = computed(() => {
    return this.placesService.places().filter((p) => p.kind === 'local');
  });

  readonly formattedTimeSlot = computed(() => {
    return `${this.exactStartTime()} — ${this.exactEndTime()}`;
  });

  readonly formattedDuration = computed(() => {
    const start = this.exactStartTime();
    const end = this.exactEndTime();
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    if (hours === 0 && mins === 0) return '0 min';
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
  });

  constructor() {
    const currentSelected = this.placesService.selectedPlace();
    if (currentSelected) {
      if (currentSelected.kind === 'local') {
        this.selectedLocalPlaceId.set(currentSelected.id);
      }
    }

    // Initialize start time with current hour if possible
    const now = new Date();
    const curH = String(now.getHours()).padStart(2, '0');
    const curM = String(now.getMinutes()).padStart(2, '0');
    const nextH = String((now.getHours() + 1) % 24).padStart(2, '0');
    this.exactStartTime.set(`${curH}:${curM}`);
    this.exactEndTime.set(`${nextH}:${curM}`);

    // Initialize or clean up MapLibre zone picker when switching between local and zone
    effect(() => {
      const el = this.zonePickerMapEl()?.nativeElement;
      const kind = this.locationKind();
      if (kind === 'zone' && el && isPlatformBrowser(this.platformId)) {
        this.initZonePickerMap(el);
      } else if (kind !== 'zone' && this.miniMap) {
        this.miniMap.remove();
        this.miniMap = null;
        this.miniStyleLoaded = false;
      }
    });

    // Redraw zone preview circle when radius or coordinates change
    effect(() => {
      const geo = this.zoneGeoCoordinates();
      const radius = this.zoneRadius();
      if (this.miniMap && this.miniStyleLoaded) {
        this.updateMiniZoneGeoJson(geo, radius);
      }
    });
  }

  ngOnDestroy() {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
    }
  }

  private async initZonePickerMap(el: HTMLDivElement) {
    if (this.miniMap) return;
    try {
      const maplibregl = await import('maplibre-gl');
      maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
      const night = this.isMapNight();

      this.miniMap = new maplibregl.Map({
        container: el,
        style: night
          ? 'https://tiles.openfreemap.org/styles/fiord'
          : 'https://tiles.openfreemap.org/styles/positron',
        center: [-4.4215, 36.7185],
        zoom: 14.8,
        attributionControl: false,
      });

      this.miniMap.on('style.load', () => {
        this.miniStyleLoaded = true;
        this.miniMap.addSource('zone-preview', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        this.miniMap.addLayer({
          id: 'zone-preview-fill',
          type: 'fill',
          source: 'zone-preview',
          paint: { 'fill-color': '#2c6e7f', 'fill-opacity': 0.22 },
        });
        this.miniMap.addLayer({
          id: 'zone-preview-line',
          type: 'line',
          source: 'zone-preview',
          paint: { 'line-color': '#2c6e7f', 'line-width': 2, 'line-dasharray': [3, 2] },
        });
        this.updateMiniZoneGeoJson(this.zoneGeoCoordinates(), this.zoneRadius());
      });

      this.miniMap.on('click', (e: any) => {
        this.zoneGeoCoordinates.set({
          lat: Number(e.lngLat.lat.toFixed(5)),
          lng: Number(e.lngLat.lng.toFixed(5)),
        });
        this.zoneCoordinates.set({ x: 50, y: 50 });
      });
    } catch (err) {
      console.warn('Could not initialize zone picker map', err);
    }
  }

  private updateMiniZoneGeoJson(geo: { lat: number; lng: number } | null, radiusMeters: number) {
    const src = this.miniMap?.getSource('zone-preview');
    if (!src) return;
    if (!geo) {
      src.setData({ type: 'FeatureCollection', features: [] });
      return;
    }
    const coords: number[][] = [];
    const earthRadius = 6378137;
    const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const dLng = dLat / Math.cos((geo.lat * Math.PI) / 180);
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * (2 * Math.PI);
      coords.push([geo.lng + dLng * Math.cos(theta), geo.lat + dLat * Math.sin(theta)]);
    }
    src.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } }],
    });
  }

  onPlaceSelected(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLocalPlaceId.set(select.value);
  }

  pickZonePoint(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    this.zoneCoordinates.set({ x, y });
  }

  getScaledRadius(): number {
    return Math.max(30, Math.min(120, this.zoneRadius() * 0.35));
  }

  adjustRadius(delta: number) {
    this.zoneRadius.set(Math.max(50, Math.min(450, this.zoneRadius() + delta)));
  }

  onRadiusSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    this.zoneRadius.set(parseInt(input.value, 10));
  }

  onZoneNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.zoneName.set(input.value);
  }

  onCommentInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.comment.set(textarea.value);
  }

  /* Sliders Handlers */
  onNoiseSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    this.noise.set(parseInt(input.value, 10));
  }

  onLightingSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    this.lighting.set(parseInt(input.value, 10));
  }

  onCrowdSlider(event: Event) {
    const input = event.target as HTMLInputElement;
    this.crowd.set(parseInt(input.value, 10));
  }

  getFillPercentage(val: number): string {
    // (val - 1) / (5 - 1) * 100%
    const pct = ((val - 1) / 4) * 100;
    return `${pct}%`;
  }

  /* Time Handlers */
  onStartTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.exactStartTime.set(input.value);
    this.timePreset.set('custom');
  }

  onEndTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.exactEndTime.set(input.value);
    this.timePreset.set('custom');
  }

  applyPreset(preset: 'now' | '2h' | 'day') {
    this.timePreset.set(preset);
    const now = new Date();
    const curH = now.getHours();
    const curM = String(now.getMinutes()).padStart(2, '0');

    if (preset === 'now') {
      const endH = String((curH + 1) % 24).padStart(2, '0');
      this.exactStartTime.set(`${String(curH).padStart(2, '0')}:${curM}`);
      this.exactEndTime.set(`${endH}:${curM}`);
    } else if (preset === '2h') {
      const endH = String((curH + 2) % 24).padStart(2, '0');
      this.exactStartTime.set(`${String(curH).padStart(2, '0')}:${curM}`);
      this.exactEndTime.set(`${endH}:${curM}`);
    } else if (preset === 'day') {
      this.exactStartTime.set('08:00');
      this.exactEndTime.set('21:30');
    }
  }

  getSensoryTone(type: 'noise' | 'light' | 'crowd'): string {
    const val = type === 'noise' ? this.noise() : type === 'light' ? this.lighting() : this.crowd();
    if (val <= 2) return 'calm';
    if (val === 3) return 'medium';
    return 'busy';
  }

  getSensoryLabelText(type: 'noise' | 'light' | 'crowd'): string {
    const val = type === 'noise' ? this.noise() : type === 'light' ? this.lighting() : this.crowd();
    if (type === 'noise') {
      if (val === 1) return 'Silencioso';
      if (val === 2) return 'Bajo';
      if (val === 3) return 'Moderado';
      if (val === 4) return 'Ruidoso';
      return 'Muy ruidoso';
    }
    if (type === 'light') {
      if (val === 1) return 'Luz tenue';
      if (val === 2) return 'Suave';
      if (val === 3) return 'Media';
      if (val === 4) return 'Intensa';
      return 'Muy intensa';
    }
    if (val === 1) return 'Casi vacío';
    if (val === 2) return 'Poca gente';
    if (val === 3) return 'Moderada';
    if (val === 4) return 'Concurrido';
    return 'Muy lleno';
  }

  submitForm() {
    const slotString = this.formattedTimeSlot();
    if (this.locationKind() === 'zone') {
      const coords = this.zoneCoordinates() || { x: 50, y: 50 };
      const geo = this.zoneGeoCoordinates() || { lat: 36.7185, lng: -4.4215 };
      this.placesService.addNewZone({
        name: this.zoneName().trim() || 'Zona de calle señalada',
        description: this.comment().trim() || 'Zona delimitada con rango específico por usuario.',
        coordinates: coords,
        geoCoordinates: geo,
        zoneRadius: this.zoneRadius(),
        noiseLevel: this.noise(),
        lightingLevel: this.lighting(),
        crowdLevel: this.crowd(),
        timeSlot: slotString,
        comment: this.comment(),
      });
    } else {
      const place = this.localPlaces().find((p) => p.id === this.selectedLocalPlaceId()) || this.localPlaces()[0];
      this.placesService.addReview({
        placeId: place.id,
        placeName: place.name,
        userId: 'user-lucia',
        userName: 'Lucía M.',
        userAvatar: 'LM',
        kind: 'local',
        noiseLevel: this.noise(),
        lightingLevel: this.lighting(),
        crowdLevel: this.crowd(),
        dayOfWeek: 'Hoy',
        timeSlot: slotString,
        exactStartTime: this.exactStartTime(),
        exactEndTime: this.exactEndTime(),
        timePreset: this.timePreset(),
        comment: this.comment(),
      });
    }

    this.isSubmitted.set(true);
  }

  goToMap() {
    this.isSubmitted.set(false);
    this.placesService.setView('map');
  }
}
