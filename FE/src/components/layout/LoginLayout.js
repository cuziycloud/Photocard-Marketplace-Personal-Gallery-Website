import React from 'react';
import { Outlet } from 'react-router-dom'; 
const LoginLayout = () => {
  return (
    <div className="flex flex-col flex-grow items-center justify-center min-h-screen bg-slate-100">
      <Outlet />
    </div>
  );
};

export default LoginLayout;