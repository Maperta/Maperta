import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/buildings-present.json')
      .then((r) => r.json())
      .then((data) => {
        const found = data.features.find((f) => f.id === Number(id));
        setBuilding(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (!building) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <p className="text-xl">建筑未找到</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#e94560] text-white rounded-lg cursor-pointer border-none"
        >
          返回地图
        </button>
      </div>
    );
  }

  const p = building.properties;

  return (
    <div className="h-full overflow-y-auto">
      {/* 顶部横幅 */}
      <div className="relative h-48 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] flex items-end px-8 pb-6">
        <div>
          <Link to="/" className="text-gray-500 text-sm no-underline hover:text-gray-300">
            ← 返回地图
          </Link>
          <h1 className="text-3xl font-bold text-white m-0 mt-2">{p.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
              {p.type}
            </span>
            <span className="text-sm text-gray-500">{p.district}</span>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* 基本信息卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <InfoCard label="高度" value={`${p.height}米`} />
          <InfoCard label="层数" value={`${p.floors}层`} />
          <InfoCard label="建成时间" value={`${p.yearBuilt}年`} />
          <InfoCard label="所在区域" value={p.district} />
        </div>

        {/* 详细介绍 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">建筑简介</h2>
          <p className="text-gray-300 leading-relaxed">{p.description}</p>
        </section>

        {/* 历史时间线 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">建筑历史</h2>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6">
            <div className="space-y-4">
              <TimelineItem
                period="1980年代"
                status={p.yearBuilt <= 1989 ? '存在' : '不存在'}
                active={p.yearBuilt <= 1989}
              />
              <TimelineItem
                period="1990年代"
                status={p.yearBuilt <= 1999 ? '存在' : '不存在'}
                active={p.yearBuilt <= 1999}
              />
              <TimelineItem
                period="2000年代"
                status={p.yearBuilt <= 2009 ? '存在' : '不存在'}
                active={p.yearBuilt <= 2009}
              />
              <TimelineItem period="现在" status="存在" active={true} />
            </div>
          </div>
        </section>

        {/* 在地图上查看 */}
        <div className="text-center pb-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#e94560] text-white rounded-xl font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
          >
            在3D地图上查看 →
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 text-center">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
}

function TimelineItem({ period, status, active }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 text-sm text-gray-400">{period}</div>
      <div
        className={`w-3 h-3 rounded-full ${
          active ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-600'
        }`}
      />
      <div className={`text-sm ${active ? 'text-gray-200' : 'text-gray-600'}`}>
        {status}
      </div>
    </div>
  );
}
