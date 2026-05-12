import useStore from '../../lib/store';

const periods = [
  { id: '1980s', label: '八十年代', range: '1980-1989' },
  { id: '1990s', label: '九十年代', range: '1990-1999' },
  { id: '2000s', label: '零零年代', range: '2000-2009' },
  { id: 'present', label: '现在', range: '2010-至今' },
];

export default function TimelineControl() {
  const currentPeriod = useStore((s) => s.currentPeriod);
  const setPeriod = useStore((s) => s.setPeriod);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-[#0a0a1a]/90 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 flex items-center gap-1 shadow-2xl">
        {/* 标签 */}
        <span className="text-gray-400 text-xs mr-2 font-medium tracking-wide">
          时间轴
        </span>

        {/* 时期按钮 */}
        {periods.map((p, i) => (
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

        {/* 当前时期指示器 */}
        <div className="ml-3 pl-3 border-l border-white/10">
          <span className="text-xs text-gray-500">
            {periods.find((p) => p.id === currentPeriod)?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
