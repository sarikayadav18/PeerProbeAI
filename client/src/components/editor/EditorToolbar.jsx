import React from 'react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

const EditorToolbar = ({ 
  language, 
  onLanguageChange,
  connectionStatus 
}) => {
  const handleLanguageSelect = (e) => {
    onLanguageChange(e.target.value);
  };

  return (
    <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <select 
          value={language} 
          onChange={handleLanguageSelect}
          className="bg-gray-800 text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm cursor-pointer hover:bg-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-gray-800">
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1.5 text-sm ${
          connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'
        }`}>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;