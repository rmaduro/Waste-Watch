import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Driver {
  id?: number;
  name: string;
  age: number;
  licenseNumber: string;
  collaboratorType: string;
}

export interface Vehicle {
  id?: number;
  licensePlate: string;
  driverName?: string;
  status: string;
  routeType: string;
  maxCapacity: string | number;
  lastMaintenance: string;
  latitude: string;
  longitude: string;
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

  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  vehicles$ = this.vehiclesSubject.asObservable();

  private availableDrivers: Driver[] = [
    { name: 'Carlos Silva', age: 40, licenseNumber: 'ABC-12345', collaboratorType: 'Driver' },
    { name: 'Maria Santos', age: 35, licenseNumber: 'DEF-67890', collaboratorType: 'Employee' },
    { name: 'João Oliveira', age: 42, licenseNumber: 'GHI-24680', collaboratorType: 'Driver' },
    { name: 'Ana Costa', age: 38, licenseNumber: 'JKL-13579', collaboratorType: 'Contractor' },
    { name: 'Pedro Ferreira', age: 45, licenseNumber: 'MNO-97531', collaboratorType: 'Employee' }
  ];

  constructor(private http: HttpClient) {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.http.get<Vehicle[]>(this.apiUrl).pipe(
      tap((vehicles) => this.vehiclesSubject.next(vehicles)),
      catchError((error) => {
        console.error('Error loading vehicles:', error);
        return of([]);
      })
    ).subscribe();
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$;
  }

  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const vehicleToSend = this.prepareVehicleData(vehicle);

    return this.http.post<Vehicle>(this.apiUrl, vehicleToSend, this.httpOptions).pipe(
      tap((newVehicle) => {
        this.vehiclesSubject.next([...this.vehiclesSubject.value, newVehicle]);
      }),
      catchError((error) => {
        console.error('Error adding vehicle:', error);
        return of(error);
      })
    );
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => {
        this.vehiclesSubject.next(this.vehiclesSubject.value.filter(v => v.id !== id));
      }),
      catchError((error) => {
        console.error(`Error deleting vehicle with ID ${id}:`, error);
        return of(error);
      })
    );
  }

  getAvailableDrivers(): Driver[] {
    return this.availableDrivers;
  }

  private prepareVehicleData(vehicle: Vehicle): Vehicle {
    const processedVehicle = { ...vehicle };

    if (typeof processedVehicle.maxCapacity === 'string' && processedVehicle.maxCapacity.includes('kg')) {
      processedVehicle.maxCapacity = parseInt(processedVehicle.maxCapacity.replace('kg', ''), 10);
    }

    return processedVehicle;
  }
}
