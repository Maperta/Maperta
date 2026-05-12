import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useStore from '../../lib/store';

const SZ_CENTER = { lng: 114.07, lat: 22.55 };

// 免费底图 - CartoDB Positron，无需 API Key
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    map.on('load', () => {
      // 加载地形（使用免费地形源）
      map.setTerrain({ source: 'terrain', exaggeration: 1.5 });

      // 加载首批建筑数据
      loadBuildingData(map, currentPeriod);
    });

    // 建筑点击
    map.on('click', 'buildings', (e) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
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

    // 鼠标样式
    map.on('mouseenter', 'buildings', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'buildings', () => {
      map.getCanvas().style.cursor = '';
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 时期切换 → 更新建筑数据
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;
    loadBuildingData(map, currentPeriod);
  }, [currentPeriod]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
    />
  );
}

// 加载建筑 GeoJSON 数据到地图
async function loadBuildingData(map, period) {
  try {
    const resp = await fetch(`/data/buildings-${period}.json`);
    const data = await resp.json();

    // 移除旧图层和源
    if (map.getLayer('buildings')) {
      map.removeLayer('buildings');
    }
    if (map.getSource('buildings')) {
      map.removeSource('buildings');
    }

    // 添加地形源（仅在首次时添加）
    if (!map.getSource('terrain')) {
      map.addSource('terrain', {
        type: 'raster-dem',
        url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
        tileSize: 256,
      });
    }

    // 添加建筑源和图层
    map.addSource('buildings', {
      type: 'geojson',
      data,
    });

    map.addLayer({
      id: 'buildings',
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
            '#BDC3C7'
          ],
        ],
        'fill-extrusion-height': [
          'case',
          ['has', 'height'],
          ['*', ['get', 'height'], 3],
          50,
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.85,
        'fill-extrusion-vertical-gradient': true,
      },
    });

    // 添加建筑顶部描边（悬停高亮用）
    if (!map.getLayer('building-outline')) {
      map.addLayer({
        id: 'building-outline',
        type: 'line',
        source: 'buildings',
        paint: {
          'line-color': 'rgba(255,255,255,0.1)',
          'line-width': 0.5,
        },
      });
    }

    console.log(`加载 ${period} 时期建筑数据: ${data.features?.length || 0} 栋`);
  } catch (err) {
    console.error('加载建筑数据失败:', err);
  }
}
