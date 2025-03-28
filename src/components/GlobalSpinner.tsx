import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

const GlobalSpinner: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default GlobalSpinner;
