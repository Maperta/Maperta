import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BuildingDetailPage from './pages/BuildingDetailPage';
import OverviewPage from './pages/OverviewPage';
import SystemPage from './pages/SystemPage';
import DistrictListPage from './pages/DistrictListPage';
import DistrictDetailPage from './pages/DistrictDetailPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminEditorPage from './pages/AdminEditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/building/:id" element={<BuildingDetailPage />} />
          <Route path="/shenzhen/overview" element={<OverviewPage />} />
          <Route path="/shenzhen/:system" element={<SystemPage />} />
          <Route path="/districts" element={<DistrictListPage />} />
          <Route path="/districts/:slug" element={<DistrictDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/editor" element={<AdminEditorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
