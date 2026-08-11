import { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para el icono de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ciudad del Este por defecto
const DEFAULT_CENTER = [-25.5133, -54.6111];

// Componente interno que controla el movimiento del mapa desde afuera
function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 17, { animate: true, duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(() => {
    if (value && value.includes('maps.google.com/?q=')) {
      const match = value.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    }
    return null;
  });

  // flyTarget: la posición a la que el mapa debe volar (solo cambia cuando viene del GPS)
  const [flyTarget, setFlyTarget] = useState(null);

  // "pending" = pin colocado pero no confirmado aún
  const [pendingPosition, setPendingPosition] = useState(null);
  const [saved, setSaved] = useState(!!value);
  const [isLocating, setIsLocating] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);

  useEffect(() => {
    setMapRendered(true);
  }, []);

  // El marcador sigue la posición pendiente o la guardada
  const markerPosition = pendingPosition || position;

  const handlePinPlace = (newPos) => {
    setPendingPosition(newPos);
    setSaved(false);
  };

  const handleSaveLocation = () => {
    if (!pendingPosition) return;
    setPosition(pendingPosition);
    setPendingPosition(null);
    setSaved(true);
    onChange(`https://maps.google.com/?q=${pendingPosition.lat},${pendingPosition.lng}`);
  };

  const handleGetCurrentLocation = (e) => {
    e.preventDefault();
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPendingPosition(newPos);
          setFlyTarget(newPos); // dispara el vuelo del mapa
          setSaved(false);
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          setIsLocating(false);
          alert('No pudimos acceder a tu ubicación. Por favor, asegurate de haber dado los permisos o marcá en el mapa manualmente.');
        }
      );
    }
  };

  if (!mapRendered) return <div className="h-[250px] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400">Cargando mapa...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-slate-700">
          📍 Ubicación exacta en el mapa
        </label>
        {saved && (
          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Guardada
          </span>
        )}
      </div>

      {/* Botón GPS prominente */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        type="button"
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-blue-400 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isLocating ? (
          <>
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
            Buscando tu ubicación...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
            Usar mi ubicación actual (GPS)
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">— o marcá en el mapa haciendo clic —</p>

      {/* Mapa con borde de color según estado */}
      <div
        className="h-[250px] w-full rounded-xl overflow-hidden shadow-sm relative z-0 transition-all"
        style={{ border: pendingPosition ? '2px solid #f59e0b' : saved ? '2px solid #22c55e' : '1px solid #e2e8f0' }}
      >
        <MapContainer
          center={markerPosition || DEFAULT_CENTER}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo target={flyTarget} />
          <LocationMarker position={markerPosition} setPosition={handlePinPlace} />
        </MapContainer>
      </div>

      {/* Botón Guardar ubicación (aparece cuando hay un pin pendiente) */}
      {pendingPosition && (
        <button
          type="button"
          onClick={handleSaveLocation}
          className="w-full py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Guardar esta ubicación
        </button>
      )}

      {/* Confirmación de guardado */}
      {saved && !pendingPosition && (
        <div className="text-xs bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-200 flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Ubicación guardada y lista para el pedido.
        </div>
      )}

      {!saved && !pendingPosition && !markerPosition && (
        <p className="text-xs text-slate-400 text-center">
          Aún no marcaste tu ubicación. Usá el GPS o tocá en el mapa.
        </p>
      )}
    </div>
  );
}
