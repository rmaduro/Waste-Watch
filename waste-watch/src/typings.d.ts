// src/typings.d.ts
interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  [key: string]: any;
}

interface MarkerOptions {
  position: { lat: number; lng: number };
  map: any;
  title?: string;
  [key: string]: any;
}

interface GoogleMaps {
  Map: new (element: HTMLElement, options?: MapOptions) => any;
  Marker: new (options: MarkerOptions) => any;
}

declare global {
  interface Window {
    google: {
      maps: GoogleMaps;
    };
  }
}
