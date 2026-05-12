import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useStore from '../../lib/store';

const SZ_CENTER = { lng: 114.07, lat: 22.55 };
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export default function MapViewer({ onBuildingClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const currentPeriod = useStore((s) => s.currentPeriod);

  // 初始化地图（只执行一次）
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

    map.on('load', () => {
      // 第一步：添加地形源（必须在 setTerrain 之前）
      if (!map.getSource('terrain')) {
        map.addSource('terrain', {
          type: 'raster-dem',
          url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
          tileSize: 256,
        });
      }

      // 第二步：设置地形（有 source 之后才安全）
      try {
        map.setTerrain({ source: 'terrain', exaggeration: 1.5 });
      } catch (e) {
        console.warn('地形加载失败，使用平面地图:', e.message);
      }

      // 第三步：加载建筑数据
      loadBuildingLayer(map, currentPeriod);
    });

    // ★ 修复点击：用全局 click 事件，不用 layer ID 过滤
    // 这样切换时期重建 layer 后，点击依然有效
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-fill'],
      });
      if (!features.length) return;

      const feature = features[0];
      const props = feature.properties;
      const coords = feature.geometry?.coordinates?.[0]?.[0];

      if (onBuildingClick && props.id) {
        onBuildingClick({
          id: props.id,
          name: props.name,
          yearBuilt: props.yearBuilt,
          height: props.height,
          floors: props.floors,
          type: props.type,
          description: props.description,
          district: props.district,
          lng: coords[0],
          lat: coords[1],
        });
      }
    });

    // 鼠标指针
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['buildings-fill'],
      });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 时期切换 → 重新加载建筑数据
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;
    loadBuildingLayer(map, currentPeriod);
  }, [currentPeriod]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

// 加载/更新建筑图层
async function loadBuildingLayer(map, period) {
  try {
    const resp = await fetch(`/data/buildings-${period}.json`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    // 清理旧图层（buildings-fill + buildings-line 是一起创建的，一起清理）
    if (map.getLayer('buildings-line')) map.removeLayer('buildings-line');
    if (map.getLayer('buildings-fill')) map.removeLayer('buildings-fill');
    if (map.getSource('buildings')) map.removeSource('buildings');

    // 添加数据源
    map.addSource('buildings', { type: 'geojson', data });

    // ★ 3D 建筑填充层
    map.addLayer({
      id: 'buildings-fill',
      type: 'fill-extrusion',
      source: 'buildings',
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['get', 'isLandmark'], false],
          '#e94560',
          ['match', ['get', 'type'],
            '商业', '#4A90D9',
            '住宅', '#7EC8E3',
            '工业', '#95A5A6',
            '政府', '#F39C12',
            '文化', '#9B59B6',
            '交通', '#E67E22',
            '#BDC3C7',
          ],
        ],
        // ★ 高度：实际米数 × 3 让建筑更明显
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

    // ★ 建筑顶部边框线（增加立体感）
    map.addLayer({
      id: 'buildings-line',
      type: 'line',
      source: 'buildings',
      paint: {
        'line-color': 'rgba(255,255,255,0.15)',
        'line-width': 1,
      },
    });

    console.log(`[Maperta] 加载 ${period} 建筑: ${data.features?.length || 0} 栋`);
  } catch (err) {
    console.error('[Maperta] 加载建筑失败:', err);
  }
}
