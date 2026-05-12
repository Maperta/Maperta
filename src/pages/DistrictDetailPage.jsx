import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function DistrictDetailPage() {
  const { slug } = useParams();
  const [district, setDistrict] = useState(null);
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    fetch('/data/districts.json')
      .then((r) => r.json())
      .then((data) => {
        setDistrict(data.find((d) => d.slug === slug) || null);
      })
      .catch(console.error);

    fetch('/data/buildings-present.json')
      .then((r) => r.json())
      .then((data) => {
        if (data?.features) {
          const result = data.features.filter((f) =>
            f.properties?.district?.includes(
              slug === 'nanshan' ? '南山' : slug === 'futian' ? '福田' : slug === 'luohu' ? '罗湖' : slug === 'baoan' ? '宝安' : slug === 'longgang' ? '龙岗' : ''
            )
          );
          setBuildings(result.map((f) => ({ id: f.id, ...f.properties })));
        }
      })
      .catch(console.error);
  }, [slug]);

  if (!district) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/districts" className="text-gray-500 text-sm no-underline hover:text-gray-300">
            ← 返回各区列表
          </Link>
          <h1 className="text-4xl font-bold text-white m-0 mt-2">{district.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* 数据卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="设立时间" value={`${district.established}年`} />
          <StatCard label="面积" value={`${district.area}km²`} />
          <StatCard label="人口" value={`${district.population}万`} />
        </div>

        {/* 区域介绍 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">区域简介</h2>
          <p className="text-gray-300 leading-relaxed">{district.description}</p>
        </section>

        {/* 历史沿革 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">历史沿革</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {district.history}
          </p>
        </section>

        {/* 区内建筑 */}
        {buildings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              标志性建筑
            </h2>
            <div className="space-y-3">
              {buildings.map((b) => (
                <Link
                  key={b.id}
                  to={`/building/${b.id}`}
                  className="flex items-center gap-4 bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h4 className="text-white font-medium">{b.name}</h4>
                    <span className="text-gray-500 text-sm">
                      {b.yearBuilt}年建成 · {b.height}米 · {b.type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 text-center">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className="text-[#e94560] font-bold text-xl">{value}</div>
    </div>
  );
}
