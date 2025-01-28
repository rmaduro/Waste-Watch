import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';  // Import routes here
import { provideHttpClient } from '@angular/common/http';  // Optional: Add HttpClient support if needed

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Use the imported 'routes' here
    provideHttpClient()     // Optional: Include HTTP client if your app requires it
  ]
}).catch(err => console.error(err));
