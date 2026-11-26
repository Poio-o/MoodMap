import { Injectable } from '@angular/core';
import { EnvironmentalFactor, HourlySensoryForecast, Place, SensoryLevels } from '../models/place.model';

@Injectable({
  providedIn: 'root',
})
export class ContextEngineService {
  /**
   * Calculates dynamic sensory impact based on baseline, user reports,
   * and automated logical environmental factors (train station arrivals, mall parking traffic, etc.)
   */
  calculateDynamicSensory(place: Place, hour: number): {
    levels: SensoryLevels;
    activeAlerts: string[];
    isPeakEnvironmental: boolean;
  } {
    let noise = place.baseSensory.noise;
    let crowd = place.baseSensory.crowd;
    let lighting = place.baseSensory.lighting;
    const activeAlerts: string[] = [];
    let isPeakEnvironmental = false;

    for (const factor of place.environmentalFactors) {
      const isActive = factor.activeHours.includes(hour);
      if (!isActive) continue;

      // Distance attenuation factor: 1.0 if right next (<50m), scaling down to 0.2 at 500m
      const attenuation = Math.max(0.2, 1 - factor.distanceMeters / 600);

      const noiseAdd = Math.round(factor.noiseImpactDelta * attenuation);
      const crowdAdd = Math.round(factor.crowdImpactDelta * attenuation);
      const lightingAdd = Math.round((factor.lightingImpactDelta ?? 0) * attenuation);

      noise = Math.min(100, Math.max(0, noise + noiseAdd));
      crowd = Math.min(100, Math.max(0, crowd + crowdAdd));
      lighting = Math.min(100, Math.max(0, lighting + lightingAdd));

      if (noiseAdd > 10 || crowdAdd > 15 || lightingAdd > 15) {
        isPeakEnvironmental = true;
      }

      let alertMsg = `${factor.name} (${factor.distanceMeters} m): `;
      if (factor.type === 'train_station') {
        alertMsg += factor.peakMinuteNotes
          ? `${factor.peakMinuteNotes} — aumento repentino de ruido y flujo de viajeros.`
          : 'Paso de trenes y salida de viajeros en hora punta.';
      } else if (factor.type === 'metro') {
        alertMsg += factor.peakMinuteNotes
          ? `${factor.peakMinuteNotes} — vibración subterránea y flujo continuo en boca de metro.`
          : 'Paso frecuente de metro y salida constante de pasajeros.';
      } else if (factor.type === 'traffic_congestion') {
        alertMsg += factor.peakMinuteNotes
          ? `${factor.peakMinuteNotes} — retenciones de tráfico, autobuses y ruido rodado.`
          : 'Alta congestión de tráfico rodado y autobuses en hora punta.';
      } else if (factor.type === 'festive_lights') {
        alertMsg += factor.peakMinuteNotes
          ? `${factor.peakMinuteNotes} — luces intensas, música ambiental y gran aglomeración.`
          : 'Iluminación festiva muy intensa, sonido sincronizado y multitud.';
      } else if (factor.type === 'shopping_mall_parking') {
        alertMsg += 'Tráfico rodado en accesos al parking y alta afluencia comercial.';
      } else if (factor.type === 'school') {
        alertMsg += 'Entrada/salida escolar, bullicio en aceras adyacentes.';
      } else if (factor.type === 'nightlife') {
        alertMsg += 'Concentración nocturna y terrazas con mayor ruido.';
      } else if (factor.type === 'pedestrian_quiet') {
        alertMsg += 'Área peatonal protegida del tráfico; ambiente más tranquilo.';
      }
      activeAlerts.push(alertMsg);
    }

    // Natural lighting adjustment depending on hour (daylight vs artificial lights)
    const hasFestiveLights = place.environmentalFactors.some(
      (f) => f.type === 'festive_lights' && f.activeHours.includes(hour)
    );
    if (!hasFestiveLights) {
      if (place.kind === 'zone') {
        if (hour < 7 || hour >= 20) {
          lighting = Math.max(15, Math.min(45, lighting * 0.6)); // streetlamps at night
        } else if (hour >= 12 && hour <= 16) {
          lighting = Math.min(95, lighting * 1.3); // bright midday sunlight
        }
      } else {
        // Indoor venue: evening artificial lights might be dimmer or intensified
        if (hour >= 20) {
          lighting = Math.max(25, lighting * 0.9);
        }
      }
    }

    return {
      levels: {
        noise: Math.round(noise),
        crowd: Math.round(crowd),
        lighting: Math.round(lighting),
      },
      activeAlerts,
      isPeakEnvironmental,
    };
  }

  /**
   * Generates a 24-hour (or full active day) sensory schedule with contextual labels
   */
  generateScheduleForecast(place: Place): HourlySensoryForecast[] {
    const hours = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ];

    return hours.map((hourNum) => {
      const calculation = this.calculateDynamicSensory(place, hourNum);
      const combinedScore = (calculation.levels.noise * 0.5) + (calculation.levels.crowd * 0.5);

      let tone: 'calm' | 'medium' | 'busy' = 'calm';
      if (combinedScore > 65) {
        tone = 'busy';
      } else if (combinedScore > 40) {
        tone = 'medium';
      }

      const hourStr = hourNum.toString().padStart(2, '0') + ':00';
      const mainAlert = calculation.activeAlerts.length > 0 ? calculation.activeAlerts[0] : undefined;

      return {
        hour: hourStr,
        hourNumber: hourNum,
        noise: calculation.levels.noise,
        crowd: calculation.levels.crowd,
        lighting: calculation.levels.lighting,
        tone,
        environmentalAlert: mainAlert,
      };
    });
  }

  /**
   * Interprets sensory levels for human readability and screen readers
   */
  getSensoryLabel(type: 'noise' | 'lighting' | 'crowd', value: number): {
    level: string;
    description: string;
  } {
    if (type === 'noise') {
      if (value <= 33) return { level: 'Bajo', description: 'Silencioso, apto para concentración y calma' };
      if (value <= 66) return { level: 'Moderado', description: 'Ruido de fondo tolerable, murmullo suave' };
      return { level: 'Alto', description: 'Ruidoso, música o tráfico elevado; recomendable protectores auditivos' };
    }
    if (type === 'lighting') {
      if (value <= 33) return { level: 'Suave', description: 'Luz tenue o indirecta, sin destellos intensos' };
      if (value <= 66) return { level: 'Media', description: 'Iluminación natural o cálida equilibrada' };
      return { level: 'Intensa', description: 'Luz blanca potente o posibles reflejos y pantallas' };
    }
    // Crowd
    if (value <= 33) return { level: 'Baja', description: 'Espacio despejado, distancia personal holgada' };
    if (value <= 66) return { level: 'Media', description: 'Afluencia moderada, mesas o pasillos con tránsito' };
    return { level: 'Alta', description: 'Aglomeración frecuente, colas o paso continuo de personas' };
  }
}
