// ABOUTME: Provides data management actions such as export and import.
// ABOUTME: Uses modal overlays for sharing habit and log data safely.
import { useState } from 'react';
import { exportData, importData } from '../db/queries';

interface Props {
  onRefresh: () => Promise<void>;
}

export function SettingsView({ onRefresh }: Props) {
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState('');

  const handleExport = async () => {
    const data = await exportData();
    const json = JSON.stringify(data, null, 2);
    setExportJson(json);
    setShowExport(true);
  };

  const handleImport = async () => {
    const input = prompt('Paste your export JSON:');
    if (!input) return;

    try {
      const data = JSON.parse(input);
      await importData(data, 'replace');
      alert('Data imported successfully!');
      await onRefresh();
    } catch (error) {
      alert('Failed to import data. Please check the JSON format.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-stone-800 border border-stone-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-stone-50">Data</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-3 bg-stone-900 border border-stone-700 rounded-lg hover:border-stone-500"
          >
            Export Data
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-3 bg-stone-900 border border-stone-700 rounded-lg hover:border-stone-500"
          >
            Import Data
          </button>
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-800 rounded-lg p-6 max-w-2xl w-full border border-stone-700">
            <h2 className="text-xl font-bold mb-4 text-stone-50">Export Data</h2>
            <textarea
              value={exportJson}
              readOnly
              className="w-full h-64 p-3 bg-stone-900 border border-stone-700 rounded font-mono text-sm text-stone-300"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportJson);
                  alert('Copied to clipboard!');
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 py-2 bg-stone-700 rounded hover:bg-stone-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
