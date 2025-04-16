'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import debounce from 'lodash.debounce';

// Fix icones path for nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const MapWithForm = () => {
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.RoutingControl | null>(null);

  const [pointAInput, setPointAInput] = useState('');
  const [pointBInput, setPointBInput] = useState('');
  const [suggestionsA, setSuggestionsA] = useState<Suggestion[]>([]);
  const [suggestionsB, setSuggestionsB] = useState<Suggestion[]>([]);
  const [pointA, setPointA] = useState<[number, number] | null>(null);
  const [pointB, setPointB] = useState<[number, number] | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [hasSearchedA, setHasSearchedA] = useState(false);
  const [hasSearchedB, setHasSearchedB] = useState(false);

  useEffect(() => {
    if (!mapRef.current) {
        // Default map shows Strasbourg
        const map = L.map('map').setView([48.5734, 7.7521], 13); 
        mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    }
  }, []);

  useEffect(() => {
    if (pointA && pointB && mapRef.current) {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }

      const control = L.Routing.control({
        waypoints: [L.latLng(pointA), L.latLng(pointB)],
        routeWhileDragging: false,
      }).on('routesfound', function (e) {
        const route = e.routes[0];
        const time = Math.round(route.summary.totalTime / 60);
        setTravelTime(time);
      });

      routingControlRef.current = control;
      control.addTo(mapRef.current);
    }
  }, [pointA, pointB]);

  const searchSuggestions = async (
    query: string,
    setResult: Function,
    setLoading: Function
  ) => {
    if (query.length < 3) return setResult([]);
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=fr&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearchA = useMemo(
    () => debounce((query) => searchSuggestions(query, setSuggestionsA, setIsLoadingA), 500),
    []
  );
  const debouncedSearchB = useMemo(
    () => debounce((query) => searchSuggestions(query, setSuggestionsB, setIsLoadingB), 500),
    []
  );

  const swapPoints = () => {
    const tempInput = pointAInput;
    const tempCoords = pointA;
    setPointAInput(pointBInput);
    setPointA(pointB);
    setPointBInput(tempInput);
    setPointB(tempCoords);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Point A"
            value={pointAInput}
            onChange={(e) => {
              setPointAInput(e.target.value);
              setHasSearchedA(true);
              debouncedSearchA(e.target.value);
            }}
            className="p-2 border rounded w-full text-green-700"
          />
          {isLoadingA && <p className="text-sm text-gray-500 italic">Chargement...</p>}
          {hasSearchedA && !isLoadingA && suggestionsA.length === 0 && (
            <p className="text-sm text-red-500 italic mt-1">Aucune ville trouvée</p>
          )}
          {suggestionsA.length > 0 && (
            <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-50">
              {suggestionsA.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setPointA([parseFloat(s.lat), parseFloat(s.lon)]);
                    setPointAInput(s.display_name);
                    setSuggestionsA([]);
                    setHasSearchedA(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-green-700"
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Point B"
            value={pointBInput}
            onChange={(e) => {
              setPointBInput(e.target.value);
              setHasSearchedB(true);
              debouncedSearchB(e.target.value);
            }}
            className="p-2 border rounded w-full text-green-700"
          />
          {isLoadingB && <p className="text-sm text-gray-500 italic">Chargement...</p>}
          {hasSearchedB && !isLoadingB && suggestionsB.length === 0 && (
            <p className="text-sm text-red-500 italic mt-1">Aucune ville trouvée</p>
          )}
          {suggestionsB.length > 0 && (
            <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-50">
              {suggestionsB.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setPointB([parseFloat(s.lat), parseFloat(s.lon)]);
                    setPointBInput(s.display_name);
                    setSuggestionsB([]);
                    setHasSearchedB(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-green-700"
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={swapPoints}
        className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
      >
        Inverser A/B
      </button>

      {travelTime !== null && (
        <p className="text-green-700 font-semibold">
          Temps estimé : {travelTime} min
        </p>
      )}

      <div id="map" className="w-full h-[500px] rounded shadow z-10" />
    </div>
  );
};

export default MapWithForm;