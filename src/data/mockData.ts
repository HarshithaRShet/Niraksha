import { LandslideLocation, FieldReport, DisasterAlert } from '../types';

export const INITIAL_LOCATIONS: LandslideLocation[] = [
  {
    id: 'NER-SK-01',
    name: 'Dikchu - Singtam Highway Corridor (NH-10)',
    district: 'East Sikkim & Pakyong',
    state: 'Sikkim',
    lat: 27.3789,
    lng: 88.5284,
    elevation: 1420,
    slope: 48.5,
    rainfall_current_mm: 148.2,
    rainfall_7d_cumulative_mm: 382.0,
    forecast_rainfall_48h_mm: 92.5,
    soil_moisture_pct: 88.4,
    historical_events_count: 14,
    exposed_population: 8450,
    vulnerable_villages: ['Lower Dikchu', 'Rakdong Tintek', 'Singtam Outskirts'],
    road_name: 'NH-10 (Sikkim Lifeline Corridor)',
    road_criticality: 'National Highway',
    critical_infrastructure: ['Teesta Hydro Dam Stage V Substation', 'Army Logistics Convoy Bridge 04'],
    current_risk_score: 91,
    current_risk_level: 'CRITICAL',
    last_updated: '2026-09-16 11:30 IST',
    verification_status: 'Urgent Inspection Required'
  },
  {
    id: 'NER-MG-02',
    name: 'Cherrapunji - Shella Escarpment & Mawkdok Valley',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.2986,
    lng: 91.7323,
    elevation: 1290,
    slope: 42.0,
    rainfall_current_mm: 212.0,
    rainfall_7d_cumulative_mm: 520.4,
    forecast_rainfall_48h_mm: 130.0,
    soil_moisture_pct: 94.2,
    historical_events_count: 22,
    exposed_population: 5200,
    vulnerable_villages: ['Mawkdok', 'Laitkynsew', 'Nongkroh'],
    road_name: 'SH-5 Cherra-Shella Road',
    road_criticality: 'State Strategic Border',
    critical_infrastructure: ['Mawkdok Bridge Pier #2', 'High-tension Power Pylon 11B'],
    current_risk_score: 87,
    current_risk_level: 'CRITICAL',
    last_updated: '2026-09-16 10:45 IST',
    verification_status: 'Action In Progress'
  },
  {
    id: 'NER-AS-03',
    name: 'Haflong - Jatinga Valley Slide Zone',
    district: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1764,
    lng: 93.0371,
    elevation: 850,
    slope: 38.0,
    rainfall_current_mm: 110.5,
    rainfall_7d_cumulative_mm: 290.0,
    forecast_rainfall_48h_mm: 65.0,
    soil_moisture_pct: 76.5,
    historical_events_count: 18,
    exposed_population: 12100,
    vulnerable_villages: ['Jatinga', 'Bagetar Settlement', 'Fiangpui'],
    road_name: 'NH-54E / Lumding-Badarpur Railway Alignment',
    road_criticality: 'National Highway',
    critical_infrastructure: ['NFR Mountain Railway Track Km 42', 'Haflong District Hospital Water Feeder'],
    current_risk_score: 79,
    current_risk_level: 'HIGH',
    last_updated: '2026-09-16 12:15 IST',
    verification_status: 'Field Verified'
  },
  {
    id: 'NER-AP-04',
    name: 'Sela Pass - Dirang Descent (NH-13)',
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    lat: 27.5020,
    lng: 92.1030,
    elevation: 3250,
    slope: 52.0,
    rainfall_current_mm: 88.0,
    rainfall_7d_cumulative_mm: 240.0,
    forecast_rainfall_48h_mm: 55.0,
    soil_moisture_pct: 69.0,
    historical_events_count: 9,
    exposed_population: 3400,
    vulnerable_villages: ['Dirang Basti', 'Munna Camp', 'Senge'],
    road_name: 'NH-13 (Trans-Arunachal Defence Highway)',
    road_criticality: 'State Strategic Border',
    critical_infrastructure: ['Sela Tunnel North Portal Drainage', 'Military Cantonment Supply Depot'],
    current_risk_score: 74,
    current_risk_level: 'HIGH',
    last_updated: '2026-09-16 09:30 IST',
    verification_status: 'Field Verified'
  },
  {
    id: 'NER-NL-05',
    name: 'Pfutsero - Phek Ridge Slope',
    district: 'Phek',
    state: 'Nagaland',
    lat: 25.6667,
    lng: 94.3333,
    elevation: 2133,
    slope: 35.0,
    rainfall_current_mm: 64.0,
    rainfall_7d_cumulative_mm: 175.0,
    forecast_rainfall_48h_mm: 40.0,
    soil_moisture_pct: 62.0,
    historical_events_count: 7,
    exposed_population: 4600,
    vulnerable_villages: ['Kikruma', 'Porba', 'Zhamai'],
    road_name: 'Phek-Kohima State Road',
    road_criticality: 'District Lifeline',
    critical_infrastructure: ['District Telecom Microwave Relay Mast'],
    current_risk_score: 58,
    current_risk_level: 'WATCH',
    last_updated: '2026-09-16 08:20 IST',
    verification_status: 'Unverified'
  },
  {
    id: 'NER-MN-06',
    name: 'Noney - Tupul Railway Line Segment',
    district: 'Noney',
    state: 'Manipur',
    lat: 24.8167,
    lng: 93.6000,
    elevation: 780,
    slope: 41.5,
    rainfall_current_mm: 72.0,
    rainfall_7d_cumulative_mm: 198.0,
    forecast_rainfall_48h_mm: 45.0,
    soil_moisture_pct: 65.4,
    historical_events_count: 11,
    exposed_population: 6800,
    vulnerable_villages: ['Marangching', 'Tupul Station Colony'],
    road_name: 'NH-37 Imphal-Jiribam Highway',
    road_criticality: 'National Highway',
    critical_infrastructure: ['Ijei River Bridge Abutment', 'Tupul Railway Yard Retaining Wall'],
    current_risk_score: 64,
    current_risk_level: 'WATCH',
    last_updated: '2026-09-16 11:00 IST',
    verification_status: 'Field Verified'
  },
  {
    id: 'NER-MZ-07',
    name: 'Aizawl Hunthar Slide Zone',
    district: 'Aizawl',
    state: 'Mizoram',
    lat: 23.7271,
    lng: 92.7176,
    elevation: 1132,
    slope: 39.0,
    rainfall_current_mm: 45.0,
    rainfall_7d_cumulative_mm: 120.0,
    forecast_rainfall_48h_mm: 30.0,
    soil_moisture_pct: 54.0,
    historical_events_count: 8,
    exposed_population: 7900,
    vulnerable_villages: ['Hunthar Veng', 'Edenthar', 'Chawnpui'],
    road_name: 'NH-54 Aizawl Entry Arterial',
    road_criticality: 'District Lifeline',
    critical_infrastructure: ['Greater Aizawl Water Supply Main Line', 'Bawngkawn Grid Substation'],
    current_risk_score: 42,
    current_risk_level: 'WATCH',
    last_updated: '2026-09-16 07:45 IST',
    verification_status: 'Unverified'
  },
  {
    id: 'NER-TR-08',
    name: 'Jampui Hills Ridge Border Track',
    district: 'North Tripura',
    state: 'Tripura',
    lat: 23.9500,
    lng: 92.2833,
    elevation: 930,
    slope: 26.0,
    rainfall_current_mm: 22.0,
    rainfall_7d_cumulative_mm: 68.0,
    forecast_rainfall_48h_mm: 15.0,
    soil_moisture_pct: 38.0,
    historical_events_count: 3,
    exposed_population: 2900,
    vulnerable_villages: ['Vanghmun', 'Tlangsang'],
    road_name: 'Kumarghat-Kanchanpur-Jampui Road',
    road_criticality: 'Local Access',
    critical_infrastructure: ['Border Post Solar Microgrid'],
    current_risk_score: 21,
    current_risk_level: 'LOW',
    last_updated: '2026-09-16 06:30 IST',
    verification_status: 'Field Verified'
  }
];

export const INITIAL_REPORTS: FieldReport[] = [
  {
    id: 'REP-2026-001',
    location_id: 'NER-SK-01',
    location_name: 'Dikchu - Singtam Highway Corridor (NH-10)',
    lat: 27.3791,
    lng: 88.5281,
    reporter_name: 'Sub-Inspector T. Lepcha',
    reporter_role: 'NDRF Field Operative',
    observations: {
      cracks: true,
      soil_movement: true,
      debris: true,
      road_blockage: true
    },
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80',
    image_name: 'dikchu_rockfall_slip_0916.jpg',
    vision_analysis: {
      crack_detected: true,
      debris_detected: true,
      road_blockage_detected: true,
      confidence: 0.94,
      features_summary: [
        'Transverse tension crack detected (approx width: 14cm)',
        'Loose scree & boulder debris occupying 65% roadway width',
        'Active water seepage through upslope toe cut'
      ],
      model_notice: 'Prototype Vision Engine (SIH-26001 baseline heuristic calibration ready for YOLOv8/ResNet fine-tuning)'
    },
    notes: 'Severe crown cracks developing above km marker 48. Heavy seepage noted after continuous 48h deluge. BRO requested for earthmovers.',
    created_at: '2026-09-16 11:15 IST',
    synced_online: true,
    risk_adjusted_delta: +12
  },
  {
    id: 'REP-2026-002',
    location_id: 'NER-MG-02',
    location_name: 'Cherrapunji - Shella Escarpment & Mawkdok Valley',
    lat: 25.2990,
    lng: 91.7330,
    reporter_name: 'Er. P. Lyngdoh',
    reporter_role: 'BRO Road Engineer',
    observations: {
      cracks: true,
      soil_movement: true,
      debris: true,
      road_blockage: false
    },
    image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    image_name: 'mawkdok_slope_subsidence.jpg',
    vision_analysis: {
      crack_detected: true,
      debris_detected: true,
      road_blockage_detected: false,
      confidence: 0.88,
      features_summary: [
        'En-echelon longitudinal slope displacement visible',
        'Mud slurry flow along drainage culvert',
        'Retaining breast wall exhibiting forward rotational tilt'
      ],
      model_notice: 'Prototype Vision Engine (SIH-26001 baseline heuristic calibration ready for YOLOv8/ResNet fine-tuning)'
    },
    notes: 'Retaining wall bulging outward by 12cm. One lane traffic diverted. High risk if 48h precipitation reaches forecasted 130mm.',
    created_at: '2026-09-16 10:20 IST',
    synced_online: true,
    risk_adjusted_delta: +8
  },
  {
    id: 'REP-2026-003',
    location_id: 'NER-AS-03',
    location_name: 'Haflong - Jatinga Valley Slide Zone',
    lat: 25.1768,
    lng: 93.0375,
    reporter_name: 'R. K. Hmar',
    reporter_role: 'District Disaster Officer',
    observations: {
      cracks: true,
      soil_movement: false,
      debris: true,
      road_blockage: false
    },
    image_url: 'https://images.unsplash.com/photo-1545972154-9bb223aac798?auto=format&fit=crop&w=800&q=80',
    image_name: 'jatinga_track_culvert.jpg',
    vision_analysis: {
      crack_detected: true,
      debris_detected: false,
      road_blockage_detected: false,
      confidence: 0.81,
      features_summary: [
        'Superficial soil scouring along trackside embankment',
        'Minor scree accumulation cleared by railway patrol'
      ],
      model_notice: 'Prototype Vision Engine (SIH-26001 baseline heuristic calibration ready for YOLOv8/ResNet fine-tuning)'
    },
    notes: 'Minor slope wash off railway cutting. Speed restriction (20 km/h) imposed for passenger trains by N.F. Railway.',
    created_at: '2026-09-16 09:40 IST',
    synced_online: true,
    risk_adjusted_delta: +4
  }
];

export const INITIAL_ALERTS: DisasterAlert[] = [
  {
    id: 'ALT-2026-001',
    location_id: 'NER-SK-01',
    location_name: 'Dikchu - Singtam Highway Corridor (NH-10), Sikkim',
    risk_level: 'CRITICAL',
    severity: 'Extreme',
    language: 'English',
    title: 'RED ALERT: Imminent Slope Failure & Highway Breaching',
    message: 'CRITICAL WARNING: High probability of massive debris slide along NH-10 near Dikchu over the next 6-12 hours. Teesta barrage waters saturated slope toe. Evacuate roadside dwellings and stop vehicular traffic immediately.',
    timestamp: '2026-09-16 11:35 IST',
    delivery_channels: {
      sms_broadcast: 'Simulated Sent',
      cap_ndma_feed: 'Active Feed',
      siren_relay: 'Armed'
    },
    author: 'SEOC Sikkim Emergency Operations Centre'
  },
  {
    id: 'ALT-2026-002',
    location_id: 'NER-MG-02',
    location_name: 'Cherrapunji - Shella Escarpment & Mawkdok Valley, Meghalaya',
    risk_level: 'CRITICAL',
    severity: 'Severe',
    language: 'English',
    title: 'CRITICAL WARNING: Valley Escarpment Subsidence',
    message: 'Severe slope destabilization detected along SH-5 Mawkdok Valley corridor with 94% soil saturation. Avoid all non-emergency travel to Sohra/Shella. Emergency shelters at Cherrapunji GSS opened.',
    timestamp: '2026-09-16 10:50 IST',
    delivery_channels: {
      sms_broadcast: 'Simulated Sent',
      cap_ndma_feed: 'Active Feed',
      siren_relay: 'Standby'
    },
    author: 'State Disaster Management Authority (SDMA) Meghalaya'
  },
  {
    id: 'ALT-2026-003',
    location_id: 'NER-AS-03',
    location_name: 'Haflong - Jatinga Valley Slide Zone, Assam',
    risk_level: 'HIGH',
    severity: 'Warning',
    language: 'Assamese',
    title: 'উচ্চ সতৰ্কতা: হাফলং-জাতিংগা পথত ভূমিস্খলনৰ আশংকা',
    message: 'অসম ৰাজ্যিক দুৰ্যোগ ব্যৱস্থাপনা প্ৰাধিকৰণ (ASDMA): ডিমা হাচাও জিলাৰ জাতিংগা আৰু হাফলং সংযোগী পথত অত্যধিক বৰষুণৰ ফলত ভূমিস্খলনৰ প্ৰচুৰ সম্ভাৱনা আছে। যাত্ৰীসকলক সতৰ্ক থাকিবলৈ কোৱা হৈছে।',
    timestamp: '2026-09-16 09:15 IST',
    delivery_channels: {
      sms_broadcast: 'Simulated Sent',
      cap_ndma_feed: 'Active Feed',
      siren_relay: 'Standby'
    },
    author: 'ASDMA Control Room, Guwahati'
  }
];

export const MULTILINGUAL_TEMPLATES: Record<
  'English' | 'Hindi' | 'Assamese' | 'Bengali',
  Record<'CRITICAL' | 'HIGH' | 'WATCH', { title: string; body: (loc: string, rain: number) => string }>
> = {
  English: {
    CRITICAL: {
      title: 'CRITICAL EVACUATION WARNING: Active Landslide Threat',
      body: (loc, rain) =>
        `URGENT: Imminent landslide risk at ${loc}. Recorded rainfall ${rain}mm with severe soil saturation. Evacuate vulnerable slopes and halt traffic on feeder roads immediately. Follow District Disaster Management directives.`
    },
    HIGH: {
      title: 'HIGH ALERT: Heightened Slope Instability Alert',
      body: (loc, rain) =>
        `CAUTION: Elevated risk of slope failure and rockfalls at ${loc}. Cumulative rainfall ${rain}mm. Restrict heavy vehicle movement and keep emergency response teams on standby.`
    },
    WATCH: {
      title: 'ADVISORY: Pre-Landslide Weather & Terrain Watch',
      body: (loc, rain) =>
        `ADVISORY: Terrain monitoring active for ${loc}. Monitored rainfall ${rain}mm. Residents near hilly cuttings should report any emerging ground fissures or sudden muddy seepages.`
    }
  },
  Hindi: {
    CRITICAL: {
      title: 'अति-गंभीर भूस्खलन चेतावनी (Red Alert): तत्काल सुरक्षित स्थान पर जाएं',
      body: (loc, rain) =>
        `अति-आवश्यक चेतावनी: ${loc} क्षेत्र में भारी भूस्खलन की अत्यधिक संभावना है। वर्षा ${rain} मिमी दर्ज की गई है। पहाड़ी ढलानों पर रहने वाले तुरंत सुरक्षित शिविरों में जाएं और इस मार्ग पर आवागमन पूरी तरह बंद रखें।`
    },
    HIGH: {
      title: 'उच्च भूस्खलन चेतावनी (Orange Alert): सतर्क रहें',
      body: (loc, rain) =>
        `चेतावनी: ${loc} में लगातार हो रही वर्षा (${rain} मिमी) से मिट्टी खिसकने की आशंका है। रात में यात्रा करने से बचें तथा आपातकालीन दल अलर्ट पर रहें।`
    },
    WATCH: {
      title: 'मौसम एवं भू-निगरानी परामर्श (Yellow Watch)',
      body: (loc, rain) =>
        `परामर्श: ${loc} क्षेत्र में भूस्खलन निगरानी सक्रिय है। वर्षा ${rain} मिमी। यदि पहाड़ी पर कोई नई दरार दिखे तो तत्काल आपदा नियंत्रण कक्ष को सूचित करें।`
    }
  },
  Assamese: {
    CRITICAL: {
      title: 'চৰম জৰুৰী সতৰ্কবাণী: তাৎক্ষণিক সুৰক্ষিত স্থানলৈ স্থানান্তৰ হবলৈ নিৰ্দেশ',
      body: (loc, rain) =>
        `অতি জৰুৰী: ${loc} অঞ্চলত ভয়ংকৰ ভূমিস্খলনৰ আশংকাজনক পৰিস্থিতি সৃষ্টি হৈছে। বৰষুণৰ মাত্ৰা ${rain} মিমি অতিক্ৰম কৰিছে। পাহাৰীয়া ঢালৰ বাসিন্দাসকলে ততাতৈয়াকৈ সুৰক্ষিত আশ্ৰয়স্থললৈ স্থানান্তৰিত হওক।`
    },
    HIGH: {
      title: 'উচ্চ সতৰ্কতা: পথ আৰু পাহাৰীয়া ঢালত সাৱধানতা অৱলম্বন কৰক',
      body: (loc, rain) =>
        `সতৰ্কতা: ${loc} এলেকাত ধাৰাসাৰ বৰষুণৰ ফলত (${rain} মিমি) পাহাৰ খহি পৰাৰ প্ৰবল সম্ভাৱনা আছে। জৰুৰী প্ৰয়োজন নহ'লে পাহাৰীয়া পথেৰে ভ্ৰমণ নকৰিব।`
    },
    WATCH: {
      title: 'প্ৰাৰম্ভিক ভূমিস্খলন নিৰীক্ষণ সতৰ্কতা',
      body: (loc, rain) =>
        `${loc} অঞ্চলৰ বাবে জলবায়ু আৰু মাটিৰ আৰ্দ্ৰতা নিৰীক্ষণ কৰা হৈছে। বৰষুণৰ পৰিমাণ ${rain} মিমি। মাটি ফটা বা পানীৰ স্ৰোত দেখিলে স্থানীয় প্ৰশাসনক জনাব।`
    }
  },
  Bengali: {
    CRITICAL: {
      title: 'চরম বিপজ্জনক ভূমিধস সতর্কতা: অবিলম্বে এলাকা খালি করুন',
      body: (loc, rain) =>
        `জরুরি সতর্কবার্তা: ${loc} এলাকায় ভয়াবহ ভূমিধসের প্রবল আশঙ্কা দেখা দিয়েছে। বৃষ্টিপাত ${rain} মিমি ছাড়িয়েছে। ঝুঁকিপূর্ণ ঢালু এলাকার বাসিন্দারা অবিলম্বে নিকটবর্তী ত্রাণ শিবিরে আশ্রয় নিন।`
    },
    HIGH: {
      title: 'উচ্চ সতর্কতা: পাহাড়ী রাস্তায় ধস নামার আশঙ্কা',
      body: (loc, rain) =>
        `সতর্কবার্তা: ${loc} সংলগ্ন পাহাড়ি রাস্তায় ভূমিধসের উচ্চ ঝুঁকি রয়েছে। বৃষ্টিপাত ${rain} মিমি। যান চলাচল সীমিত করুন এবং উদ্ধারকারী দল প্রস্তুত রাখুন।`
    },
    WATCH: {
      title: 'প্রাথমিক নজরদারি ও ভূমিধস পূর্বাভাস বার্তা',
      body: (loc, rain) =>
        `${loc} এলাকার ভূতাত্ত্বিক পরিস্থিতি সতর্কভাবে পর্যবেক্ষণ করা হচ্ছে। কোনো ফাটল বা ধসের লক্ষণ চোখে পড়লে তৎক্ষণাৎ জেলা কন্ট্রোল রুমে জানান।`
    }
  }
};
