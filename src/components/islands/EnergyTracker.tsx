/**
 * Energy Tracking Component
 * 
 * Allows users to log their current energy level and see patterns over time
 */

import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, TrendingUp } from 'lucide-react';
import { BehavioralCollector } from '../../lib/intelligence/heuristicEngine';
import { useSettingsStore } from '../../lib/store/settingsStore';

const energyIcons = {
  1: BatteryLow,
  2: BatteryLow,
  3: BatteryMedium,
  4: BatteryCharging,
  5: BatteryFull,
};

const energyLabels = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very High',
};

const energyEmojis = {
  1: '😴',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🚀',
};

export const EnergyTracker: React.FC = () => {
  const { settings } = useSettingsStore();
  const [currentEnergy, setCurrentEnergy] = useState(3);
  const [energyHistory, setEnergyHistory] = useState<Array<{ time: Date; level: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [collector] = useState(() => new BehavioralCollector());

  useEffect(() => {
    // Load current energy from signals
    const signals = collector.getSignals();
    setCurrentEnergy(signals.currentEnergyLevel);
    
    // Load history (would be from signals in real implementation)
    loadHistory();
  }, []);

  const loadHistory = () => {
    // This would load from localStorage in real implementation
    const stored = localStorage.getItem('energy-history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEnergyHistory(parsed.map((item: any) => ({
          ...item,
          time: new Date(item.time),
        })));
      } catch (error) {
        console.error('Failed to load energy history:', error);
      }
    }
  };

  const saveHistory = (history: Array<{ time: Date; level: number }>) => {
    localStorage.setItem('energy-history', JSON.stringify(history));
  };

  const handleEnergyChange = (level: number) => {
    setCurrentEnergy(level);
    collector.updateEnergy(level);
    
    // Add to history
    const newHistory = [
      ...energyHistory,
      { time: new Date(), level },
    ].slice(-24); // Keep last 24 entries
    
    setEnergyHistory(newHistory);
    saveHistory(newHistory);
  };

  const getEnergyColor = (level: number): string => {
    if (level <= 2) return 'text-red-500';
    if (level === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getEnergyBgColor = (level: number): string => {
    if (level <= 2) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (level === 3) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  if (!settings.heuristicPrefs?.energyTrackingEnabled) {
    return null;
  }

  const scaleType = settings.heuristicPrefs.energyScale || 'numeric';
  const Icon = energyIcons[currentEnergy as keyof typeof energyIcons];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${getEnergyColor(currentEnergy)}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Energy Level
          </h3>
        </div>
        
        {energyHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{showHistory ? 'Hide' : 'Show'} Patterns</span>
          </button>
        )}
      </div>

      {/* Current Energy Display */}
      <div className={`border-2 rounded-lg p-4 mb-4 ${getEnergyBgColor(currentEnergy)}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {scaleType === 'emoji' ? energyEmojis[currentEnergy as keyof typeof energyEmojis] : currentEnergy}
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {scaleType === 'descriptive' 
              ? energyLabels[currentEnergy as keyof typeof energyLabels]
              : `Level ${currentEnergy}/5`
            }
          </div>
        </div>
      </div>

      {/* Energy Selector */}
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          How are you feeling right now?
        </label>
        
        {scaleType === 'emoji' ? (
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => handleEnergyChange(level)}
                className={`flex-1 py-3 rounded-lg text-2xl transition-all ${
                  currentEnergy === level
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {energyEmojis[level as keyof typeof energyEmojis]}
              </button>
            ))}
          </div>
        ) : scaleType === 'descriptive' ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => handleEnergyChange(level)}
                className={`w-full py-2 px-4 rounded-lg text-left transition-all ${
                  currentEnergy === level
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {energyLabels[level as keyof typeof energyLabels]}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min="1"
              max="5"
              value={currentEnergy}
              onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low</span>
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Very High</span>
            </div>
          </div>
        )}
      </div>

      {/* Energy History */}
      {showHistory && energyHistory.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Check-ins
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {energyHistory.slice(-10).reverse().map((entry, index) => {
              const EntryIcon = energyIcons[entry.level as keyof typeof energyIcons];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <EntryIcon className={`w-4 h-4 ${getEnergyColor(entry.level)}`} />
                    <span className="text-gray-600 dark:text-gray-400">
                      {energyLabels[entry.level as keyof typeof energyLabels]}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights Hint */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Your energy patterns help suggest the right tasks at the right time
      </div>
    </div>
  );
};

export default EnergyTracker;
