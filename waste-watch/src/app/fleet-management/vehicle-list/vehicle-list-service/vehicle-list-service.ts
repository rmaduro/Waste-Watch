import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicle {
  id?: number;
  licensePlate: string;
  driverName: string;
  status: string;
  routeType: string;
  maxCapacity: string | number;
  lastMaintenance: string;
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

    return this.http.post<Vehicle>(this.apiUrl, vehicleToSend, this.httpOptions);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
  }
}
