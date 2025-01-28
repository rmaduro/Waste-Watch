import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { SideNavComponent } from '../../components/side-nav/side-nav.component';  // Import SideNavComponent

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent],  // Import SideNavComponent
  template: `
    <div class="d-flex">
      <!-- SideNav Component -->
      <app-side-nav></app-side-nav>

      <!-- Main Content Area (Vehicle List) -->
      <div class="container-fluid p-4" style="flex-grow: 1;">
        <div class="container mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fw-bold">Vehicle List</h2>
            <div>
              <button class="btn btn-success me-2">+ Add Vehicle</button>
              <button class="btn btn-danger">Remove Vehicle</button>
            </div>
          </div>

          <!-- Horizontal line below header -->
          <hr class="mb-3" style="border-color: black; border-width: 2px;" />

          <!-- Filters -->
          <div class="d-flex justify-content-between mb-3">
            <div>
              <label class="me-2">Filters:</label>
              <select class="form-select d-inline w-auto" [(ngModel)]="selectedStatus">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <select class="form-select d-inline w-auto ms-2" [(ngModel)]="selectedRoute">
                <option value="">All Routes</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Residential">Residential</option>
              </select>
              <select class="form-select d-inline w-auto ms-2" [(ngModel)]="selectedCapacity">
                <option value="">All Capacities</option>
                <option value="1000kg">1000kg</option>
                <option value="1500kg">1500kg</option>
                <option value="2000kg">2000kg</option>
                <option value="2500kg">2500kg</option>
                <option value="3000kg">3000kg</option>
              </select>
            </div>
            <input type="text" class="form-control w-auto" placeholder="Search by ID..." [(ngModel)]="searchQuery">
          </div>

          <!-- Vehicle List Table -->
          <table class="table table-bordered table-striped">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>License Plate</th>
                <th>Driver's Name</th>
                <th>Status</th>
                <th>Route Type</th>
                <th>Max Capacity</th>
                <th>Last Maintenance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let vehicle of filteredVehicles">
                <td>{{ vehicle.id }}</td>
                <td>{{ vehicle.licensePlate }}</td>
                <td>{{ vehicle.driverName }}</td>
                <td>{{ vehicle.status }}</td>
                <td>{{ vehicle.routeType }}</td>
                <td>{{ vehicle.maxCapacity }}</td>
                <td>{{ vehicle.lastMaintenance }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent {
  vehicles = [
    {
      id: 1,
      licensePlate: '00-XX-00',
      driverName: 'Alexandra Atkins',
      status: 'Active',
      routeType: 'Commercial',
      maxCapacity: '1000kg',
      lastMaintenance: '02-May-2024',
    },
    {
      id: 2,
      licensePlate: '00-XX-00',
      driverName: 'Alice Adams',
      status: 'Idle',
      routeType: 'Industrial',
      maxCapacity: '1500kg',
      lastMaintenance: '18-Jun-2024',
    },
    // Add other vehicle objects here...
  ];

  selectedStatus = '';
  selectedRoute = '';
  selectedCapacity = '';
  searchQuery = '';

  get filteredVehicles() {
    return this.vehicles.filter((vehicle) => {
      return (
        (this.selectedStatus === '' || vehicle.status === this.selectedStatus) &&
        (this.selectedRoute === '' || vehicle.routeType === this.selectedRoute) &&
        (this.selectedCapacity === '' || vehicle.maxCapacity === this.selectedCapacity) &&
        (this.searchQuery === '' || vehicle.id.toString().includes(this.searchQuery))
      );
    });
  }
}
