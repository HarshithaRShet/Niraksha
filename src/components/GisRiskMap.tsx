import React from 'react';
import { ReactLeafletRiskMap } from './ReactLeafletRiskMap';
import { LandslideLocation, FieldReport } from '../types';

interface GisRiskMapProps {
  locations: LandslideLocation[];
  fieldReports: FieldReport[];
  selectedLocationId?: string;
  onSelectLocation: (loc: LandslideLocation) => void;
  onOpenReportModal?: (locationId: string) => void;
  onAnalyze?: (location: LandslideLocation) => void;
  onDispatchAlert?: (location: LandslideLocation) => void;
}

/**
 * GisRiskMap component powered by React Leaflet for the North Eastern Region (NER) of India.
 * Implements risk tiers (LOW=green, WATCH=yellow, HIGH=orange, CRITICAL=red),
 * interactive markers with telemetry tooltips, detailed inspector drawer,
 * multi-criteria filters, interactive legend, and "Fit to monitored zones" action.
 */
export const GisRiskMap: React.FC<GisRiskMapProps> = props => {
  return <ReactLeafletRiskMap {...props} />;
};

export default GisRiskMap;
