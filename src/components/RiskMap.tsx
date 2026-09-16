import React from 'react';
import { ReactLeafletRiskMap } from './ReactLeafletRiskMap';
import { LandslideLocation, FieldReport } from '../types';

interface RiskMapProps {
  locations: LandslideLocation[];
  fieldReports?: FieldReport[];
  selectedLocationId?: string;
  onSelectLocation: (loc: LandslideLocation) => void;
  onOpenReportModal?: (locationId: string) => void;
  onAnalyze?: (location: LandslideLocation) => void;
  onDispatchAlert?: (location: LandslideLocation) => void;
}

/**
 * Standard GIS Risk Map component for NIR-RAKSHA Command Center.
 * Powered by React Leaflet, centered on the North Eastern Region of India (NER).
 * Includes interactive markers, color-coded risk visualization, filter bar,
 * legend, "Fit to monitored zones", and detailed inspector panel.
 */
export const RiskMap: React.FC<RiskMapProps> = props => {
  return <ReactLeafletRiskMap {...props} />;
};

export default RiskMap;
