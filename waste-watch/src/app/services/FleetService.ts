import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Driver {
  id?: number;
  name: string;
  age: number;
  licenseNumber: string;
  collaboratorType: string;
}

export interface RouteLocation {
  id?: number;
  latitude: string;
  longitude: string;
}

export interface Route {
  id?: number;
  name: string;
  type: string;
  locations?: RouteLocation[];
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
  routeId?: number;
  route?: Route;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private apiUrl = 'https://localhost:7259/api/vehicles';
  private routesUrl = 'https://localhost:7259/api/routes';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  vehicles$ = this.vehiclesSubject.asObservable();

  private routesSubject = new BehaviorSubject<Route[]>([]);
  routes$ = this.routesSubject.asObservable();

  private availableDrivers: Driver[] = [
    {
      id: 1,
      name: 'Carlos Silva',
      age: 40,
      licenseNumber: 'ABC-12345',
      collaboratorType: 'Driver',
    },
    {
      id: 2,
      name: 'Maria Santos',
      age: 35,
      licenseNumber: 'DEF-67890',
      collaboratorType: 'Employee',
    },
    {
      id: 3,
      name: 'João Oliveira',
      age: 42,
      licenseNumber: 'GHI-24680',
      collaboratorType: 'Driver',
    },
    {
      id: 4,
      name: 'Ana Costa',
      age: 38,
      licenseNumber: 'JKL-13579',
      collaboratorType: 'Contractor',
    },
    {
      id: 5,
      name: 'Pedro Ferreira',
      age: 45,
      licenseNumber: 'MNO-97531',
      collaboratorType: 'Employee',
    },
  ];

  constructor(private http: HttpClient) {
    this.loadVehicles();
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.http
      .get<Route[]>(this.routesUrl)
      .pipe(
        tap((routes) => this.routesSubject.next(routes)),
        catchError((error) => {
          console.error('Error loading routes:', error);
          return of([]); // Return empty array on error
        })
      )
      .subscribe();
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$;
  }

  getRoutes(): Observable<Route[]> {
    return this.routes$;
  }

  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const vehicleToSend = this.prepareVehicleData(vehicle);

    // If a route is selected, include the routeId
    if (vehicle.routeId) {
      vehicleToSend.routeId = vehicle.routeId;
    }

    return this.http
      .post<Vehicle>(this.apiUrl, vehicleToSend, this.httpOptions)
      .pipe(
        tap((newVehicle) => {
          this.vehiclesSubject.next([
            ...this.vehiclesSubject.value,
            newVehicle,
          ]);
        }),
        catchError((error) => {
          console.error('Error adding vehicle:', error);
          return throwError(() => error);
        })
      );
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const vehicleToUpdate = this.prepareVehicleData(vehicle);

    // Ensure the routeId is included in the update request
    if (vehicle.routeId) {
      vehicleToUpdate.routeId = vehicle.routeId;
    }

    return this.http
      .put<Vehicle>(
        `${this.apiUrl}/${vehicle.id}`,
        vehicleToUpdate,
        this.httpOptions
      )
      .pipe(
        tap((updatedVehicle) => {
          const vehicles = this.vehiclesSubject.value;
          const index = vehicles.findIndex((v) => v.id === vehicle.id);
          if (index !== -1) {
            vehicles[index] = updatedVehicle;
            this.vehiclesSubject.next([...vehicles]);
          }
        }),
        catchError((error) => {
          console.error('Error updating vehicle:', error);
          return throwError(() => error);
        })
      );
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => {
        this.vehiclesSubject.next(
          this.vehiclesSubject.value.filter((v) => v.id !== id)
        );
      }),
      catchError((error) => {
        console.error(`Error deleting vehicle with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  updateVehicleRoute(vehicleId: number, routeId: number): Observable<Vehicle> {
    return new Observable<Vehicle>(subscriber => {
        this.http.get<Vehicle>(`${this.apiUrl}/${vehicleId}`).subscribe({
            next: (currentVehicle) => {
                const updatedVehicle = {
                    ...currentVehicle,
                    routeId: routeId
                };

                this.http.put<Vehicle>(
                    `${this.apiUrl}/${vehicleId}`,
                    updatedVehicle,
                    this.httpOptions
                ).subscribe({
                    next: (apiUpdatedVehicle) => {
                        // Update local state
                        const vehicles = this.vehiclesSubject.value;
                        const index = vehicles.findIndex(v => v.id === vehicleId);

                        if (index !== -1) {
                            const updatedVehicles = [...vehicles];
                            updatedVehicles[index] = {
                                ...apiUpdatedVehicle,
                                routeId: routeId,

                            };
                            this.vehiclesSubject.next(updatedVehicles);
                        }
                        subscriber.next(apiUpdatedVehicle);
                        subscriber.complete();
                    },
                    error: (err) => subscriber.error(err)
                });
            },
            error: (err) => subscriber.error(err)
        });
    });
}

  createRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.routesUrl, route, this.httpOptions).pipe(
      tap((newRoute) => {
        this.routesSubject.next([...this.routesSubject.value, newRoute]);
      }),
      catchError((error) => {
        console.error('Error creating route:', error);
        return throwError(() => error);
      })
    );
  }

  // In FleetService.ts

  getVehiclesWithRoutes(): Observable<Vehicle[]> {
    return new Observable<Vehicle[]>((subscriber) => {
      this.http.get<Vehicle[]>(this.apiUrl).subscribe({
        next: async (vehicles) => {
          const vehiclesWithRoutes: Vehicle[] = [];

          // Process vehicles one by one
          for (const vehicle of vehicles) {
            if (vehicle.routeId) {
              try {
                const route = await this.getRouteById(
                  vehicle.routeId
                ).toPromise();
                vehiclesWithRoutes.push({ ...vehicle, route });
              } catch (error) {
                console.error(
                  `Error fetching route for vehicle ${vehicle.id}:`,
                  error
                );
                vehiclesWithRoutes.push(vehicle); // Push vehicle without route if error occurs
              }
            } else {
              vehiclesWithRoutes.push(vehicle);
            }
          }

          subscriber.next(vehiclesWithRoutes);
          subscriber.complete();
        },
        error: (err) => {
          console.error('Error loading vehicles:', err);
          subscriber.next([]); // Return empty array on error
          subscriber.complete();
        },
      });
    });
  }

  // Modify the loadVehicles method to use getVehiclesWithRoutes
  loadVehicles(): void {
    this.getVehiclesWithRoutes()
      .pipe(tap((vehicles) => this.vehiclesSubject.next(vehicles)))
      .subscribe();
  }

  getRouteById(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.routesUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching route with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteRoute(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.routesUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(() => {
          this.routesSubject.next(
            this.routesSubject.value.filter((r) => r.id !== id)
          );

          const vehicles = this.vehiclesSubject.value.map((v) => {
            if (v.routeId === id) {
              return { ...v, routeId: undefined, route: undefined };
            }
            return v;
          });
          this.vehiclesSubject.next(vehicles);
        }),
        catchError((error) => {
          console.error(`Error deleting route with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getAvailableDrivers(): Driver[] {
    return this.availableDrivers;
  }

  private prepareVehicleData(vehicle: Vehicle): Vehicle {
    const processedVehicle = { ...vehicle };

    if (
      typeof processedVehicle.maxCapacity === 'string' &&
      processedVehicle.maxCapacity.includes('kg')
    ) {
      processedVehicle.maxCapacity = parseInt(
        processedVehicle.maxCapacity.replace('kg', ''),
        10
      );
    }

    return processedVehicle;
  }
}
