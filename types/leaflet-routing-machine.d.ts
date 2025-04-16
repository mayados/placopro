declare namespace L {
    namespace Routing {
      interface RoutingControl extends L.Control, L.Evented {
        getPlan(): unknown;
      }
  
      function control(options: unknown): RoutingControl;
  
      function itinerary(options: unknown): unknown;
  
      class Line {
        constructor(route: unknown, options?: unknown);
        addTo(map: L.Map): void;
        getBounds(): L.LatLngBounds;
      }
    }
  }