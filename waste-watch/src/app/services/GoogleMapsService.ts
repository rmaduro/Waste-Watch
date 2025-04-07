// google-maps.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environtment';

declare global {
  interface Window {
    initMap: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private apiLoaded = false;

  loadApi(): Promise<void> {
    return new Promise((resolve) => {
      if (this.apiLoaded || typeof google !== 'undefined') {
        resolve();
        return;
      }

      window.initMap = () => {
        this.apiLoaded = true;
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }
}
