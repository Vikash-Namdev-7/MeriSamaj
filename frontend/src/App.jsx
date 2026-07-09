import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MemberRoutes } from './modules/member/routes/MemberRoutes';
import AdminRoutes from './modules/admin/routes/AdminRoutes';
import HeadRoutes from './modules/head/routes/HeadRoutes';
import { DataProvider } from './modules/member/context/DataProvider';
import { FundProvider } from './modules/member/context/FundContext';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
  return (
    <DataProvider>
      <FundProvider>
        <div className="desktop-wrapper">
          <div className="app-container bg-transparent">
          <div className="aura-bg" />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Default entry → splash screen for onboarding demo */}
              <Route path="/" element={<Navigate to="/member/splash" replace />} />
              
              {/* Route all /member/* requests to MemberRoutes */}
              <Route path="/member/*" element={<MemberRoutes />} />

              {/* Route all /admin/* requests to AdminRoutes */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Route all /head/* requests to HeadRoutes */}
              <Route path="/head/*" element={<HeadRoutes />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
      </FundProvider>
    </DataProvider>
  );
};

export default App;