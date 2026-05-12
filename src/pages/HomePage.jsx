import { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../lib/store';

// ★ 懒加载地图组件（减少首屏加载时间）
const MapViewer = lazy(() => import('../features/map/MapViewer'));
const TimelineControl = lazy(() => import('../features/timeline/TimelineControl'));
const BuildingInfoCard = lazy(() => import('../features/map/BuildingInfoCard'));

export default function HomePage() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const setGlobalBuilding = useStore((s) => s.setSelectedBuilding);
  const navigate = useNavigate();

  const handleBuildingClick = useCallback((building) => {
    setSelectedBuilding(building);
    setGlobalBuilding(building);
  }, [setGlobalBuilding]);

  const handleCloseCard = useCallback(() => {
    setSelectedBuilding(null);
    useStore.getState().clearSelection();
  }, []);

  const handleViewDetail = useCallback((id) => {
    navigate(`/building/${id}`);
  }, [navigate]);

  return (
    <div className="h-full w-full relative">
      {/* 地图区域 - 带 loading */}
      <Suspense
        fallback={
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#0f0f1a] gap-4">
            <div className="w-12 h-12 border-4 border-[#e94560]/30 border-t-[#e94560] rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">地图加载中...</p>
          </div>
        }
      >
        <MapViewer onBuildingClick={handleBuildingClick} />
      </Suspense>

      {/* 建筑信息浮窗 */}
      {selectedBuilding && (
        <Suspense fallback={null}>
          <BuildingInfoCard
            building={selectedBuilding}
            onClose={handleCloseCard}
            onViewDetail={() => handleViewDetail(selectedBuilding.id)}
          />
        </Suspense>
      )}

      {/* 时间轴 */}
      <Suspense fallback={null}>
        <TimelineControl />
      </Suspense>
    </div>
  );
}
