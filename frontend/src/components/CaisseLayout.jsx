import React from 'react';
import { Outlet } from 'react-router-dom';
import CaisseSidebar from './CaisseSidebar';

const CaisseLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CaisseSidebar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default CaisseLayout;