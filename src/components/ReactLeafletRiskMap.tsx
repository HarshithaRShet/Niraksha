import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import { LandslideLocation, FieldReport, RiskLevel } from '../types';
import { MapControls, MapFilterType } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapDetailPanel } from './MapDetailPanel';
import { GisLayers } from './GisLayers';
import { MapPin, AlertTriangle, Layers } from 'lucide-react';

// Fix default Leaflet marker icon configuration so icons never break
// Note: We use custom HTML divIcons for high-precision hazard visualization,
// but configuring default icon avoids any missing image warnings.
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface ReactLeafletRiskMapProps {
  locations: LandslideLocation[];
  fieldReports?: FieldReport[];
  selectedLocationId?: string;
  onSelectLocation: (loc: LandslideLocation) => void;
  onOpenReportModal?: (locationId: string) => void;
  onAnalyze?: (location: LandslideLocation) => void;
  onDispatchAlert?: (location: LandslideLocation) => void;
}

// Controller component to handle fitting to monitored zones and programmatic panning
const MapController: React.FC<{
  locations: LandslideLocation[];
  selectedLocation?: LandslideLocation | null;
  fitBoundsTrigger: number;
}> = ({ locations, selectedLocation, fitBoundsTrigger }) => {
  const map = useMap();

  // Fit to monitored zones trigger
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 9,
        animate: true,
        duration: 1.0
      });
    }
  }, [fitBoundsTrigger, map]);

  // Pan smoothly when location is clicked
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 9.5, {
        duration: 1.2
      });
    }
  }, [selectedLocation, map]);

  return null;
};

export const ReactLeafletRiskMap: React.FC<ReactLeafletRiskMapProps> = ({
  locations,
  fieldReports = [],
  selectedLocationId,
  onSelectLocation,
  onOpenReportModal,
  onAnalyze,
  onDispatchAlert
}) => {
  const [filter, setFilter] = useState<MapFilterType>('ALL');
  const [activeLocation, setActiveLocation] = useState<LandslideLocation | null>(
    locations.find(l => l.id === selectedLocationId) || locations[0] || null
  );
  const [fitTrigger, setFitTrigger] = useState<number>(0);
  const [showSusceptibility, setShowSusceptibility] = useState<boolean>(true);
  const [showHighways, setShowHighways] = useState<boolean>(true);

  // Sync external selectedLocationId changes
  useEffect(() => {
    if (selectedLocationId) {
      const found = locations.find(l => l.id === selectedLocationId);
      if (found) {
        setActiveLocation(found);
      }
    }
  }, [selectedLocationId, locations]);

  // Determine locations with road blockages
  const blockedLocationIds = useMemo(() => {
    const ids = new Set<string>();
    // From field reports
    fieldReports.forEach(r => {
      if (r.observations?.road_blockage || r.vision_analysis?.road_blockage_detected) {
        ids.add(r.location_id);
      }
    });
    // Critical highway slips often have road blockage status
    locations.forEach(l => {
      if (l.current_risk_score >= 85) {
        ids.add(l.id);
      }
    });
    return ids;
  }, [fieldReports, locations]);

  // Filter locations according to user criteria:
  // All, Low, Watch, High, Critical, Road blockage, Field verified
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      switch (filter) {
        case 'ALL':
          return true;
        case 'LOW':
        case 'WATCH':
        case 'HIGH':
        case 'CRITICAL':
          return loc.current_risk_level === filter;
        case 'ROAD_BLOCKAGE':
          return blockedLocationIds.has(loc.id);
        case 'FIELD_VERIFIED':
          return loc.verification_status === 'Field Verified';
        default:
          return true;
      }
    });
  }, [locations, filter, blockedLocationIds]);

  // Risk Color Mapping strictly per specification:
  // LOW = green, WATCH = yellow, HIGH = orange, CRITICAL = red
  const getRiskColorHex = (level: RiskLevel): string => {
    switch (level) {
      case 'CRITICAL':
        return '#ef4444'; // Red
      case 'HIGH':
        return '#f97316'; // Orange
      case 'WATCH':
        return '#eab308'; // Yellow
      case 'LOW':
      default:
        return '#22c55e'; // Green
    }
  };

  // Create custom pulsing divIcon for each landslide marker
  const createMarkerIcon = (loc: LandslideLocation, isSelected: boolean) => {
    const color = getRiskColorHex(loc.current_risk_level);
    const hasBlockage = blockedLocationIds.has(loc.id);

    return L.divIcon({
      className: 'nir-raksha-marker',
      html: `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            loc.current_risk_level === 'CRITICAL'
              ? `<div style="
                  position: absolute;
                  width: 38px;
                  height: 38px;
                  border-radius: 9999px;
                  background-color: ${color};
                  opacity: 0.35;
                  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>`
              : ''
          }
          <div style="
            position: relative;
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            border-radius: 9999px;
            background-color: ${color};
            border: 3px solid ${isSelected ? '#ffffff' : '#090d16'};
            box-shadow: 0 0 14px ${color}88, 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            transition: all 0.2s ease;
          ">
            ${loc.current_risk_score}
          </div>
          ${
            hasBlockage
              ? `<div style="
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 14px;
                  height: 14px;
                  background: #ef4444;
                  border: 2px solid #ffffff;
                  border-radius: 9999px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8px;
                  color: white;
                  font-weight: bold;
                ">!</div>`
              : ''
          }
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      tooltipAnchor: [0, -18]
    });
  };

  const handleSelectLocation = (loc: LandslideLocation) => {
    setActiveLocation(loc);
    onSelectLocation(loc);
  };

  return (
    <div
      id="react-leaflet-risk-map-container"
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col"
    >
      {/* 1. Map Controls Toolbar (Filter Bar, Fit to Monitored Zones, Layer Toggles) */}
      <div className="p-3 bg-slate-950 border-b border-slate-800">
        <MapControls
          currentFilter={filter}
          onFilterChange={setFilter}
          onFitBounds={() => setFitTrigger(prev => prev + 1)}
          filteredCount={filteredLocations.length}
          totalCount={locations.length}
          showSusceptibilityLayer={showSusceptibility}
          onToggleSusceptibility={() => setShowSusceptibility(!showSusceptibility)}
          showHighwaysLayer={showHighways}
          onToggleHighways={() => setShowHighways(!showHighways)}
        />
      </div>

      {/* 2. Map Stage + Details Inspector Layout */}
      <div className="flex-1 flex flex-col lg:flex-row h-[600px] lg:h-[660px] relative">
        {/* Leaflet Stage */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={[26.0, 92.8]}
            zoom={7}
            zoomControl={false}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <ZoomControl position="bottomright" />

            {/* Controller for Fit Bounds and FlyTo navigation */}
            <MapController
              locations={filteredLocations.length > 0 ? filteredLocations : locations}
              selectedLocation={activeLocation}
              fitBoundsTrigger={fitTrigger}
            />

            {/* CARTO Dark Matter Tile Layer - High contrast for disaster operations */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />

            {/* Modular GIS Layers (Geological Catchment & Strategic Highway Corridors) */}
            <GisLayers
              locations={locations}
              showSusceptibility={showSusceptibility}
              showHighways={showHighways}
              onSelectLocation={handleSelectLocation}
            />

            {/* Risk Markers */}
            {filteredLocations.map(loc => {
              const isSelected = activeLocation?.id === loc.id;
              const color = getRiskColorHex(loc.current_risk_level);

              return (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={createMarkerIcon(loc, isSelected)}
                  eventHandlers={{
                    click: () => handleSelectLocation(loc)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                    <div className="font-sans text-xs p-1 space-y-1 min-w-[180px]">
                      <div className="font-bold text-white leading-tight">{loc.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {loc.district}, {loc.state}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/80">
                        <span
                          style={{ color }}
                          className="font-mono font-black uppercase text-[11px]"
                        >
                          {loc.current_risk_level} ({loc.current_risk_score}/100)
                        </span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {loc.rainfall_current_mm} mm
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Lifeline: {loc.road_name.slice(0, 24)}...
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] max-w-xs">
            <MapLegend />
          </div>
        </div>

        {/* 3. Detailed Inspector Panel when a location is selected or clicked */}
        {activeLocation && (
          <div className="w-full lg:w-96 xl:w-[420px] bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
            <MapDetailPanel
              location={activeLocation}
              onClose={() => setActiveLocation(null)}
              onAnalyze={onAnalyze ? () => onAnalyze(activeLocation) : undefined}
              onVerify={onOpenReportModal ? () => onOpenReportModal(activeLocation.id) : undefined}
              onDispatchAlert={onDispatchAlert ? () => onDispatchAlert(activeLocation) : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};
