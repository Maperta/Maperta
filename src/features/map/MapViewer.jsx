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

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_STYLE);

  // 初始化地图
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLES[DEFAULT_STYLE].url,
      center: [SZ_CENTER.lng, SZ_CENTER.lat],
      zoom: 14.5,
      pitch: 60,
      bearing: 20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setupBuildings(map);
    });

    // 切换风格后重新添加建筑图层
    map.on('styledata', (e) => {
      if (e.dataType === 'style' && map.isStyleLoaded()) {
        setupBuildings(map);
      }
    });

    // 点击建筑
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-openfreemap', 'buildings-overpass-fill'],
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
        layers: ['buildings-openfreemap', 'buildings-overpass-fill'],
      });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 切换地图风格
  const handleStyleChange = useCallback((key) => {
    if (key === currentStyle) return;
    setCurrentStyle(key);
    mapRef.current?.setStyle(STYLES[key].url);
  }, [currentStyle]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      <StyleSwitcher current={currentStyle} onSelect={handleStyleChange} />
    </div>
  );
}

// 风格切换按钮
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

// 获取 feature 中心坐标
function getFeatureCenter(feat) {
  const geom = feat.geometry;
  if (geom?.type === 'Point') {
    return geom.coordinates;
  }
  if (geom?.type === 'Polygon' && geom.coordinates?.[0]) {
    const ring = geom.coordinates[0];
    const lng = ring.reduce((a, c) => a + c[0], 0) / ring.length;
    const lat = ring.reduce((a, c) => a + c[1], 0) / ring.length;
    return [lng, lat];
  }
  return [SZ_CENTER.lng, SZ_CENTER.lat];
}

// 添加 OpenFreeMap 3D 建筑图层 + Overpass 补充
function setupBuildings(map) {
  // OpenFreeMap 矢量瓦片 → 3D 建筑
  if (!map.getSource('openfreemap')) {
    map.addSource('openfreemap', {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    });
    map.addLayer({
      id: 'buildings-openfreemap',
      type: 'fill-extrusion',
      source: 'openfreemap',
      'source-layer': 'building',
      filter: ['!=', ['get', 'hide_3d'], true],
      paint: {
        'fill-extrusion-color': '#d8d8d8',
        'fill-extrusion-height': ['get', 'render_height'],
        'fill-extrusion-base': ['get', 'render_min_height'],
        'fill-extrusion-opacity': 0.85,
      },
      minzoom: 14,
    });
    console.log('[Maperta] OpenFreeMap 3D 建筑图层已添加');
  }

  // Overpass 补充数据
  loadOverpassBuildings(map);
}

// 后台异步加载 Overpass 建筑数据
async function loadOverpassBuildings(map) {
  if (map.getSource('buildings-overpass')) return;

  try {
    console.log('[Maperta] Overpass 后台加载中...');
    const data = await fetchShenzhenBuildings();
    if (!data || !data.features?.length) return;

    console.log(`[Maperta] Overpass 返回 ${data.features.length} 栋建筑`);

    if (!map.getSource('buildings-overpass')) {
      map.addSource('buildings-overpass', { type: 'geojson', data });
      map.addLayer({
        id: 'buildings-overpass-fill',
        type: 'fill-extrusion',
        source: 'buildings-overpass',
        paint: {
          'fill-extrusion-color': '#ccc',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.7,
        },
        minzoom: 14,
      });
    }
  } catch (err) {
    console.warn('[Maperta] Overpass 加载失败:', err.message);
  }
}
