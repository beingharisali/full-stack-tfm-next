import React from 'react';

interface GlobalLoadingOverlayProps {
  loading: boolean;
  message?: string;
}

const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({ 
  loading, 
  message = 'Loading...' 
}) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;