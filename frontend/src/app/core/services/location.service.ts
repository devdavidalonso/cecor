import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Location {
  id: number;
  name: string;
  capacity: number;
  resources: string[]; // ['Projector', 'AC', 'Computers']
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // Mock data for Locations (Salas)
  private locations: Location[] = [
    { id: 1, name: 'Sala 1 (Teórica)', capacity: 30, resources: ['Projector', 'Whiteboard', 'AC'], isAvailable: true },
    { id: 2, name: 'Sala 2 (Teórica)', capacity: 25, resources: ['Whiteboard', 'Fan'], isAvailable: true },
    { id: 3, name: 'Laboratório de Informática', capacity: 20, resources: ['Computers', 'Projector', 'AC', 'Internet'], isAvailable: true },
    { id: 4, name: 'Auditório', capacity: 100, resources: ['Sound System', 'Stage', 'Projector', 'AC'], isAvailable: true },
    { id: 5, name: 'Pátio Coberto', capacity: 50, resources: ['Open Area'], isAvailable: true },
    { id: 6, name: 'Cozinha Experimental', capacity: 15, resources: ['Stove', 'Oven', 'Sink', 'Fridge'], isAvailable: true }
  ];

  constructor() { }

  getLocations(): Observable<Location[]> {
    return of(this.locations).pipe(delay(500)); // Simulate API delay
  }

  getLocation(id: number): Observable<Location | undefined> {
    const location = this.locations.find(l => l.id === id);
    return of(location).pipe(delay(200));
  }
}
