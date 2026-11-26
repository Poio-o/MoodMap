import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReviewModalComponent } from './review-modal.component';

describe('ReviewModalComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ReviewModalComponent],
    }).compileComponents();
  });

  it('should initialize with default sensory levels and time range', () => {
    const fixture = TestBed.createComponent(ReviewModalComponent);
    const comp = fixture.componentInstance;
    expect(comp.noise()).toBe(2);
    expect(comp.lighting()).toBe(2);
    expect(comp.crowd()).toBe(2);
    expect(comp.exactStartTime()).toBeDefined();
    expect(comp.exactEndTime()).toBeDefined();
  });

  it('should allow sliding or clicking ratings and stay synchronized', () => {
    const fixture = TestBed.createComponent(ReviewModalComponent);
    const comp = fixture.componentInstance;

    // Simulate slider drag to 4
    comp.noise.set(4);
    expect(comp.getSensoryLabelText('noise')).toBe('Ruidoso');
    expect(comp.getFillPercentage(comp.noise())).toBe('75%');

    // Simulate slider drag to 1
    comp.lighting.set(1);
    expect(comp.getSensoryLabelText('light')).toBe('Luz tenue');
  });

  it('should calculate exact hours and duration dynamically', () => {
    const fixture = TestBed.createComponent(ReviewModalComponent);
    const comp = fixture.componentInstance;

    comp.exactStartTime.set('14:15');
    comp.exactEndTime.set('16:45');
    expect(comp.formattedTimeSlot()).toBe('14:15 — 16:45');
    expect(comp.formattedDuration()).toBe('2 h 30 min');
  });
});
