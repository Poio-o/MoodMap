import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PlacesService } from './places.service';

describe('PlacesService', () => {
  let service: PlacesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlacesService);
  });

  it('should initialize with Málaga places and no place selected by default', () => {
    expect(service.places().length).toBeGreaterThanOrEqual(8);
    expect(service.selectedPlaceId()).toBeNull();
    expect(service.selectedPlace()).toBeNull();

    service.selectPlace('mercado-atarazanas');
    expect(service.selectedPlace()?.id).toBe('mercado-atarazanas');

    service.clearSelection();
    expect(service.selectedPlaceId()).toBeNull();
    expect(service.selectedPlace()).toBeNull();
  });

  it('should toggle theme between light and dark', () => {
    expect(service.theme()).toBe('light');
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });

  it('should allow adding a new open sensory zone with custom range', () => {
    const initialCount = service.places().length;
    const newZone = service.addNewZone({
      name: 'Plaza del Sol Tranquila',
      description: 'Zona peatonal sin coches',
      coordinates: { x: 30, y: 40 },
      zoneRadius: 200,
      noiseLevel: 1,
      lightingLevel: 2,
      crowdLevel: 1,
      timeSlot: 'Todo el día',
      comment: 'Muy recomendable para descansar',
    });

    expect(service.places().length).toBe(initialCount + 1);
    expect(newZone.kind).toBe('zone');
    expect(newZone.zoneRadius).toBe(200);
    expect(service.selectedPlaceId()).toBe(newZone.id);
  });

  it('should allow confirming reviews to increase trust and prevent duplicate confirmation', () => {
    // rev-2 has isConfirmedByMe: false
    const unconfirmedReview = service.reviews().find((r) => !r.isConfirmedByMe);
    expect(unconfirmedReview).toBeDefined();
    if (!unconfirmedReview) return;

    const initialConf = unconfirmedReview.confirmationsCount;

    service.confirmReview(unconfirmedReview.id);
    let updatedReview = service.reviews().find((r) => r.id === unconfirmedReview.id);
    expect(updatedReview?.confirmationsCount).toBe(initialConf + 1);
    expect(updatedReview?.isConfirmedByMe).toBe(true);

    // Attempting duplicate confirmation should not increase count
    service.confirmReview(unconfirmedReview.id);
    updatedReview = service.reviews().find((r) => r.id === unconfirmedReview.id);
    expect(updatedReview?.confirmationsCount).toBe(initialConf + 1);
  });
});
