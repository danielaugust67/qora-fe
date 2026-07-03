import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

export const AuthLayout = () => {
  const token = useAuthStore((state) => state.token);

  // If user is already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <Outlet />
    </div>
  );
};
