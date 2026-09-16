import React from 'react';
import { Circle, Polyline, Tooltip } from 'react-leaflet';
import { LandslideLocation } from '../types';

interface GisLayersProps {
  locations: LandslideLocation[];
  showSusceptibility: boolean;
  showHighways: boolean;
  onSelectLocation?: (location: LandslideLocation) => void;
}

// Major strategic highway corridors across North East India
const STRATEGIC_CORRIDORS: {
  id: string;
  name: string;
  code: string;
  criticality: string;
  coordinates: [number, number][];
}[] = [
  {
    id: 'corridor-nh10',
    name: 'NH-10 Sikkim Strategic Lifeline Corridor',
    code: 'NH-10 (Sevoke - Rangpo - Singtam - Dikchu - Gangtok)',
    criticality: 'National Highway',
    coordinates: [
      [26.72, 88.42], // Siliguri / Sevoke
      [27.05, 88.48], // Teesta Bazaar
      [27.18, 88.52], // Rangpo Checkpost
      [27.23, 88.50], // Singtam
      [27.3789, 88.5284], // Dikchu Slip section
      [27.33, 88.61] // Gangtok
    ]
  },
  {
    id: 'corridor-nh13',
    name: 'NH-13 Trans-Arunachal Defence Highway',
    code: 'NH-13 (Bhalukpong - Bomdila - Dirang - Sela Pass - Tawang)',
    criticality: 'State Strategic Border',
    coordinates: [
      [26.85, 92.65], // Bhalukpong
      [27.25, 92.40], // Bomdila
      [27.35, 92.24], // Dirang
      [27.5020, 92.1030], // Sela Pass
      [27.58, 91.86] // Tawang
    ]
  },
  {
    id: 'corridor-nh54',
    name: 'NH-54E / Lumding-Badarpur Lifeline & Railway Alignment',
    code: 'NH-54E (Lumding - Maibang - Haflong - Jatinga - Silchar)',
    criticality: 'National Highway',
    coordinates: [
      [25.75, 93.18], // Lumding
      [25.30, 93.15], // Maibang
      [25.1764, 93.0371], // Haflong Jatinga
      [24.83, 92.80] // Silchar
    ]
  },
  {
    id: 'corridor-nh37',
    name: 'NH-37 Imphal - Jiribam Highway Corridor',
    code: 'NH-37 (Jiribam - Noney - Tupul - Imphal)',
    criticality: 'National Highway',
    coordinates: [
      [24.80, 93.12], // Jiribam
      [24.8167, 93.6000], // Noney / Tupul
      [24.81, 93.94] // Imphal
    ]
  }
];

export const GisLayers: React.FC<GisLayersProps> = ({
  locations,
  showSusceptibility,
  showHighways,
  onSelectLocation
}) => {
  return (
    <>
      {/* 1. Geological Landslide Watershed Catchment & Susceptibility Buffer Layer */}
      {showSusceptibility &&
        locations.map(loc => {
          const radiusMeters =
            loc.current_risk_level === 'CRITICAL'
              ? 11000
              : loc.current_risk_level === 'HIGH'
              ? 7500
              : loc.current_risk_level === 'WATCH'
              ? 4500
              : 2500;

          const color =
            loc.current_risk_level === 'CRITICAL'
              ? '#ef4444'
              : loc.current_risk_level === 'HIGH'
              ? '#f97316'
              : loc.current_risk_level === 'WATCH'
              ? '#eab308'
              : '#22c55e';

          return (
            <Circle
              key={`catchment-${loc.id}`}
              center={[loc.lat, loc.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: color,
                weight: 1.2,
                dashArray: '3, 4',
                fillColor: color,
                fillOpacity: loc.current_risk_level === 'CRITICAL' ? 0.16 : 0.08
              }}
              eventHandlers={{
                click: () => onSelectLocation && onSelectLocation(loc)
              }}
            >
              <Tooltip direction="top" opacity={0.9}>
                <div className="text-[10px] font-mono">
                  <strong>{loc.name}</strong>
                  <div>Catchment buffer: {(radiusMeters / 1000).toFixed(1)} km</div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}

      {/* 2. Strategic Highway & Lifeline Transport Corridors Layer */}
      {showHighways &&
        STRATEGIC_CORRIDORS.map(corridor => (
          <Polyline
            key={corridor.id}
            positions={corridor.coordinates}
            pathOptions={{
              color: '#38bdf8',
              weight: 3.5,
              opacity: 0.75,
              dashArray: '6, 6'
            }}
          >
            <Tooltip direction="center" sticky opacity={0.95}>
              <div className="text-[11px] font-sans">
                <div className="font-bold text-sky-300">{corridor.name}</div>
                <div className="text-slate-300 text-[10px] font-mono">{corridor.code}</div>
                <div className="text-emerald-400 text-[10px]">Priority: {corridor.criticality}</div>
              </div>
            </Tooltip>
          </Polyline>
        ))}
    </>
  );
};
