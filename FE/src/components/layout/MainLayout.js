import React from 'react';
import { Outlet } from 'react-router-dom'; 
import StickyHeaderLayout from './StickyHeaderLayout';

const MainLayout = () => {
  const navbarHeight = '4rem';
  let stickyHeaderHeightContribution = '0rem'; 

  const paddingTop = `calc(${navbarHeight} + ${stickyHeaderHeightContribution})`;

  return (
    <div className="bg-slate-100 flex flex-col flex-grow ">
      <StickyHeaderLayout />
      <main className="flex-grow bg-slate-100" style={{ paddingTop }}>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;