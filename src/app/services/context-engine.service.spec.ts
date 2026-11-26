import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContextEngineService } from './context-engine.service';
import { Place } from '../models/place.model';

describe('ContextEngineService', () => {
  let service: ContextEngineService;

  const mockTrainPlace: Place = {
    id: 'test-place',
    name: 'Café de la Estación',
    category: 'Cafetería',
    kind: 'local',
    distance: '100 m',
    address: 'Calle Ferrocarril 1',
    description: 'Cafetería cerca de vías',
    coordinates: { x: 50, y: 50 },
    geoCoordinates: { lat: 40.4065, lng: -3.6896 },
    baseSensory: { noise: 30, lighting: 40, crowd: 25 },
    color: '#4f78a8',
    reliability: 90,
    reviewsCount: 10,
    verified: true,
    environmentalFactors: [
      {
        id: 'train-factor',
        type: 'train_station',
        name: 'Estación Central',
        description: 'Paso de trenes a las horas punta',
        distanceMeters: 80,
        noiseImpactDelta: 25,
        crowdImpactDelta: 20,
        activeHours: [8, 9, 14, 18, 19, 20],
        peakMinuteNotes: 'Tren cada 15 min',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextEngineService);
  });

  it('should increase noise and crowd during train active hours', () => {
    // 18:00 is active rush hour for the train factor
    const peakResult = service.calculateDynamicSensory(mockTrainPlace, 18);
    expect(peakResult.levels.noise).toBeGreaterThan(mockTrainPlace.baseSensory.noise);
    expect(peakResult.levels.crowd).toBeGreaterThan(mockTrainPlace.baseSensory.crowd);
    expect(peakResult.isPeakEnvironmental).toBe(true);
    expect(peakResult.activeAlerts.length).toBeGreaterThan(0);
    expect(peakResult.activeAlerts[0]).toContain('Estación Central');
  });

  it('should maintain baseline sensory levels during inactive hours (e.g. 11:00)', () => {
    const calmResult = service.calculateDynamicSensory(mockTrainPlace, 11);
    expect(calmResult.levels.noise).toBe(mockTrainPlace.baseSensory.noise);
    expect(calmResult.levels.crowd).toBe(mockTrainPlace.baseSensory.crowd);
    expect(calmResult.isPeakEnvironmental).toBe(false);
    expect(calmResult.activeAlerts.length).toBe(0);
  });

  it('should generate a 24-hour schedule forecast correctly', () => {
    const forecast = service.generateScheduleForecast(mockTrainPlace);
    expect(forecast.length).toBe(15); // 8:00 to 22:00
    const slot18 = forecast.find((s) => s.hourNumber === 18);
    expect(slot18).toBeDefined();
    expect(slot18?.tone).not.toBe('calm');
  });
});
