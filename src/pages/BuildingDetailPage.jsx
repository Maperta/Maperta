import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
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
        {t('bldg_loading')}
      </div>
    );
  }

  if (!building) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <p className="text-xl">{t('bldg_not_found')}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#e94560] text-white rounded-lg cursor-pointer border-none"
        >
          {t('bldg_back_to_map')}
        </button>
      </div>
    );
  }

  const p = building.properties;

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative h-48 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] flex items-end px-8 pb-6">
        <div>
          <Link to="/" className="text-gray-500 text-sm no-underline hover:text-gray-300">
            {t('bldg_back_to_map')}
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

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <InfoCard label={t('bldg_height')} value={`${p.height}${t('bldg_meters')}`} />
          <InfoCard label={t('bldg_floors')} value={`${p.floors}${t('bldg_floors_unit')}`} />
          <InfoCard label={t('bldg_year_built')} value={`${p.yearBuilt}`} />
          <InfoCard label={t('bldg_district')} value={p.district} />
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{t('bldg_intro')}</h2>
          <p className="text-gray-300 leading-relaxed">{p.description}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{t('bldg_history')}</h2>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6">
            <div className="space-y-4">
              <TimelineItem
                period={t('home_period_1980s')}
                status={p.yearBuilt <= 1989 ? t('bldg_status_exist') : t('bldg_status_not_exist')}
                active={p.yearBuilt <= 1989}
              />
              <TimelineItem
                period={t('home_period_1990s')}
                status={p.yearBuilt <= 1999 ? t('bldg_status_exist') : t('bldg_status_not_exist')}
                active={p.yearBuilt <= 1999}
              />
              <TimelineItem
                period={t('home_period_2000s')}
                status={p.yearBuilt <= 2009 ? t('bldg_status_exist') : t('bldg_status_not_exist')}
                active={p.yearBuilt <= 2009}
              />
              <TimelineItem period={t('home_period_present')} status={t('bldg_status_exist')} active={true} />
            </div>
          </div>
        </section>

        <div className="text-center pb-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#e94560] text-white rounded-xl font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
          >
            {t('bldg_view_on_map')}
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
