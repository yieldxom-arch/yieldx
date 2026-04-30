import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Plus, Trash2, Check, X, Search, Star, Navigation,
  AlertTriangle, TrendingUp, Users, Target, Zap, ChevronDown,
  ChevronUp, Eye, EyeOff, Sparkles, Info, BarChart2, Loader2,
  Building2, RefreshCw, Coffee, Utensils, ShoppingBag, Briefcase
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// LEAFLET CSS
// ═══════════════════════════════════════════════════════════════════════
const LEAFLET_CSS_ID = 'leaflet-css';
function injectLeafletCSS() {
  if (document.getElementById(LEAFLET_CSS_ID)) return;
  const link = document.createElement('link');
  link.id = LEAFLET_CSS_ID;
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
export interface Competitor {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  rating: number;
  distance: number;
  lat: number;
  lng: number;
  color: string;
  icon: string;
  isUserAdded: boolean;
  isSelected: boolean;
  osmId?: number;
  address?: string;
  phone?: string;
  website?: string;
}

interface Props {
  location: string;
  sector: string;
  businessIdea: string;
  businessName: string;
  language: 'ar' | 'en';
  isDark: boolean;
  onCompetitorsChange?: (competitors: Competitor[]) => void;
}

// ═══════════════════════════════════════════════════════════════════════
// OMAN CITY COORDINATES
// ═══════════════════════════════════════════════════════════════════════
const OMAN_CITIES: Record<string, [number, number]> = {
  'مسقط': [23.5880, 58.3829], 'muscat': [23.5880, 58.3829],
  'صلالة': [17.0151, 54.0924], 'salalah': [17.0151, 54.0924],
  'نزوى': [22.9333, 57.5333], 'nizwa': [22.9333, 57.5333],
  'صحار': [24.3475, 56.7459], 'sohar': [24.3475, 56.7459],
  'عبري': [23.2289, 56.5097], 'ibri': [23.2289, 56.5097],
  'السيب': [23.6773, 58.1817], 'seeb': [23.6773, 58.1817],
  'بوشر': [23.6086, 58.5922], 'bowsher': [23.6086, 58.5922],
  'مطرح': [23.6139, 58.5931], 'mutrah': [23.6139, 58.5931],
  'روي': [23.5840, 58.4053], 'ruwi': [23.5840, 58.4053],
  'الخوض': [23.6000, 58.1833], 'al khoud': [23.6000, 58.1833],
  'قريات': [23.4819, 58.9208], 'quriyat': [23.4819, 58.9208],
  'بركاء': [23.7833, 57.8667], 'barka': [23.7833, 57.8667],
  'الرستاق': [23.3917, 57.4208], 'rustaq': [23.3917, 57.4208],
  'العامرات': [23.5600, 58.6000], 'amerat': [23.5600, 58.6000],
  'الخابورة': [23.9689, 57.0819], 'khabourah': [23.9689, 57.0819],
  'دبي': [25.2048, 55.2708], 'dubai': [25.2048, 55.2708],
  'أبوظبي': [24.4539, 54.3773], 'abu dhabi': [24.4539, 54.3773],
};

function getDefaultCoords(location: string): [number, number] {
  if (!location) return [23.5880, 58.3829];
  const key = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(OMAN_CITIES)) {
    if (key.includes(city.toLowerCase()) || city.toLowerCase().includes(key)) {
      return coords;
    }
  }
  return [23.5880, 58.3829];
}

// ═══════════════════════════════════════════════════════════════════════
// IDEA → OSM TAGS MAPPING
// ═══════════════════════════════════════════════════════════════════════
interface OsmQuery {
  label: { en: string; ar: string };
  icon: string;
  color: string;
  tags: { key: string; value: string }[];
}

function ideaToOsmQueries(idea: string, sector: string): OsmQuery[] {
  const text = (idea + ' ' + sector).toLowerCase();
  const queries: OsmQuery[] = [];

  // Food & Beverage
  if (/caf[eé]|coffee|قهوة|كافيه|مقهى/.test(text)) {
    queries.push({ label: { en: 'Café', ar: 'مقهى' }, icon: '☕', color: '#92400e', tags: [{ key: 'amenity', value: 'cafe' }] });
  }
  if (/restaurant|مطعم|food|أكل|طعام/.test(text)) {
    queries.push({ label: { en: 'Restaurant', ar: 'مطعم' }, icon: '🍽️', color: '#dc2626', tags: [{ key: 'amenity', value: 'restaurant' }] });
  }
  if (/bakery|مخبز|خبز|bread/.test(text)) {
    queries.push({ label: { en: 'Bakery', ar: 'مخبز' }, icon: '🥐', color: '#d97706', tags: [{ key: 'shop', value: 'bakery' }] });
  }
  if (/fast.?food|burger|sandwich|وجبات/.test(text)) {
    queries.push({ label: { en: 'Fast Food', ar: 'وجبات سريعة' }, icon: '🍔', color: '#f59e0b', tags: [{ key: 'amenity', value: 'fast_food' }] });
  }
  if (/juice|عصير|smoothie/.test(text)) {
    queries.push({ label: { en: 'Juice Bar', ar: 'عصائر' }, icon: '🧃', color: '#16a34a', tags: [{ key: 'amenity', value: 'juice_bar' }] });
  }
  if (/sweet|dessert|ice.?cream|حلويات|جيلاتي/.test(text)) {
    queries.push({ label: { en: 'Sweets / Desserts', ar: 'حلويات' }, icon: '🍰', color: '#db2777', tags: [{ key: 'shop', value: 'confectionery' }, { key: 'shop', value: 'pastry' }] });
  }

  // Retail / Shops
  if (/supermarket|grocery|بقالة|سوبرماركت|تموينات/.test(text)) {
    queries.push({ label: { en: 'Supermarket', ar: 'سوبرماركت' }, icon: '🛒', color: '#2563eb', tags: [{ key: 'shop', value: 'supermarket' }, { key: 'shop', value: 'convenience' }] });
  }
  if (/cloth|fashion|ملابس|أزياء|fashion/.test(text)) {
    queries.push({ label: { en: 'Clothing', ar: 'ملابس' }, icon: '👔', color: '#7c3aed', tags: [{ key: 'shop', value: 'clothes' }] });
  }
  if (/electron|tech|تقنية|إلكترونيات|جوال|mobile/.test(text)) {
    queries.push({ label: { en: 'Electronics', ar: 'إلكترونيات' }, icon: '📱', color: '#0891b2', tags: [{ key: 'shop', value: 'electronics' }, { key: 'shop', value: 'mobile_phone' }] });
  }
  if (/pharmacy|صيدلية|دواء|medicine/.test(text)) {
    queries.push({ label: { en: 'Pharmacy', ar: 'صيدلية' }, icon: '💊', color: '#16a34a', tags: [{ key: 'amenity', value: 'pharmacy' }] });
  }
  if (/book|كتاب|مكتبة|library|stationery|قرطاسية/.test(text)) {
    queries.push({ label: { en: 'Bookstore / Stationery', ar: 'مكتبة / قرطاسية' }, icon: '📚', color: '#b45309', tags: [{ key: 'shop', value: 'books' }, { key: 'shop', value: 'stationery' }] });
  }

  // Services
  if (/salon|barber|حلاق|صالون|beauty|تجميل/.test(text)) {
    queries.push({ label: { en: 'Salon / Barber', ar: 'صالون / حلاق' }, icon: '💈', color: '#0d9488', tags: [{ key: 'shop', value: 'hairdresser' }, { key: 'shop', value: 'beauty' }] });
  }
  if (/gym|fitness|رياضة|نادي/.test(text)) {
    queries.push({ label: { en: 'Gym / Fitness', ar: 'نادي رياضي' }, icon: '🏋️', color: '#ea580c', tags: [{ key: 'leisure', value: 'fitness_centre' }, { key: 'leisure', value: 'sports_centre' }] });
  }
  if (/hotel|فندق|استراحة|resort/.test(text)) {
    queries.push({ label: { en: 'Hotel / Resort', ar: 'فندق / منتجع' }, icon: '🏨', color: '#9333ea', tags: [{ key: 'tourism', value: 'hotel' }, { key: 'tourism', value: 'guest_house' }] });
  }
  if (/school|education|مدرسة|تعليم|training|تدريب|institute|معهد/.test(text)) {
    queries.push({ label: { en: 'Education / Training', ar: 'تعليم / تدريب' }, icon: '🎓', color: '#0ea5e9', tags: [{ key: 'amenity', value: 'school' }, { key: 'amenity', value: 'college' }] });
  }
  if (/hospital|clinic|طب|مستشفى|عيادة|health/.test(text)) {
    queries.push({ label: { en: 'Clinic / Hospital', ar: 'عيادة / مستشفى' }, icon: '🏥', color: '#dc2626', tags: [{ key: 'amenity', value: 'clinic' }, { key: 'amenity', value: 'hospital' }] });
  }
  if (/car.?wash|غسيل.*سيارة|auto|ميكانيك|mechanic|garage/.test(text)) {
    queries.push({ label: { en: 'Auto Service', ar: 'خدمات سيارات' }, icon: '🔧', color: '#374151', tags: [{ key: 'amenity', value: 'car_wash' }, { key: 'shop', value: 'car_repair' }] });
  }
  if (/laundry|مغسلة|cleaning/.test(text)) {
    queries.push({ label: { en: 'Laundry', ar: 'مغسلة' }, icon: '👕', color: '#0284c7', tags: [{ key: 'shop', value: 'laundry' }] });
  }
  if (/print|طباعة|copy|نسخ/.test(text)) {
    queries.push({ label: { en: 'Print Shop', ar: 'مركز طباعة' }, icon: '🖨️', color: '#6366f1', tags: [{ key: 'shop', value: 'copyshop' }] });
  }

  // Sector fallbacks
  if (queries.length === 0) {
    if (sector === 'food' || /food|أكل|طعام/.test(text)) {
      queries.push({ label: { en: 'Restaurant', ar: 'مطعم' }, icon: '🍽️', color: '#dc2626', tags: [{ key: 'amenity', value: 'restaurant' }] });
      queries.push({ label: { en: 'Café', ar: 'مقهى' }, icon: '☕', color: '#92400e', tags: [{ key: 'amenity', value: 'cafe' }] });
    } else if (sector === 'retail' || /retail|تجزئة/.test(text)) {
      queries.push({ label: { en: 'Shop', ar: 'متجر' }, icon: '🛍️', color: '#7c3aed', tags: [{ key: 'shop', value: 'general' }] });
    } else if (sector === 'services' || /service|خدمة/.test(text)) {
      queries.push({ label: { en: 'Service Business', ar: 'خدمات' }, icon: '🏢', color: '#0891b2', tags: [{ key: 'office', value: 'company' }] });
    } else {
      // Generic commercial
      queries.push({ label: { en: 'Shop / Business', ar: 'محل / أعمال' }, icon: '🏪', color: '#6366f1', tags: [{ key: 'shop', value: 'general' }] });
    }
  }

  return queries;
}

// ═══════════════════════════════════════════════════════════════════════
// OVERPASS API FETCH
// ═══════════════════════════════════════════════════════════════════════
async function fetchRealCompetitors(
  center: [number, number],
  queries: OsmQuery[],
  radiusMeters = 3000
): Promise<Competitor[]> {
  const [lat, lng] = center;
  const tagFilters = queries.flatMap(q =>
    q.tags.map(t => `node["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lng});
way["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lng});`)
  ).join('\n');

  const overpassQuery = `[out:json][timeout:20];
(
${tagFilters}
);
out center tags 60;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(overpassQuery)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Overpass API error');
  const data = await response.json();

  return (data.elements as any[]).slice(0, 30).map((el: any, i: number): Competitor => {
    const elLat = el.lat ?? el.center?.lat ?? lat;
    const elLng = el.lon ?? el.center?.lon ?? lng;
    const distKm = haversineKm(lat, lng, elLat, elLng);

    // Find which query matched this element
    const matched = queries.find(q => q.tags.some(t => el.tags?.[t.key] === t.value)) ?? queries[0];

    // Seed a rating from the OSM id
    const seed = (el.id ?? i) % 20;
    const rating = parseFloat((3.0 + (seed / 20) * 2).toFixed(1));

    const name = el.tags?.name || el.tags?.['name:en'] || matched.label.en;
    const nameAr = el.tags?.['name:ar'] || el.tags?.name || matched.label.ar;

    return {
      id: `osm-${el.id ?? i}`,
      name,
      nameAr,
      type: matched.label.en,
      typeAr: matched.label.ar,
      rating,
      distance: parseFloat(distKm.toFixed(2)),
      lat: elLat,
      lng: elLng,
      color: matched.color,
      icon: matched.icon,
      isUserAdded: false,
      isSelected: false,
      osmId: el.id,
      address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', '),
      phone: el.tags?.phone || el.tags?.['contact:phone'],
      website: el.tags?.website || el.tags?.['contact:website'],
    };
  }).sort((a, b) => a.distance - b.distance);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════════════════════
// SCORE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════
function computeScores(competitors: Competitor[]) {
  const selected = competitors.filter(c => c.isSelected);
  const n = selected.length;
  if (n === 0) return { competition: 0, opportunity: 100, verdict: 'blue' as const };
  const avgDist = selected.reduce((s, c) => s + c.distance, 0) / n;
  const avgRating = selected.reduce((s, c) => s + c.rating, 0) / n;
  const densityScore = Math.min(100, n * 10);
  const proximityScore = Math.max(0, 100 - avgDist * 20);
  const qualityScore = (avgRating / 5) * 40;
  const competition = Math.round(densityScore * 0.45 + proximityScore * 0.35 + qualityScore * 0.2);
  const opportunity = Math.round(100 - competition * 0.6);
  const verdict = competition < 35 ? 'green' : competition < 60 ? 'yellow' : 'red';
  return { competition: Math.min(competition, 100), opportunity: Math.max(opportunity, 10), verdict };
}

// ═══════════════════════════════════════════════════════════════════════
// LEAFLET MAP
// ═══════════════════════════════════════════════════════════════════════
function LeafletMap({ center, competitors, language, isDark, onCompetitorClick }: {
  center: [number, number];
  competitors: Competitor[];
  language: 'ar' | 'en';
  isDark: boolean;
  onCompetitorClick: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    injectLeafletCSS();
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      import('leaflet').then((L) => {
        const leaflet = L.default || L;
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (!mapRef.current) return;

        const map = leaflet.map(mapRef.current!, { center, zoom: 14, zoomControl: true });

        leaflet.tileLayer(
          isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '© OpenStreetMap', maxZoom: 19 }
        ).addTo(map);

        mapInstanceRef.current = map;

        // Your business pin
        const centerIcon = leaflet.divIcon({
          html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:3px solid white;box-shadow:0 0 20px #6366f190;display:flex;align-items:center;justify-content:center;font-size:18px;">⭐</div>`,
          iconSize: [40, 40], iconAnchor: [20, 20], className: '',
        });
        leaflet.marker(center, { icon: centerIcon }).addTo(map)
          .bindPopup(`<strong style="color:#6366f1">${language === 'ar' ? '📍 موقع مشروعك' : '📍 Your Business Location'}</strong>`);

        // Radius circle
        leaflet.circle(center, { radius: 3000, color: '#6366f140', fillColor: '#6366f108', fillOpacity: 1, weight: 1, dashArray: '6,5' }).addTo(map);

        // Competitor pins
        competitors.forEach(comp => {
          const isSelected = comp.isSelected;
          const pin = leaflet.divIcon({
            html: `<div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:36px;height:36px;border-radius:50%;background:${comp.color};border:${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.3)'};box-shadow:0 4px 12px ${comp.color}80;display:flex;align-items:center;justify-content:center;font-size:15px;transform:${isSelected ? 'scale(1.2)' : 'scale(1)'}">${comp.icon}</div>
              <div style="width:2px;height:6px;background:${comp.color}80"></div>
              <div style="width:5px;height:5px;border-radius:50%;background:${comp.color}60"></div>
            </div>`,
            iconSize: [36, 49], iconAnchor: [18, 49], className: '',
          });

          const marker = leaflet.marker([comp.lat, comp.lng], { icon: pin }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:system-ui;min-width:200px;padding:4px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:22px">${comp.icon}</span>
                <div>
                  <strong style="color:#1e293b;font-size:13px">${language === 'ar' ? comp.nameAr : comp.name}</strong>
                  <div style="color:#64748b;font-size:11px">${language === 'ar' ? comp.typeAr : comp.type}</div>
                </div>
              </div>
              <div style="display:flex;gap:10px;margin-bottom:10px;font-size:12px;color:#475569">
                <span>⭐ ${comp.rating}</span>
                <span>📏 ${comp.distance} ${language === 'ar' ? 'كم' : 'km'}</span>
                ${comp.address ? `<span>📍 ${comp.address}</span>` : ''}
              </div>
              <button onclick="window.__selectComp?.('${comp.id}')"
                style="width:100%;padding:7px;border-radius:8px;border:none;background:${isSelected ? '#ef444420' : '#6366f1'};color:${isSelected ? '#ef4444' : 'white'};font-size:12px;cursor:pointer;font-weight:600">
                ${isSelected ? (language === 'ar' ? '✕ إلغاء التحديد' : '✕ Deselect') : (language === 'ar' ? '✓ تحديد كمنافس' : '✓ Mark as Competitor')}
              </button>
            </div>`, { maxWidth: 260 });
        });

        (window as any).__selectComp = onCompetitorClick;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [center[0], center[1], isDark, JSON.stringify(competitors.map(c => ({ id: c.id, isSelected: c.isSelected })))]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '12px' }} />;
}

// ═══════════════════════════════════════════════════════════════════════
// SCORE RING
// ═══════════════════════════════════════════════════════════════════════
function ScoreRing({ value, color, label, labelAr, isRTL }: { value: number; color: string; label: string; labelAr: string; isRTL: boolean }) {
  const r = 38; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-22 h-22" style={{ width: 88, height: 88 }}>
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}</span>
          <span className="text-white/40 text-[9px]">/100</span>
        </div>
      </div>
      <span className="text-xs text-white/60 text-center">{isRTL ? labelAr : label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function CompetitorAnalysisMap({ location, sector, businessIdea, businessName, language, isDark, onCompetitorsChange }: Props) {
  const isRTL = language === 'ar';

  type LoadState = 'idle' | 'geocoding' | 'fetching' | 'done' | 'error' | 'no-idea' | 'no-results';
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [center, setCenter] = useState<[number, number]>(getDefaultCoords(location));
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [matchedQueries, setMatchedQueries] = useState<OsmQuery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'selected' | 'manual'>('all');
  const [showMap, setShowMap] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [newComp, setNewComp] = useState({ name: '', nameAr: '', type: '', distance: '', rating: '4.0' });

  const hasIdea = businessIdea.trim().length > 3;
  const hasLocation = location.trim().length > 0;

  const runAnalysis = useCallback(async () => {
    if (!hasIdea || !hasLocation) {
      setLoadState('no-idea');
      setCompetitors([]);
      return;
    }

    const queries = ideaToOsmQueries(businessIdea, sector);
    setMatchedQueries(queries);
    setLoadState('geocoding');
    setCompetitors([]);

    let coords: [number, number] = getDefaultCoords(location);

    // Geocode location
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ' Oman')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const geoData = await geoRes.json();
      if (geoData?.[0]) {
        coords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
      }
    } catch { /* fall back to default */ }

    setCenter(coords);
    setLoadState('fetching');

    try {
      const results = await fetchRealCompetitors(coords, queries);
      if (results.length === 0) {
        setLoadState('no-results');
      } else {
        setCompetitors(results);
        setLoadState('done');
        setMapKey(k => k + 1);
      }
    } catch (e) {
      setErrorMsg(String(e));
      setLoadState('error');
    }
  }, [businessIdea, location, sector, hasIdea, hasLocation]);

  // Auto-run when business idea / location changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => { runAnalysis(); }, 800);
    return () => clearTimeout(t);
  }, [businessIdea, location, sector]);

  useEffect(() => {
    onCompetitorsChange?.(competitors.filter(c => c.isSelected));
  }, [competitors]);

  const toggleSelect = useCallback((id: string) => {
    setCompetitors(prev => prev.map(c => c.id === id ? { ...c, isSelected: !c.isSelected } : c));
  }, []);

  const removeCompetitor = useCallback((id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

  const addManual = () => {
    if (!newComp.name.trim()) return;
    const dist = parseFloat(newComp.distance) || 0.5;
    const angle = Math.random() * 2 * Math.PI;
    const comp: Competitor = {
      id: `manual-${Date.now()}`,
      name: newComp.name,
      nameAr: newComp.nameAr || newComp.name,
      type: newComp.type || 'Business',
      typeAr: newComp.type || 'أعمال',
      rating: parseFloat(newComp.rating) || 4.0,
      distance: dist,
      lat: center[0] + (dist / 111) * Math.cos(angle),
      lng: center[1] + (dist / 111) * Math.sin(angle),
      color: '#6366f1', icon: '🏪',
      isUserAdded: true, isSelected: true,
    };
    setCompetitors(prev => [...prev, comp]);
    setNewComp({ name: '', nameAr: '', type: '', distance: '', rating: '4.0' });
    setShowAddForm(false);
    setMapKey(k => k + 1);
  };

  const selectedCount = competitors.filter(c => c.isSelected).length;
  const scores = computeScores(competitors);
  const filtered = competitors.filter(c => {
    const mf = filter === 'all' ? true : filter === 'selected' ? c.isSelected : c.isUserAdded;
    const ms = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.nameAr.includes(searchQuery);
    return mf && ms;
  });

  // Styles
  const card = `rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/90 border-slate-200 shadow'}`;
  const tp = isDark ? 'text-white' : 'text-slate-900';
  const ts = isDark ? 'text-white/55' : 'text-slate-500';
  const inp = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500/60' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'}`;

  const verdictMap = {
    green:  { grad: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/40', tc: 'text-emerald-400', label: isRTL ? '🟢 منافسة منخفضة — فرصة ممتازة!' : '🟢 Low Competition — Great Opportunity!', sub: isRTL ? 'الموقع مناسب جداً لمشروعك' : 'This location is highly suitable' },
    yellow: { grad: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/40', tc: 'text-yellow-400', label: isRTL ? '🟡 منافسة معتدلة — دراسة دقيقة مطلوبة' : '🟡 Moderate Competition — Study Carefully', sub: isRTL ? 'يمكنك النجاح بميزة تنافسية واضحة' : 'A clear competitive edge is needed' },
    red:    { grad: 'from-red-500/20 to-rose-500/20',     border: 'border-red-500/40',    tc: 'text-red-400',    label: isRTL ? '🔴 منافسة عالية — انتبه!' : '🔴 High Competition — Be Careful!', sub: isRTL ? 'السوق مكتظ — ابحث عن ميزة تنافسية قوية' : 'Market is saturated — differentiation is critical' },
    blue:   { grad: 'from-indigo-500/20 to-blue-500/20',  border: 'border-indigo-500/40', tc: 'text-indigo-400', label: '', sub: '' },
  }[scores.verdict];

  // ─── EMPTY STATES ───
  if (!hasIdea || !hasLocation) {
    return (
      <div className={`${card} p-10 flex flex-col items-center justify-center text-center gap-4 min-h-64`}>
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl">🗺️</div>
        <div>
          <p className={`text-base font-semibold ${tp} mb-1`}>
            {isRTL ? 'أدخل فكرة مشروعك والموقع أولاً' : 'Enter your business idea & location first'}
          </p>
          <p className={`text-sm ${ts} max-w-sm`}>
            {isRTL
              ? 'بمجرد إدخال فكرة مشروعك وموقعه في المستوى الأول، سيقوم النظام تلقائياً بتحليل المنطقة وعرض المنافسين الحقيقيين القريبين منك.'
              : 'Once you enter your business idea and location in Level 1, the system will automatically scan the area and show real nearby competitors related to your business type.'}
          </p>
        </div>
        <div className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl ${isDark ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
          <Sparkles className="w-3.5 h-3.5" />
          {isRTL ? 'مدعوم ببيانات OpenStreetMap الحقيقية' : 'Powered by real OpenStreetMap data'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ─── IDEA CONTEXT BANNER ─── */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            {isRTL ? 'تحليل تلقائي بناءً على فكرتك' : 'Auto-analysis based on your idea'}
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-indigo-300/70' : 'text-indigo-600'} truncate`}>
            {isRTL ? `"${businessIdea}" — ${location}` : `"${businessIdea}" — ${location}`}
          </p>
          {matchedQueries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {matchedQueries.map((q, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70" style={{ backgroundColor: q.color + '25', color: q.color }}>
                  {q.icon} {isRTL ? q.label.ar : q.label.en}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={runAnalysis}
          disabled={loadState === 'geocoding' || loadState === 'fetching'}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'} disabled:opacity-40`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loadState === 'geocoding' || loadState === 'fetching') ? 'animate-spin' : ''}`} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* ─── LOADING STATES ─── */}
      <AnimatePresence mode="wait">
        {(loadState === 'geocoding' || loadState === 'fetching') && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${card} p-10 flex flex-col items-center justify-center gap-4 min-h-48`}>
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <div className="text-center">
              <p className={`text-sm font-semibold ${tp}`}>
                {loadState === 'geocoding'
                  ? (isRTL ? 'جارٍ تحديد الموقع...' : 'Locating your area...')
                  : (isRTL ? 'جارٍ البحث عن منافسين حقيقيين...' : 'Scanning for real competitors nearby...')}
              </p>
              <p className={`text-xs mt-1 ${ts}`}>
                {isRTL ? 'نستخدم بيانات OpenStreetMap للعثور على أعمال تجارية حقيقية بالقرب منك' : 'Using OpenStreetMap data to find real businesses near you'}
              </p>
            </div>
          </motion.div>
        )}

        {loadState === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${card} p-8 flex flex-col items-center gap-3 text-center min-h-40`}>
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className={`text-sm font-semibold ${tp}`}>{isRTL ? 'تعذّر الاتصال بالخدمة' : 'Could not reach mapping service'}</p>
            <p className={`text-xs ${ts}`}>{isRTL ? 'تحقق من اتصال الإنترنت وأعد المحاولة.' : 'Check your internet connection and try again.'}</p>
            <button onClick={runAnalysis} className="text-xs px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors">
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </motion.div>
        )}

        {loadState === 'no-results' && (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${card} p-8 flex flex-col items-center gap-3 text-center min-h-40`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl">🎉</div>
            <p className={`text-sm font-semibold ${tp}`}>{isRTL ? 'لا منافسين مسجلين في هذه المنطقة!' : 'No competitors found in this area!'}</p>
            <p className={`text-xs ${ts} max-w-xs`}>
              {isRTL
                ? 'لم يتم العثور على أعمال مشابهة لمشروعك في نطاق 3 كم. هذا يشير إلى فرصة سوقية ممتازة!'
                : 'No similar businesses found within 3km radius. This indicates an excellent market opportunity!'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => setShowAddForm(true)} className="text-xs px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors">
                {isRTL ? '+ أضف منافساً يدوياً' : '+ Add manual competitor'}
              </button>
              <button onClick={runAnalysis} className={`text-xs px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-white/10 text-white/60 hover:bg-white/15' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {isRTL ? 'إعادة البحث' : 'Re-scan'}
              </button>
            </div>
          </motion.div>
        )}

        {loadState === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* SCORE BANNER */}
            {selectedCount > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 bg-gradient-to-r ${verdictMap.grad} ${verdictMap.border}`}>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex gap-6">
                    <ScoreRing value={scores.competition} color="#ef4444" label="Competition" labelAr="المنافسة" isRTL={isRTL} />
                    <ScoreRing value={scores.opportunity} color="#10b981" label="Opportunity" labelAr="الفرصة" isRTL={isRTL} />
                  </div>
                  <div className="flex-1 text-center sm:text-start">
                    <p className={`text-base font-bold ${verdictMap.tc} mb-1`}>{verdictMap.label}</p>
                    <p className={`text-sm ${ts} mb-3`}>{verdictMap.sub}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className={`text-xs px-3 py-1 rounded-full bg-white/10 ${ts}`}>
                        {isRTL ? `${selectedCount} منافس محدد` : `${selectedCount} competitors selected`}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full bg-white/10 ${ts}`}>
                        {isRTL ? `${competitors.length} منافس رُصد` : `${competitors.length} detected nearby`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MAP */}
            <div className={card}>
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-400" />
                  <h3 className={`font-semibold ${tp}`}>{isRTL ? 'الخريطة التفاعلية' : 'Live Competitor Map'}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isRTL ? `${competitors.length} موجود فعلاً` : `${competitors.length} real businesses`}
                  </span>
                </div>
                <button onClick={() => setShowMap(v => !v)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                  {showMap ? <EyeOff className={`w-4 h-4 ${ts}`} /> : <Eye className={`w-4 h-4 ${ts}`} />}
                </button>
              </div>
              <AnimatePresence>
                {showMap && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 380, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden px-4 pb-4 pt-3">
                    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 380 }}>
                      <LeafletMap key={mapKey} center={center} competitors={competitors} language={language} isDark={isDark} onCompetitorClick={toggleSelect} />
                      <div className="absolute bottom-3 left-3 z-[1000]">
                        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-white/70 space-y-1">
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />⭐ {isRTL ? 'موقعك' : 'Your Business'}</div>
                          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white/30 flex-shrink-0" />{isRTL ? 'انقر على الدبوس للتحديد' : 'Click pin to select'}</div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-white/60">
                        {isRTL ? 'نطاق 3 كم' : '3 km radius'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COMPETITOR LIST */}
            <div className={card}>
              <div className="p-4 pb-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className={`font-semibold ${tp}`}>{isRTL ? 'المنافسون المكتشفون' : 'Detected Competitors'}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500'}`}>{selectedCount}/{competitors.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCompetitors(p => p.map(c => ({ ...c, isSelected: true })))} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors">
                      {isRTL ? 'تحديد الكل' : 'All'}
                    </button>
                    <button onClick={() => setCompetitors(p => p.map(c => ({ ...c, isSelected: false })))} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500'}`}>
                      {isRTL ? 'إلغاء الكل' : 'None'}
                    </button>
                    <button onClick={() => setShowAddForm(v => !v)} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${showAddForm ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}>
                      {showAddForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {showAddForm ? (isRTL ? 'إلغاء' : 'Cancel') : (isRTL ? 'أضف يدوياً' : 'Add Manually')}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${ts}`} />
                    <input className={`${inp} ${isRTL ? 'pr-8' : 'pl-8'}`} placeholder={isRTL ? 'بحث...' : 'Search...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  {(['all', 'selected', 'manual'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-500 text-white' : isDark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-500'}`}>
                      {f === 'all' ? (isRTL ? 'الكل' : 'All') : f === 'selected' ? (isRTL ? 'محدد' : 'Selected') : (isRTL ? 'يدوي' : 'Manual')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Manual Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className={`p-4 border-b border-white/5 ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/60'}`}>
                      <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        {isRTL ? '➕ إضافة منافس يدوياً' : '➕ Add Competitor Manually'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={`text-xs ${ts} mb-1 block`}>{isRTL ? 'الاسم *' : 'Name *'}</label>
                          <input className={inp} placeholder="Business name" value={newComp.name} onChange={e => setNewComp(p => ({ ...p, name: e.target.value }))} /></div>
                        <div><label className={`text-xs ${ts} mb-1 block`}>{isRTL ? 'الاسم بالعربي' : 'Arabic Name'}</label>
                          <input className={inp} placeholder="الاسم" value={newComp.nameAr} onChange={e => setNewComp(p => ({ ...p, nameAr: e.target.value }))} dir="rtl" /></div>
                        <div><label className={`text-xs ${ts} mb-1 block`}>{isRTL ? 'نوع النشاط' : 'Type'}</label>
                          <input className={inp} placeholder="e.g. Café" value={newComp.type} onChange={e => setNewComp(p => ({ ...p, type: e.target.value }))} /></div>
                        <div><label className={`text-xs ${ts} mb-1 block`}>{isRTL ? 'المسافة (كم)' : 'Distance (km)'}</label>
                          <input className={inp} type="number" step="0.1" placeholder="0.5" value={newComp.distance} onChange={e => setNewComp(p => ({ ...p, distance: e.target.value }))} /></div>
                        <div><label className={`text-xs ${ts} mb-1 block`}>{isRTL ? 'التقييم (1-5)' : 'Rating (1-5)'}</label>
                          <input className={inp} type="number" min="1" max="5" step="0.1" value={newComp.rating} onChange={e => setNewComp(p => ({ ...p, rating: e.target.value }))} /></div>
                      </div>
                      <button onClick={addManual} disabled={!newComp.name.trim()}
                        className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                        {isRTL ? '➕ إضافة' : '➕ Add'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List */}
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {filtered.length === 0 && (
                  <div className={`text-center py-8 ${ts}`}>
                    <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isRTL ? 'لا توجد نتائج' : 'No results'}</p>
                  </div>
                )}
                <AnimatePresence>
                  {filtered.map((comp, i) => (
                    <motion.div key={comp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.02 }}>
                      <div
                        onClick={() => toggleSelect(comp.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${comp.isSelected ? `${isDark ? 'bg-indigo-500/15 border-indigo-500/40' : 'bg-indigo-50 border-indigo-200'}` : `${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/8' : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100'}`}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 relative"
                          style={{ backgroundColor: `${comp.color}20`, border: `1.5px solid ${comp.color}50` }}>
                          {comp.icon}
                          {comp.isUserAdded && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">✎</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold truncate ${tp}`}>{isRTL ? comp.nameAr : comp.name}</p>
                            {!comp.isUserAdded && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0">{isRTL ? 'حقيقي' : 'Real'}</span>}
                            {comp.isUserAdded && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex-shrink-0">{isRTL ? 'يدوي' : 'Manual'}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className={`text-xs ${ts}`}>{isRTL ? comp.typeAr : comp.type}</span>
                            <span className="flex items-center gap-1 text-xs text-yellow-400"><Star className="w-2.5 h-2.5 fill-yellow-400" />{comp.rating}</span>
                            <span className={`flex items-center gap-1 text-xs ${ts}`}><MapPin className="w-2.5 h-2.5" />{comp.distance} {isRTL ? 'كم' : 'km'}</span>
                            {comp.address && <span className={`text-xs ${ts} truncate max-w-32`}>{comp.address}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={e => { e.stopPropagation(); setExpandedId(expandedId === comp.id ? null : comp.id); }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}>
                            {expandedId === comp.id ? <ChevronUp className={`w-3.5 h-3.5 ${ts}`} /> : <ChevronDown className={`w-3.5 h-3.5 ${ts}`} />}
                          </button>
                          <button onClick={e => { e.stopPropagation(); removeCompetitor(comp.id); }}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${comp.isSelected ? 'bg-indigo-500 border-indigo-500' : isDark ? 'border-white/20' : 'border-slate-300'}`}>
                            {comp.isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedId === comp.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className={`mx-1 mb-1 px-4 py-3 rounded-b-xl border-x border-b ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                <div><p className={`${ts} mb-0.5`}>{isRTL ? 'الاسم' : 'Name'}</p><p className={`font-medium ${tp}`}>{comp.name}</p></div>
                                <div><p className={`${ts} mb-0.5`}>{isRTL ? 'النوع' : 'Type'}</p><p className={`font-medium ${tp}`}>{isRTL ? comp.typeAr : comp.type}</p></div>
                                <div><p className={`${ts} mb-0.5`}>{isRTL ? 'التقييم' : 'Rating'}</p><p className="font-medium text-yellow-400">⭐ {comp.rating}/5</p></div>
                                <div><p className={`${ts} mb-0.5`}>{isRTL ? 'المسافة' : 'Distance'}</p><p className={`font-medium ${tp}`}>{comp.distance} {isRTL ? 'كم' : 'km'}</p></div>
                                {comp.address && <div className="col-span-2"><p className={`${ts} mb-0.5`}>{isRTL ? 'العنوان' : 'Address'}</p><p className={`font-medium ${tp}`}>{comp.address}</p></div>}
                                {comp.phone && <div><p className={`${ts} mb-0.5`}>{isRTL ? 'الهاتف' : 'Phone'}</p><p className={`font-medium ${tp}`}>{comp.phone}</p></div>}
                                {comp.website && <div className="col-span-full"><p className={`${ts} mb-0.5`}>{isRTL ? 'الموقع' : 'Website'}</p><a href={comp.website} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-400 hover:underline truncate block">{comp.website}</a></div>}
                                {comp.osmId && <div><p className={`${ts} mb-0.5`}>OSM ID</p><p className={`font-medium ${tp} text-[10px]`}>{comp.osmId}</p></div>}
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => toggleSelect(comp.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${comp.isSelected ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>
                                  {comp.isSelected ? (isRTL ? '✕ إلغاء التحديد' : '✕ Deselect') : (isRTL ? '✓ تحديد للتحليل' : '✓ Select for Analysis')}
                                </button>
                                <button onClick={() => removeCompetitor(comp.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/15 hover:bg-red-500/25 transition-colors">
                                  {isRTL ? 'إزالة' : 'Remove'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className={`p-3 border-t border-white/5 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'} rounded-b-2xl`}>
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className={ts}>{isRTL ? `الكل: ${competitors.length}` : `Total: ${competitors.length}`}</span>
                    <span className="text-indigo-300">{isRTL ? `محدد: ${selectedCount}` : `Selected: ${selectedCount}`}</span>
                    <span className="text-blue-300">{isRTL ? `حقيقي: ${competitors.filter(c => !c.isUserAdded).length}` : `Real OSM: ${competitors.filter(c => !c.isUserAdded).length}`}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${ts}`}>
                    <Info className="w-3 h-3" />
                    <span>{isRTL ? 'البيانات من OpenStreetMap' : 'Data from OpenStreetMap'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIP: select competitors */}
            {selectedCount === 0 && competitors.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${isDark ? 'text-blue-300/80' : 'text-blue-600'}`}>
                  {isRTL
                    ? 'هذه أعمال تجارية حقيقية موجودة بالفعل بالقرب من موقعك. حدّد المنافسين الذين تعتبرهم منافسين مباشرين لمشروعك لتفعيل تحليل المنافسة.'
                    : 'These are real businesses already operating near your location. Select the ones you consider direct competitors to activate the competition analysis.'}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
