# ♻️ WasteWatch

**WasteWatch** is a web-based waste management platform designed to improve the efficiency of urban waste collection. It empowers municipalities and waste management teams to monitor bins, manage vehicle fleets, optimize collection routes, and ensure timely maintenance — all in one place.

---

## 📌 Features

### 🔹 Bin Management
- Monitor fill levels, types, and locations
- Track maintenance and collection history
- Add, edit, and remove bins
- Filter by type, status, and capacity

### 🔹 Fleet Management
- View vehicle status (Active, Idle, Maintenance)
- Assign drivers and manage routes
- Track maintenance history and fuel efficiency
- Visualize vehicles on the map in real-time

### 🔹 Route Optimization
- Create and assign optimized routes for each vehicle
- Select bins manually or based on criteria (e.g., fill level, location)
- View and generate PDF route reports

### 🔹 Notifications
- Real-time alerts for overflow, maintenance needs, or system errors
- Filter notifications by severity and type
- View full message and details in modal

### 🔹 Authentication & Role Management
- Secure login and registration system
- Roles: Admin, Fleet Manager, Bin Manager
- Password recovery functionality

---

## 🛠️ Tech Stack

| Frontend         | Backend                | Database     | Other Tools           |
|------------------|------------------------|--------------|------------------------|
| Angular          | ASP.NET Core Web API   | SQL Server   | Doxygen (documentation) |
| Bootstrap + SCSS | ASP.NET Identity       | EF Core      | GraphViz (optional)     |
| Google Maps API  |                        |              |                        |

---

## 🧪 Testing

- ✅ **Unit tests** for all controllers and services (xUnit)
- ✅ **Integration tests** for authentication, bins, vehicles, and collections
- ✅ **Stress/load tests** with Apache JMeter (optional)
- 🧪 Documentation generated using **Doxygen**

---

## 📂 Project Structure

```bash
WasteWatch/
├── WasteWatchAuth/          # Backend (ASP.NET Core)
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   └── Services/
├── WasteWatchFrontend/      # Frontend (Angular)
│   ├── app/
│   ├── assets/
│   └── i18n/
└── WasteWatchAuthTests/     # Test project
````


---

## 🌍 Internationalization

WasteWatch supports **5 languages**:
- 🇬🇧 English (default)
- 🇵🇹 Portuguese (Portugal)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German

Each interface section (Bins, Vehicles, Notifications, etc.) is fully translated via Angular’s i18n service.

---

## 👥 Authors

- **Miguel Borges** – Backend, Doxygen, Documentation  
- **Ricardo Pinto** – Tests, Integration, Research  
- **Rodrigo Maduro** – Controllers, Notification System