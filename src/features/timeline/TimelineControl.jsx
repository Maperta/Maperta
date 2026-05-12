import useStore from '../../lib/store';
import { useI18n } from '../../lib/i18n';

export default function TimelineControl() {
  const currentPeriod = useStore((s) => s.currentPeriod);
  const setPeriod = useStore((s) => s.setPeriod);
  const { t } = useI18n();

  const periods = [
    { id: '1980s', label: t('home_period_1980s'), range: t('home_range_1980s') },
    { id: '1990s', label: t('home_period_1990s'), range: t('home_range_1990s') },
    { id: '2000s', label: t('home_period_2000s'), range: t('home_range_2000s') },
    { id: 'present', label: t('home_period_present'), range: t('home_range_present') },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-[#0a0a1a]/90 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 flex items-center gap-1 shadow-2xl">
        <span className="text-gray-400 text-xs mr-2 font-medium tracking-wide">
          {t('home_timeline')}
        </span>

        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border-none ' +
              (currentPeriod === p.id
                ? 'bg-[#e94560] text-white shadow-lg shadow-[#e94560]/30'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5')
            }
          >
            <div>{p.label}</div>
            <div className="text-[10px] opacity-60">{p.range}</div>
          </button>
        ))}

        <div className="ml-3 pl-3 border-l border-white/10">
          <span className="text-xs text-gray-500">
            {periods.find((p) => p.id === currentPeriod)?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
