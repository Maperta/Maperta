const SZ_BBOX = { south: 22.45, west: 113.75, north: 22.7, east: 114.3 };

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export async function fetchShenzhenBuildings() {
  const query = `[out:json][timeout:60];
(
  way["building"](${SZ_BBOX.south},${SZ_BBOX.west},${SZ_BBOX.north},${SZ_BBOX.east});
);
out geom;`;

  // 尝试多个 Overpass 节点
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      return overpassToGeoJSON(data);
    } catch (err) {
      console.warn(`[Overpass] ${endpoint} 失败:`, err.message);
    }
  }

  console.warn('[Overpass] 所有节点查询失败，跳过补充数据');
  return null;
}

function overpassToGeoJSON(data) {
  const features = [];

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.tags?.building) continue;
    if (!el.geometry?.length || el.geometry.length < 3) continue;

    const coords = el.geometry.map((p) => [p.lon, p.lat]);

    // 确保多边形闭合
    if (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]) {
      coords.push([...coords[0]]);
    }

    // 简化坐标精度（减少数据量）
    const simplified = coords.map((c) => [
      Math.round(c[0] * 100000) / 100000,
      Math.round(c[1] * 100000) / 100000,
    ]);

    let height = 10;
    if (el.tags.height) {
      height = parseFloat(el.tags.height) || 10;
    } else if (el.tags['building:levels']) {
      height = parseInt(el.tags['building:levels']) * 3;
    }

    features.push({
      type: 'Feature',
      properties: {
        name: el.tags.name || el.tags['name:zh'] || el.tags['name:en'] || '',
        height,
        buildingType: el.tags.building || 'yes',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [simplified],
      },
    });
  }

  return { type: 'FeatureCollection', features };
}
