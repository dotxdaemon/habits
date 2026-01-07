// ABOUTME: Provides data management actions such as export and import.
// ABOUTME: Uses modal overlays for sharing habit and log data safely.
import { useState } from 'react';
import { exportData, importData } from '../db/queries';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';

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
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-slate-50">Data</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-3 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 text-slate-100 hover:bg-white/10 transition font-semibold"
          >
            Export Data
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-3 rounded-xl bg-blue-600 ring-1 ring-blue-500 text-white hover:bg-blue-500 transition font-semibold"
          >
            Import Data
          </button>
        </div>
      </Card>

      {showExport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-50">Export Data</h2>
            <textarea
              value={exportJson}
              readOnly
              className="w-full h-64 p-3 bg-white/5 ring-1 ring-inset ring-white/10 rounded-xl font-mono text-sm text-slate-100"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2 mt-4">
              <IconButton
                variant="primary"
                className="flex-1 rounded-xl h-12"
                aria-label="Copy export"
                onClick={() => {
                  navigator.clipboard.writeText(exportJson);
                  alert('Copied to clipboard!');
                }}
              >
                Copy
              </IconButton>
              <IconButton
                variant="ghost"
                className="flex-1 rounded-xl h-12"
                aria-label="Close export"
                onClick={() => setShowExport(false)}
              >
                Close
              </IconButton>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
