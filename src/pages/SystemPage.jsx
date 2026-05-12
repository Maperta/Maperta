import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

export default function SystemPage() {
  const { system } = useParams();
  const { t } = useI18n();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/pages.json')
      .then((r) => r.json())
      .then((pages) => {
        setData(pages.find((p) => p.slug === system) || null);
      })
      .catch(console.error);
  }, [system]);

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <p className="text-xl">{t('system_not_found')}</p>
        <Link to="/shenzhen/overview" className="text-[#e94560] no-underline hover:underline">
          {t('system_back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/shenzhen/overview" className="text-gray-500 text-sm no-underline hover:text-gray-300">
            {t('overview_back')}
          </Link>
          <h1 className="text-4xl font-bold text-white m-0 mt-2">{data.title}</h1>
          <p className="text-gray-400 text-lg mt-3">{data.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {data.sections?.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
