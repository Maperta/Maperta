import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchShenzhenBuildings } from './overpass';

const SZ_CENTER = { lng: 114.07, lat: 22.55 };

const STYLES = {
  positron: {
    label: '浅色',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  voyager: {
    label: '标准',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  },
  dark: {
    label: '暗色',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
};

const DEFAULT_STYLE = 'positron';

// Overture Maps PMTiles 建筑数据源
const OVERTURE_TILES =
  'pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2025-07-23/buildings.pmtiles';

// GeoJSON 建筑高度（zoom 10-12，全市视角）
const GEOJSON_HEIGHT = [
  'interpolate', ['linear'], ['zoom'],
  10, ['*', ['get', 'h'], 0.3],
  11, ['*', ['get', 'h'], 0.5],
  12, ['*', ['get', 'h'], 0.8],
];

// Overture 瓦片建筑高度（zoom 13+）
const TILE_HEIGHT = [
  'interpolate', ['linear'], ['zoom'],
  13, ['*', ['coalesce', ['get', 'height'], ['*', ['get', 'num_floors'], 3], 10], 0.4],
  14, ['*', ['coalesce', ['get', 'height'], ['*', ['get', 'num_floors'], 3], 10], 0.7],
  15, ['coalesce', ['get', 'height'], ['*', ['get', 'num_floors'], 3], 10],
];

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const tileRiseTimer = useRef(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_STYLE);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLES[DEFAULT_STYLE].url,
      center: [SZ_CENTER.lng, SZ_CENTER.lat],
      zoom: 11,
      pitch: 50,
      bearing: 20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => addAllLayers(map, tileRiseTimer));

    map.on('styledata', (e) => {
      if (e.dataType === 'style' && map.isStyleLoaded()) {
        addAllLayers(map, tileRiseTimer);
      }
    });

    // 点击建筑
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-geojson', 'buildings-overture', 'buildings-overpass'],
      });
      if (!features.length) return;

      const feat = features[0];
      const props = feat.properties || {};
      const coords = getFeatureCenter(feat);

      let height = 10;
      if (props.height) {
        height = Math.round(props.height);
      } else if (props.h) {
        height = Math.round(props.h);
      } else if (props.num_floors) {
        height = props.num_floors * 3;
      }

      onBuildingClick?.({
        id: props.id || `${coords[0]},${coords[1]}`,
        name: props.name || props.n || props.name_zh || '未知建筑',
        yearBuilt: props.yearBuilt || null,
        height,
        floors: props.num_floors || props.floors || null,
        type: props.subtype || props.class || props.building || '',
        description: props.description || '',
        district: props.district || '',
        lng: coords[0],
        lat: coords[1],
      });
    });

    // 鼠标指针
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-geojson', 'buildings-overture', 'buildings-overpass'],
      });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

    mapRef.current = map;

    return () => {
      clearTimeout(tileRiseTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleStyleChange = useCallback((key) => {
    if (key === currentStyle) return;
    setCurrentStyle(key);
    clearTimeout(tileRiseTimer.current);
    mapRef.current?.setStyle(STYLES[key].url);
  }, [currentStyle]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      <StyleSwitcher current={currentStyle} onSelect={handleStyleChange} />
    </div>
  );
}

function StyleSwitcher({ current, onSelect }) {
  return (
    <div className="absolute top-3 right-3 z-10 flex gap-1">
      {Object.entries(STYLES).map(([key, style]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={
            'px-3 py-1.5 text-xs rounded border cursor-pointer transition-colors ' +
            (current === key
              ? 'bg-[#e94560] text-white border-[#e94560]'
              : 'bg-[#0a0a1a]/80 text-gray-300 border-white/20 hover:bg-[#0a0a1a] hover:text-white')
          }
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}

function getFeatureCenter(feat) {
  const geom = feat.geometry;
  if (geom?.type === 'Point') return geom.coordinates;
  if (geom?.type === 'Polygon' && geom.coordinates?.[0]) {
    const ring = geom.coordinates[0];
    const lng = ring.reduce((a, c) => a + c[0], 0) / ring.length;
    const lat = ring.reduce((a, c) => a + c[1], 0) / ring.length;
    return [lng, lat];
  }
  return [SZ_CENTER.lng, SZ_CENTER.lat];
}

// ═══════════════════════════════════════════
// 添加所有建筑图层
// ═══════════════════════════════════════════
function addAllLayers(map, tileRiseTimer) {
  addGeoJSONLayer(map);            // 静态数据 — zoom 10-12 全市视角
  addOvertureLayer(map, tileRiseTimer); // Overture Maps — zoom 13+ 细节建筑
  addOverpassLayer(map);           // Overpass 补充 — zoom 13+
}

// 图层1：静态GeoJSON（zoom 10-12.5，全市建筑一览）
function addGeoJSONLayer(map) {
  if (map.getSource('sz-buildings')) return;

  map.addSource('sz-buildings', {
    type: 'geojson',
    data: '/data/sz-buildings.json',
  });

  map.addLayer({
    id: 'buildings-geojson',
    type: 'fill-extrusion',
    source: 'sz-buildings',
    paint: {
      'fill-extrusion-color': '#d8d8d8',
      'fill-extrusion-height': GEOJSON_HEIGHT,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': [
        'interpolate', ['linear'], ['zoom'],
        10, 0.4,
        11, 0.55,
        12, 0.7,
      ],
    },
    minzoom: 10,
    maxzoom: 13,
  });

  console.log('[Maperta] 静态全市建筑图层已添加 (zoom 10-12)');
}

// 图层2：Overture Maps PMTiles（zoom 13+，带高度数据的建筑）
function addOvertureLayer(map, tileRiseTimer) {
  if (map.getSource('overture-buildings')) return;

  map.addSource('overture-buildings', {
    type: 'vector',
    url: OVERTURE_TILES,
  });

  map.addLayer({
    id: 'buildings-overture',
    type: 'fill-extrusion',
    source: 'overture-buildings',
    'source-layer': 'building',
    paint: {
      'fill-extrusion-color': '#d5d5d5',
      'fill-extrusion-height': 0,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': [
        'interpolate', ['linear'], ['zoom'],
        13, 0.5,
        14, 0.7,
        15, 0.85,
      ],
    },
    minzoom: 13,
  });

  // 升起动画
  map.setPaintProperty('buildings-overture', 'fill-extrusion-height-transition', { duration: 2000 });

  clearTimeout(tileRiseTimer.current);
  tileRiseTimer.current = setTimeout(() => {
    if (map.getLayer('buildings-overture')) {
      map.setPaintProperty('buildings-overture', 'fill-extrusion-height', TILE_HEIGHT);
      console.log('[Maperta] Overture 建筑升起动画触发');
    }
  }, 800);
}

// 图层3：Overpass 补充数据（zoom 13+）
function addOverpassLayer(map) {
  if (map.getSource('buildings-overpass')) return;

  map.addSource('buildings-overpass', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: 'buildings-overpass',
    type: 'fill-extrusion',
    source: 'buildings-overpass',
    paint: {
      'fill-extrusion-color': '#cfcfcf',
      'fill-extrusion-height': 0,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0,
    },
    minzoom: 13,
  });

  map.setPaintProperty('buildings-overpass', 'fill-extrusion-height-transition', { duration: 2000 });

  loadOverpassData(map);
}

async function loadOverpassData(map) {
  try {
    const data = await fetchShenzhenBuildings();
    if (!data?.features?.length) return;

    console.log(`[Maperta] Overpass 返回 ${data.features.length} 栋建筑`);
    const src = map.getSource('buildings-overpass');
    if (src) src.setData(data);

    setTimeout(() => {
      if (map.getLayer('buildings-overpass')) {
        map.setPaintProperty('buildings-overpass', 'fill-extrusion-height', ['get', 'height']);
        map.setPaintProperty('buildings-overpass', 'fill-extrusion-opacity', 0.7);
      }
    }, 300);
  } catch (err) {
    console.warn('[Maperta] Overpass 加载失败:', err.message);
  }
}
