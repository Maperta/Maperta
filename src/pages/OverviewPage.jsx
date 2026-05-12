import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function OverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/pages.json')
      .then((r) => r.json())
      .then((pages) => {
        setData(pages.find((p) => p.slug === 'overview') || null);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white m-0">{data.title}</h1>
          <p className="text-gray-400 text-lg mt-3">{data.subtitle}</p>
        </div>
      </div>

      {/* 关键数据 */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="建市时间" value="1979年" />
          <StatCard label="人口" value="1700万+" />
          <StatCard label="面积" value="1997km²" />
          <StatCard label="GDP" value="3.6万亿+" />
        </div>

        {/* 正文内容 */}
        {data.sections?.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}

        {/* 快捷导航 */}
        <div className="border-t border-white/10 pt-8 mt-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">了解更多</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/shenzhen/economy"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">💰</span>
              <h4 className="text-white font-bold mt-2 mb-1">经济发展</h4>
              <p className="text-gray-500 text-sm">了解深圳经济增长的奇迹</p>
            </Link>
            <Link
              to="/shenzhen/transportation"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">🚇</span>
              <h4 className="text-white font-bold mt-2 mb-1">交通系统</h4>
              <p className="text-gray-500 text-sm">深圳交通的跨越式发展</p>
            </Link>
            <Link
              to="/shenzhen/culture"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">📚</span>
              <h4 className="text-white font-bold mt-2 mb-1">文化教育</h4>
              <p className="text-gray-500 text-sm">从文化沙漠到阅读之城</p>
            </Link>
            <Link
              to="/districts"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">🏙️</span>
              <h4 className="text-white font-bold mt-2 mb-1">各区历史</h4>
              <p className="text-gray-500 text-sm">探索深圳每个区的故事</p>
            </Link>
          </div>
        </div>
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
