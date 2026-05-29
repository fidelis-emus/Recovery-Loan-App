import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserSession, GeoLocation } from '../types';

interface TravelMapProps {
  currSession: UserSession | null;
  allSessions: UserSession[];
  geoHistory: GeoLocation[];
  zoomLevel: number;
  theme: 'light' | 'dark';
}

export function TravelMap({ currSession, allSessions, geoHistory, zoomLevel, theme }: TravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize leaflet map centered roughly on a default coordinate
    const initialLat = currSession
      ? (geoHistory.find(g => g.ipAddress === currSession.ipAddress)?.latitude ?? 6.5244)
      : 6.5244;
    const initialLon = currSession
      ? (geoHistory.find(g => g.ipAddress === currSession.ipAddress)?.longitude ?? 3.3792)
      : 3.3792;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: zoomLevel,
      zoomControl: true,
      attributionControl: false
    });

    // Create dynamic tile layer initially mapped to chosen theme
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layers automatically when active application theme shifts
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

  }, [theme]);

  // Update map bounds, markers, and path lines dynamically when selected borrower session changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currSession) return;

    // Remove existing markers and polylines from the map
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // 1. Find all sessions for current borrower, sorted chronologically from oldest to newest
    const borrowerSessions = allSessions
      .filter(s => s.borrowerId === currSession.borrowerId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // 2. Fetch matched coordinates for these sessions
    const pathCoordinates: { latLng: L.LatLngTuple; geo: GeoLocation; session: UserSession }[] = [];
    
    borrowerSessions.forEach(sess => {
      const geo = geoHistory.find(g => g.ipAddress === sess.ipAddress);
      if (geo) {
        pathCoordinates.push({
          latLng: [geo.latitude, geo.longitude],
          geo,
          session: sess
        });
      }
    });

    if (pathCoordinates.length === 0) return;

    // Helper to calculate distance in km using Haversine formula
    const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Radius of Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // 3. Create Custom Markers for each coordinate step in travel history
    pathCoordinates.forEach((pt, index) => {
      const isSelectedSess = pt.session.id === currSession.id;
      const isLastPoint = index === pathCoordinates.length - 1;

      // Calculate sequential distance from previous scan if index > 0
      let distanceText = '';
      if (index > 0) {
        const prevPt = pathCoordinates[index - 1];
        const dist = getDistanceKm(prevPt.latLng[0], prevPt.latLng[1], pt.latLng[0], pt.latLng[1]);
        distanceText = `⚡ Distance from Point #${index}: <span class="font-bold text-indigo-650">${dist.toFixed(1)} km</span>`;
      } else {
        distanceText = `📍 Starting Scan Reference Point`;
      }

      // Premium Div-based HTML marker to display sequence, location and live wave effect
      const markerHtml = `
        <div class="flex flex-col items-center select-none cursor-pointer">
          <div class="relative flex items-center justify-center">
            ${isLastPoint ? '<span class="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-indigo-400 opacity-60"></span>' : ''}
            ${isSelectedSess ? '<span class="absolute inline-flex h-8 w-8 rounded-full border-2 border-indigo-600 animate-pulse bg-transparent"></span>' : ''}
            <div class="relative flex h-6 w-6 items-center justify-center rounded-full border-1.5 border-white shadow-md text-[10px] font-black text-white ${
              isSelectedSess 
                ? 'bg-rose-600 scale-110 z-30' 
                : isLastPoint 
                  ? 'bg-indigo-600 z-20' 
                  : 'bg-slate-700 z-10'
            }">
              ${index + 1}
            </div>
          </div>
          <div class="mt-0.5 bg-slate-900/95 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md border border-slate-700 shadow-lg whitespace-nowrap scale-90">
            ${pt.geo.city}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [64, 48],
        iconAnchor: [32, 24]
      });

      const popupContent = `
        <div class="font-sans text-xs text-slate-800 p-2 min-w-[210px] space-y-1">
          <div class="font-bold border-b border-slate-100 pb-1 text-slate-900 flex items-center justify-between">
            <span>Location #${index + 1}: ${pt.geo.city}</span>
            <span class="text-[9px] font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">IP Match</span>
          </div>
          <div class="text-[10px] text-slate-500 font-mono italic">Time: ${new Date(pt.session.timestamp).toLocaleString()}</div>
          <div class="text-slate-700 leading-tight space-y-0.5">
            <div><strong>Borrower:</strong> ${pt.session.borrowerName}</div>
            <div><strong>IP:</strong> ${pt.session.ipAddress}</div>
            <div><strong>ISP:</strong> ${pt.geo.isp}</div>
            <div><strong>Details:</strong> ${pt.session.vpnUsed ? '🔴 VPN/Proxy Detected' : '🟢 Safe Connection'}</div>
            <div><strong>System:</strong> ${pt.session.os} (${pt.session.browser})</div>
          </div>
          <div class="mt-2.5 pt-1.5 border-t border-slate-200 select-all font-mono text-[9.5px] text-indigo-700">
            ${distanceText}
          </div>
        </div>
      `;

      const marker = L.marker(pt.latLng, { icon: customIcon })
        .bindPopup(popupContent, { maxWidth: 240 })
        .addTo(map);

      // Auto-open selected session popup
      if (isSelectedSess) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });

    // 4. Draw Polyline path lines connecting coordinates to visualize travel flow
    if (pathCoordinates.length > 1) {
      const latLngs = pathCoordinates.map(p => p.latLng);
      const polyline = L.polyline(latLngs, {
        color: '#4f46e5', // Brand Indigo-600
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // 5. Instantly pan and adjust map view to fit all markers elegantly
    if (pathCoordinates.length === 1) {
      map.setView(pathCoordinates[0].latLng, zoomLevel);
    } else {
      const bounds = L.latLngBounds(pathCoordinates.map(p => p.latLng));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

  }, [currSession, allSessions, geoHistory]);

  // Adjust zoom level dynamically when user moves zoom control slider
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.setZoom(zoomLevel);
    }
  }, [zoomLevel]);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '260px' }} />
    </div>
  );
}
