export default function BuildingInfoCard({ building, onClose, onViewDetail }) {
  if (!building) return null;

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-[#0a0a1a]/95 backdrop-blur-md border border-white/15 rounded-xl p-5 shadow-2xl animate-in">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
      >
        ✕
      </button>

      {/* 建筑名称 */}
      <h3 className="text-lg font-bold text-white m-0 mb-1 pr-6">
        {building.name}
      </h3>

      {/* 类型标签 */}
      {building.type && (
        <span className="inline-block text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full mb-3">
          {building.type}
        </span>
      )}

      {/* 信息列表 */}
      <div className="space-y-1.5 mb-4">
        {building.yearBuilt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">建成时间</span>
            <span className="text-gray-200">{building.yearBuilt}年</span>
          </div>
        )}
        {building.height && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">高度</span>
            <span className="text-gray-200">{building.height}米</span>
          </div>
        )}
        {building.floors && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">层数</span>
            <span className="text-gray-200">{building.floors}层</span>
          </div>
        )}
        {building.district && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">所在区域</span>
            <span className="text-gray-200">{building.district}</span>
          </div>
        )}
      </div>

      {/* 简介 */}
      {building.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {building.description}
        </p>
      )}

      {/* 查看详情按钮 */}
      <button
        onClick={onViewDetail}
        className="w-full py-2 bg-[#e94560] text-white rounded-lg text-sm font-medium cursor-pointer border-none hover:bg-[#c0392b] transition-colors"
      >
        查看详细介绍 →
      </button>
    </div>
  );
}
