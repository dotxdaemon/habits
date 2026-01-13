// ABOUTME: Provides data management actions such as export and import.
// ABOUTME: Uses modal overlays for sharing habit and log data safely.
import { useState } from 'react';
import { exportData, importData } from '../db/queries';
import { Card } from '../components/Card';
import { IconButton } from '../components/IconButton';
import { Mascot } from '../components/Mascot';
import { ThemeToggle } from '../components/ThemeToggle';

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
    } catch {
      alert('Failed to import data. Please check the JSON format.');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-section mb-3">Data</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="button button--ghost flex-1"
          >
            Export Data
          </button>
          <button
            onClick={handleImport}
            className="button button--primary flex-1"
          >
            Import Data
          </button>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-section">Appearance</h2>
            <p className="text-xs text-muted">Tune the look without changing behavior.</p>
          </div>
          <Mascot className="h-12 w-12" />
        </div>
        <ThemeToggle />
      </Card>

      {showExport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-2xl w-full">
            <h2 className="text-title mb-4">Export Data</h2>
            <textarea
              value={exportJson}
              readOnly
              className="input w-full h-64 font-mono text-sm"
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
