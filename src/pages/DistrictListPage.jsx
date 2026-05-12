import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function DistrictListPage() {
  const { t } = useI18n();
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    fetch('/data/districts.json')
      .then((r) => r.json())
      .then(setDistricts)
      .catch(console.error);
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white m-0">{t('district_title')}</h1>
          <p className="text-gray-400 text-lg mt-3">{t('district_subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {districts.map((d) => (
            <Link
              key={d.slug}
              to={`/districts/${d.slug}`}
              className="block bg-[#1a1a2e] border border-white/10 rounded-xl p-6 no-underline hover:border-white/20 transition-all hover:translate-y-[-2px]"
            >
              <h3 className="text-white font-bold text-lg mb-2">{d.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                {d.description}
              </p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{t('district_established')} {d.established}</span>
                <span>{t('district_area')} {d.area}km²</span>
                <span>{t('district_population')} {d.population}万</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
