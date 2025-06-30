import React from 'react';

const Toolbar = ({ onSave, onExport }) => {
  return (
    <div className="flex items-center p-2 bg-gray-100 border-b border-gray-200">
      <button 
        onClick={onSave}
        className="px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Save
      </button>
      <button 
        onClick={onExport}
        className="px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Export
      </button>
      <div className="flex-grow" />
      <button 
        className="px-4 py-2 mx-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Invite
      </button>
    </div>
  );
};

export default Toolbar;