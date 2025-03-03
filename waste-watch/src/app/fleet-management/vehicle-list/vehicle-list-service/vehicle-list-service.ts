import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Driver {
  name: string;
  age: number;
  licenseNumber: string;
  collaboratorType: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Vehicle {
  id?: number;
  licensePlate: string;
  driverName?: string; // Kept for backward compatibility
  status: string;
  routeType: string;
  maxCapacity: string | number;
  lastMaintenance: string;
  location?: Location;
  driver?: Driver;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'https://localhost:7259/api/vehicles';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Hardcoded list of available drivers
  availableDrivers: Driver[] = [
    {
      name: 'Carlos Silva',
      age: 40,
      licenseNumber: 'ABC-12345',
      collaboratorType: 'Driver'
    },
    {
      name: 'Maria Santos',
      age: 35,
      licenseNumber: 'DEF-67890',
      collaboratorType: 'Employee'
    },
    {
      name: 'João Oliveira',
      age: 42,
      licenseNumber: 'GHI-24680',
      collaboratorType: 'Driver'
    },
    {
      name: 'Ana Costa',
      age: 38,
      licenseNumber: 'JKL-13579',
      collaboratorType: 'Contractor'
    },
    {
      name: 'Pedro Ferreira',
      age: 45,
      licenseNumber: 'MNO-97531',
      collaboratorType: 'Employee'
    }
  ];

  constructor(private http: HttpClient) { }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    // Convert maxCapacity to number if it's a string with 'kg'
    const vehicleToSend = { ...vehicle };
    if (typeof vehicleToSend.maxCapacity === 'string' && vehicleToSend.maxCapacity.includes('kg')) {
      vehicleToSend.maxCapacity = parseInt(vehicleToSend.maxCapacity.replace('kg', ''), 10);
    }

    // Set default location if not provided
    if (!vehicleToSend.location) {
      vehicleToSend.location = {
        latitude: 38.7169,
        longitude: -9.1399
      };
    }

    return this.http.post<Vehicle>(this.apiUrl, vehicleToSend, this.httpOptions);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  getAvailableDrivers(): Driver[] {
    return this.availableDrivers;
  }
}
