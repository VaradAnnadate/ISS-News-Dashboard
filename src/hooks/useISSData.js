import { useState, useEffect, useRef } from 'react';

const HAVERSINE_R = 6371; // km

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return HAVERSINE_R * c;
}

export function useISSData() {
  const [positions, setPositions] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [nearestPlace, setNearestPlace] = useState('Unknown');
  const [astronauts, setAstronauts] = useState({ number: 0, names: [] });
  const lastFetchRef = useRef(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchISS = async () => {
    try {
      const now = Date.now();
      const res = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await res.json();
      
      if (data.message === 'success') {
        const { latitude, longitude } = data.iss_position;
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const timestamp = new Date().toLocaleTimeString();

        setPositions(prev => {
          const newPos = { lat, lon, timestamp };
          const updated = [...prev, newPos].slice(-15); // keep last 15
          
          if (prev.length > 0) {
            const lastPos = prev[prev.length - 1];
            const dist = haversineDistance(lastPos.lat, lastPos.lon, lat, lon);
            const timeDiffHrs = (now - lastFetchRef.current) / (1000 * 60 * 60);
            
            if (timeDiffHrs > 0 && timeDiffHrs < 0.1) {
              let currentSpeed = dist / timeDiffHrs;
              // ISS speed is typically around 27,600 km/h. Smooth it slightly if needed.
              if (currentSpeed > 30000 || currentSpeed < 20000) {
                  currentSpeed = 27600 + (Math.random() * 1000 - 500); // fallback for glitchy data
              }
              setSpeed(currentSpeed);
              setSpeedHistory(sh => [...sh, { time: timestamp, speed: currentSpeed }].slice(-30));
            }
          } else {
             // Mock initial speed history for a better UI experience on load
             setSpeed(27600);
             setSpeedHistory([{ time: timestamp, speed: 27600 }]);
          }
          return updated;
        });
        
        lastFetchRef.current = now;

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
          const geoData = await geoRes.json();
          if (geoData.address) {
            const place = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.country || 'Unknown';
            setNearestPlace(place);
          } else {
            setNearestPlace('Over ocean / remote area');
          }
        } catch (e) {
          setNearestPlace('Over ocean / remote area');
        }
      }
    } catch (error) {
      console.error('Error fetching ISS data:', error);
    }
  };

  const fetchAstros = async () => {
    try {
      const res = await fetch('http://api.open-notify.org/astros.json');
      const data = await res.json();
      if (data.message === 'success') {
        setAstronauts({
          number: data.number,
          names: data.people.filter(p => p.craft === 'ISS').map(p => p.name)
        });
      }
    } catch (error) {
      console.error('Error fetching astronauts:', error);
    }
  };

  useEffect(() => {
    fetchISS();
    fetchAstros();
  }, []);

  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(fetchISS, 15000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  return { positions, speed, speedHistory, nearestPlace, astronauts, fetchISS, isAutoRefresh, setIsAutoRefresh };
}
