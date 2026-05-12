import { useI18n } from '../../lib/i18n';

export default function BuildingInfoCard({ building, onClose, onViewDetail }) {
  const { t } = useI18n();
  if (!building) return null;

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-[#0a0a1a]/95 backdrop-blur-md border border-white/15 rounded-xl p-5 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
      >
        ✕
      </button>

      <h3 className="text-lg font-bold text-white m-0 mb-1 pr-6">
        {building.name}
      </h3>

      {building.type && (
        <span className="inline-block text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full mb-3">
          {building.type}
        </span>
      )}

      <div className="space-y-1.5 mb-4">
        {building.yearBuilt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('bldg_year_built')}</span>
            <span className="text-gray-200">{building.yearBuilt}{t('home_range_present').startsWith('2010') ? '' : ''}</span>
          </div>
        )}
        {building.height && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('bldg_height')}</span>
            <span className="text-gray-200">{building.height}{t('bldg_meters')}</span>
          </div>
        )}
        {building.floors && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('bldg_floors')}</span>
            <span className="text-gray-200">{building.floors}{t('bldg_floors_unit')}</span>
          </div>
        )}
        {building.district && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('bldg_district')}</span>
            <span className="text-gray-200">{building.district}</span>
          </div>
        )}
      </div>

      {building.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {building.description}
        </p>
      )}

      <button
        onClick={onViewDetail}
        className="w-full py-2 bg-[#e94560] text-white rounded-lg text-sm font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
      >
        {t('home_building_detail')}
      </button>
    </div>
  );
}
