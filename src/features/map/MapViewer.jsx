import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useStore from '../../lib/store';
import { fetchShenzhenBuildings } from './overpass';

const SZ_CENTER = { lng: 114.07, lat: 22.55 };
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const VERSA_TILES = 'https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}.mvt';

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const currentPeriod = useStore((s) => s.currentPeriod);

  // 初始化地图
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [SZ_CENTER.lng, SZ_CENTER.lat],
      zoom: 12,
      pitch: 55,
      bearing: 20,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', async () => {
      // 1. 地形
      if (!map.getSource('terrain')) {
        map.addSource('terrain', {
          type: 'raster-dem',
          url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
          tileSize: 256,
        });
      }
      try {
        map.setTerrain({ source: 'terrain', exaggeration: 1.5 });
      } catch (e) {
        console.warn('地形不可用:', e.message);
      }

      // 2. VersaTiles 矢量瓦片 → OSM 建筑
      map.addSource('versatiles', {
        type: 'vector',
        tiles: [VERSA_TILES],
        minzoom: 0,
        maxzoom: 14,
      });

      // fill-extrusion 图层（OSM 建筑从瓦片挤出）
      map.addLayer({
        id: 'buildings-tiles',
        type: 'fill-extrusion',
        source: 'versatiles',
        'source-layer': 'building',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-extrusion-color': '#d0d0d0',
          'fill-extrusion-height': [
            'case',
            ['has', 'height'],
            ['coalesce', ['to-number', ['get', 'height']], 10],
            ['has', 'building:levels'],
            ['*', ['to-number', ['get', 'building:levels']], 3],
            8,
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.8,
        },
        minzoom: 12,
      });

      // 3. 加载时间轴补充数据（不阻塞，立即执行）
      loadPeriodBuildings(map, currentPeriod);

      // 4. Overpass 补充数据（异步后台加载，不阻塞地图）
      loadOverpassBuildings(map);
    });

    // 点击建筑（两个图层都检测）
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-tiles', 'buildings-overpass-fill', 'buildings-period'],
      });
      if (!features.length) return;

      const feat = features[0];
      const props = feat.properties || {};
      const coords = getFeatureCenter(feat);

      onBuildingClick?.({
        id: props.id || `${coords[0]},${coords[1]}`,
        name: props.name || '未知建筑',
        yearBuilt: props.yearBuilt || null,
        height: props.height || Math.round((feat.properties?.['fill-extrusion-height'] || 10) / 4),
        floors: props.floors || null,
        type: props.type || props.buildingType || '',
        description: props.description || '',
        district: props.district || '',
        lng: coords[0],
        lat: coords[1],
      });
    });

    // 鼠标指针
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-tiles', 'buildings-overpass-fill', 'buildings-period'],
      });
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

// 后台异步加载 Overpass 建筑数据（不阻塞地图）
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
        minzoom: 12,
      });
    }
  } catch (err) {
    console.warn('[Maperta] Overpass 加载失败:', err.message);
  }
}

// 加载时期对应的 GeoJSON 补充数据
async function loadPeriodBuildings(map, period) {
  // 清理旧时期数据层
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
