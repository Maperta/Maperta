import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useStore from '../../lib/store';
import { fetchShenzhenBuildings } from './overpass';

const SZ_CENTER = { lng: 114.07, lat: 22.55 };
// OpenFreeMap Liberty — 免费 OpenMapTiles schema，自带 3D 建筑（render_height/render_min_height）
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const buildingLayerIds = useRef([]);
  const currentPeriod = useStore((s) => s.currentPeriod);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [SZ_CENTER.lng, SZ_CENTER.lat],
      zoom: 14.5,
      pitch: 60,
      bearing: 20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      // 自动检测 Liberty 风格中的 fill-extrusion 建筑图层
      const style = map.getStyle();
      const extrusionIds = style.layers
        .filter((l) => l.type === 'fill-extrusion' && l.id.includes('building'))
        .map((l) => l.id);
      buildingLayerIds.current = extrusionIds;
      console.log('[Maperta] Liberty 3D建筑图层:', extrusionIds);

      // 加载时间轴补充数据
      loadPeriodBuildings(map, currentPeriod);

      // 后台加载 Overpass 补充数据
      loadOverpassBuildings(map);
    });

    // 点击建筑 — 查询 Liberty 建筑层 + 我们的补充层
    map.on('click', (e) => {
      const layers = [...buildingLayerIds.current, 'buildings-overpass-fill', 'buildings-period'];
      const features = map.queryRenderedFeatures(e.point, { layers });
      if (!features.length) return;

      const feat = features[0];
      const props = feat.properties || {};
      const coords = getFeatureCenter(feat);

      // Liberty 用 render_height（米），GeoJSON 用 height（像素需/4）
      let height = 10;
      if (props.render_height) {
        height = Math.round(props.render_height);
      } else if (props.height) {
        height = typeof props.height === 'number' ? Math.round(props.height / 4) : 10;
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
      const layers = [...buildingLayerIds.current, 'buildings-overpass-fill', 'buildings-period'];
      const features = map.queryRenderedFeatures(e.point, { layers });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 时期切换 → 更新补充数据
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;
    loadPeriodBuildings(mapRef.current, currentPeriod);
  }, [currentPeriod]);

  return <div ref={mapContainer} className="w-full h-full" />;
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

// 后台异步加载 Overpass 建筑数据
async function loadOverpassBuildings(map) {
  try {
    console.log('[Maperta] Overpass 后台加载中...');
    const data = await fetchShenzhenBuildings();
    if (!data || !data.features?.length) return;

    console.log(`[Maperta] Overpass 返回 ${data.features.length} 栋建筑`);

    if (map.getSource('buildings-overpass')) {
      map.getSource('buildings-overpass').setData(data);
    } else {
      map.addSource('buildings-overpass', { type: 'geojson', data });
      map.addLayer({
        id: 'buildings-overpass-fill',
        type: 'fill-extrusion',
        source: 'buildings-overpass',
        paint: {
          'fill-extrusion-color': '#c8c8c8',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.75,
        },
        minzoom: 14,
      });
    }
  } catch (err) {
    console.warn('[Maperta] Overpass 加载失败:', err.message);
  }
}

// 加载时期对应的 GeoJSON 补充数据
async function loadPeriodBuildings(map, period) {
  if (map.getLayer('buildings-period')) map.removeLayer('buildings-period');
  if (map.getSource('buildings-period')) map.removeSource('buildings-period');

  try {
    const resp = await fetch(`/data/buildings-${period}.json`);
    if (!resp.ok) return;
    const data = await resp.json();
    if (!data.features?.length) return;

    map.addSource('buildings-period', { type: 'geojson', data });

    map.addLayer({
      id: 'buildings-period',
      type: 'fill-extrusion',
      source: 'buildings-period',
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['get', 'isLandmark'], false], '#e94560',
          '#4A90D9',
        ],
        'fill-extrusion-height': [
          'case',
          ['has', 'height'],
          ['*', ['get', 'height'], 4],
          60,
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.9,
      },
    });

    console.log(`[Maperta] 时期 ${period} 补充: ${data.features.length} 栋`);
  } catch (err) {
    console.warn(`[Maperta] 时期数据加载失败: ${period}`, err.message);
  }
}
