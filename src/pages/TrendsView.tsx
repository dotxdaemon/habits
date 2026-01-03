import { useState } from 'react';
import { useAppStore } from '../store';
import { calculateCompletionRate, getLast7Days, getShortDayName } from '../domain/streaks';
import { exportData, importData } from '../db/queries';

interface Props {
  onRefresh: () => Promise<void>;
}

export function TrendsView({ onRefresh }: Props) {
  const { habits, logs } = useAppStore();
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
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 py-3 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700"
        >
          Export Data
        </button>
        <button
          onClick={handleImport}
          className="flex-1 py-3 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700"
        >
          Import Data
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => {
          const completionRate = calculateCompletionRate(habit, logs, 30);
          const last7Days = getLast7Days(habit, logs);

          return (
            <div key={habit.id} className="bg-stone-800 p-4 rounded-lg border border-stone-700">
              <h3 className="text-lg font-semibold mb-2">{habit.name}</h3>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-400">30-day completion</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: completionRate + '%' }}
                  />
                </div>
              </div>

              <div className="flex gap-1">
                {last7Days.map((day) => (
                  <div key={day.dateKey} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-stone-500">{getShortDayName(day.dateKey).slice(0, 1)}</div>
                    <div
                      className={'w-full h-8 rounded ' + (
                        day.isComplete
                          ? 'bg-blue-600'
                          : day.isToday
                          ? 'border-2 border-blue-600 bg-transparent'
                          : 'bg-stone-700'
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            No habits to show. Add some from the Today tab!
          </div>
        )}
      </div>

      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-800 rounded-lg p-6 max-w-2xl w-full border border-stone-700">
            <h2 className="text-xl font-bold mb-4">Export Data</h2>
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
