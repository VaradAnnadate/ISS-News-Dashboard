import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

export default function ISSTracker({ data }) {
  const { positions, speed, nearestPlace, fetchISS, isAutoRefresh, setIsAutoRefresh, astronauts } = data;
  
  if (positions.length === 0) return <div className="p-4 bg-white dark:bg-[#252525] rounded-xl shadow-sm h-64 animate-pulse flex items-center justify-center dark:text-white">Loading ISS Data...</div>;

  const currentPos = positions[positions.length - 1];
  const path = positions.map(p => [p.lat, p.lon]);

  return (
    <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">ISS Live Tracking</h2>
        <div className="flex gap-2">
          <button onClick={fetchISS} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition dark:text-white">
            Refresh Now
          </button>
          <button onClick={() => setIsAutoRefresh(!isAutoRefresh)} className={`px-4 py-2 text-sm rounded-lg transition ${isAutoRefresh ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}>
            Auto-Refresh: {isAutoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#fdfaf5] dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Latitude / Longitude</p>
          <p className="font-semibold text-lg dark:text-white">{currentPos.lat.toFixed(4)}, {currentPos.lon.toFixed(4)}</p>
        </div>
        <div className="p-4 bg-[#fdfaf5] dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Speed</p>
          <p className="font-semibold text-lg dark:text-white">{speed.toFixed(2)} km/h</p>
        </div>
        <div className="p-4 bg-[#fdfaf5] dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Nearest Place</p>
          <p className="font-semibold text-lg truncate dark:text-white" title={nearestPlace}>{nearestPlace}</p>
        </div>
        <div className="p-4 bg-[#fdfaf5] dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Tracked Positions</p>
          <p className="font-semibold text-lg dark:text-white" title={astronauts?.names?.join(', ')}>{positions.length}</p>
        </div>
      </div>

      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
        <MapContainer center={[currentPos.lat, currentPos.lon]} zoom={3} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[currentPos.lat, currentPos.lon]} icon={issIcon}>
            <Popup>
              ISS Current Location <br />
              Lat: {currentPos.lat.toFixed(4)} <br />
              Lon: {currentPos.lon.toFixed(4)} <br/>
              Astronauts onboard: {astronauts?.number || 0}
            </Popup>
          </Marker>
          {path.length > 1 && <Polyline positions={path} color="#ff4a4a" weight={3} />}
        </MapContainer>
      </div>
    </div>
  );
}
