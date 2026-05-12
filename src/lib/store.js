import { create } from 'zustand';

const useStore = create((set) => ({
  // 当前选择的时间时期
  currentPeriod: 'present',

  // 设置时期
  setPeriod: (period) => set({ currentPeriod: period }),

  // 当前选中的建筑（点击建筑后设置）
  selectedBuilding: null,

  // 设置选中建筑
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),

  // 清除选中
  clearSelection: () => set({ selectedBuilding: null }),
}));

export default useStore;
