import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapViewer from '../features/map/MapViewer';
import TimelineControl from '../features/timeline/TimelineControl';
import BuildingInfoCard from '../features/map/BuildingInfoCard';
import useStore from '../lib/store';

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
      {/* 3D 地图 */}
      <MapViewer onBuildingClick={handleBuildingClick} />

      {/* 建筑信息浮窗 */}
      {selectedBuilding && (
        <BuildingInfoCard
          building={selectedBuilding}
          onClose={handleCloseCard}
          onViewDetail={() => handleViewDetail(selectedBuilding.id)}
        />
      )}

      {/* 时间轴 */}
      <TimelineControl />
    </div>
  );
}
