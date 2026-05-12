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

// 建筑高度随 zoom 渐变：远看低矮，近看真实高度
const HEIGHT_PAINT = [
  'interpolate', ['linear'], ['zoom'],
  13, ['*', ['get', 'render_height'], 0.4],
  14, ['*', ['get', 'render_height'], 0.7],
  15, ['get', 'render_height'],
];

// 透明度随 zoom 渐变：远看更透，近看清晰
const OPACITY_PAINT = [
  'interpolate', ['linear'], ['zoom'],
  13, 0.55,
  14, 0.75,
  15, 0.85,
];

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animTimer = useRef(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_STYLE);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLES[DEFAULT_STYLE].url,
      center: [SZ_CENTER.lng, SZ_CENTER.lat],
      zoom: 14,
      pitch: 60,
      bearing: 20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    // 初始加载
    map.on('load', () => addBuildingLayers(map, animTimer));

    // 切换风格后重新添加
    map.on('styledata', (e) => {
      if (e.dataType === 'style' && map.isStyleLoaded()) {
        addBuildingLayers(map, animTimer);
      }
    });

    // 点击建筑
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-openfreemap', 'buildings-overpass'],
      });
      if (!features.length) return;

      const feat = features[0];
      const props = feat.properties || {};
      const coords = getFeatureCenter(feat);

      let height = 10;
      if (props.render_height) {
        height = Math.round(props.render_height);
      } else if (props.height) {
        height = typeof props.height === 'number' ? Math.round(props.height) : 10;
      }

      onBuildingClick?.({
        id: props.id || `${coords[0]},${coords[1]}`,
        name: props.name || props.name_zh || props.name_en || '未知建筑',
        yearBuilt: props.yearBuilt || null,
        height,
        floors: props.floors || null,
        type: props.type || props.building || '',
        description: props.description || '',
        district: props.district || '',
        lng: coords[0],
        lat: coords[1],
      });
    });

    // 鼠标指针
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-openfreemap', 'buildings-overpass'],
      });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

    mapRef.current = map;

    return () => {
      clearTimeout(animTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleStyleChange = useCallback((key) => {
    if (key === currentStyle) return;
    setCurrentStyle(key);
    clearTimeout(animTimer.current);
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
function addBuildingLayers(map, animTimer) {
  addOpenFreeMapLayer(map, animTimer);
  addOverpassLayer(map);
}

// OpenFreeMap 矢量瓦片 → 3D 建筑（主数据源）
function addOpenFreeMapLayer(map, animTimer) {
  if (map.getSource('openfreemap')) return;

  map.addSource('openfreemap', {
    type: 'vector',
    url: 'https://tiles.openfreemap.org/planet',
  });

  // 先用高度 0 添加，再用动画升起
  map.addLayer({
    id: 'buildings-openfreemap',
    type: 'fill-extrusion',
    source: 'openfreemap',
    'source-layer': 'building',
    filter: ['!=', ['get', 'hide_3d'], true],
    paint: {
      'fill-extrusion-color': '#d5d5d5',
      'fill-extrusion-height': 0,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': OPACITY_PAINT,
    },
    minzoom: 13,
  });

  // 设置 2 秒过渡动画
  map.setPaintProperty('buildings-openfreemap', 'fill-extrusion-height-transition', {
    duration: 2000,
  });

  // 简单延迟触发升起（等首批瓦片到达）
  clearTimeout(animTimer.current);
  animTimer.current = setTimeout(() => {
    if (map.getLayer('buildings-openfreemap')) {
      map.setPaintProperty('buildings-openfreemap', 'fill-extrusion-height', HEIGHT_PAINT);
      console.log('[Maperta] 建筑升起动画触发');
    }
  }, 600);
}

// Overpass 补充建筑数据
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
      'fill-extrusion-color': '#ccc',
      'fill-extrusion-height': 0,
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0,
    },
    minzoom: 13,
  });

  map.setPaintProperty('buildings-overpass', 'fill-extrusion-height-transition', {
    duration: 2000,
  });

  // 后台异步加载
  loadOverpassData(map);
}

async function loadOverpassData(map) {
  try {
    console.log('[Maperta] Overpass 后台加载中...');
    const data = await fetchShenzhenBuildings();
    if (!data?.features?.length) {
      console.log('[Maperta] Overpass 无数据返回');
      return;
    }

    console.log(`[Maperta] Overpass 返回 ${data.features.length} 栋建筑`);

    const src = map.getSource('buildings-overpass');
    if (src) src.setData(data);

    // 升起动画
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
