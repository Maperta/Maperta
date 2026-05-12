// 深圳范围
const SZ_BBOX = { south: 22.45, west: 113.75, north: 22.7, east: 114.3 };

// Overpass API 查询深圳所有建筑，返回 GeoJSON FeatureCollection
export async function fetchShenzhenBuildings() {
  const query = `
    [out:json][timeout:30];
    (
      way["building"](${SZ_BBOX.south},${SZ_BBOX.west},${SZ_BBOX.north},${SZ_BBOX.east});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    if (!resp.ok) throw new Error(`Overpass HTTP ${resp.status}`);
    const data = await resp.json();
    return overpassToGeoJSON(data);
  } catch (err) {
    console.warn('[Overpass] 查询失败，跳过补充数据:', err.message);
    return null;
  }
}

// 将 Overpass JSON 转换为 GeoJSON FeatureCollection
function overpassToGeoJSON(data) {
  const nodes = {};
  const features = [];

  // 先收集所有节点坐标
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes[el.id] = [el.lon, el.lat];
    }
  }

  // 将 way 转为 Polygon feature
  for (const el of data.elements) {
    if (el.type !== 'way' || !el.tags?.building) continue;

    const coords = el.nodes.map((nid) => nodes[nid]).filter(Boolean);
    if (coords.length < 3) continue;

    // 确保多边形闭合
    if (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]) {
      coords.push(coords[0]);
    }

    // 提取高度
    let height = 10; // 默认10米
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
        coordinates: [coords],
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
