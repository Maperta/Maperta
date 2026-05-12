import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function OverviewPage() {
  const { t, lang } = useI18n();
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
        {t('bldg_loading')}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white m-0">{t('overview_title')}</h1>
          <p className="text-gray-400 text-lg mt-3">{t('overview_subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label={t('overview_established')} value="1979" />
          <StatCard label={t('overview_population')} value="1700万+" />
          <StatCard label={t('overview_area')} value="1997km²" />
          <StatCard label="GDP" value="3.6万亿+" />
        </div>

        {data.sections?.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}

        <div className="border-t border-white/10 pt-8 mt-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">{t('overview_more')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/shenzhen/economy"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">💰</span>
              <h4 className="text-white font-bold mt-2 mb-1">{lang === 'zh' ? '经济发展' : 'Economy'}</h4>
              <p className="text-gray-500 text-sm">{lang === 'zh' ? '了解深圳经济增长的奇迹' : 'The miracle of economic growth'}</p>
            </Link>
            <Link
              to="/shenzhen/transportation"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">🚇</span>
              <h4 className="text-white font-bold mt-2 mb-1">{lang === 'zh' ? '交通系统' : 'Transportation'}</h4>
              <p className="text-gray-500 text-sm">{lang === 'zh' ? '深圳交通的跨越式发展' : 'Leapfrog development of transit'}</p>
            </Link>
            <Link
              to="/shenzhen/culture"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">📚</span>
              <h4 className="text-white font-bold mt-2 mb-1">{lang === 'zh' ? '文化教育' : 'Culture & Education'}</h4>
              <p className="text-gray-500 text-sm">{lang === 'zh' ? '从文化沙漠到阅读之城' : 'From cultural desert to city of readers'}</p>
            </Link>
            <Link
              to="/districts"
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-4 no-underline hover:border-white/20 transition-colors"
            >
              <span className="text-lg">🏙️</span>
              <h4 className="text-white font-bold mt-2 mb-1">{t('nav_districts')}</h4>
              <p className="text-gray-500 text-sm">{lang === 'zh' ? '探索深圳每个区的故事' : 'Explore the story of each district'}</p>
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
