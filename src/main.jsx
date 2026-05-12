import React from 'react';
import ReactDOM from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import App from './App';
import { I18nProvider } from './lib/i18n';
import './index.css';

// 注册 PMTiles 协议（Overture Maps 瓦片格式）
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
