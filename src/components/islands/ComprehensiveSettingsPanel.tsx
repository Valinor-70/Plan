/**
 * Comprehensive Settings Panel
 * 
 * Hierarchical settings interface with all personalization options
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Sliders, 
  Brain, 
  Palette, 
  Download, 
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useSettingsStore } from '../../lib/store/settingsStore';
import type { 
  NotificationPreferences,
  TaskManagementPreferences,
  HeuristicPreferences,
  DisplayPreferences,
} from '../../lib/store/settingsStore';

type SettingsSection = 'notifications' | 'tasks' | 'intelligence' | 'display' | 'data';

export const ComprehensiveSettingsPanel: React.FC = () => {
  const { settings, updateNotificationPrefs, updateTaskManagementPrefs, updateHeuristicPrefs, updateDisplayPrefs, exportSettings, importSettings, resetSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('notifications');
  const [expandedAdvanced, setExpandedAdvanced] = useState<string[]>([]);

  const toggleAdvanced = (key: string) => {
    setExpandedAdvanced(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importSettings(text);
        if (success) {
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
    }
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tasks', label: 'Task Management', icon: Sliders },
    { id: 'intelligence', label: 'Intelligence System', icon: Brain },
    { id: 'display', label: 'Display & Experience', icon: Palette },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your experience
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-2">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as SettingsSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="col-span-9 bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
          {activeSection === 'notifications' && (
            <NotificationSettings
              prefs={settings.notificationPrefs}
              updatePrefs={updateNotificationPrefs}
              expanded={expandedAdvanced}
              toggleAdvanced={toggleAdvanced}
            />
          )}
          
          {activeSection === 'tasks' && (
            <TaskManagementSettings
              prefs={settings.taskManagementPrefs}
              updatePrefs={updateTaskManagementPrefs}
              expanded={expandedAdvanced}
              toggleAdvanced={toggleAdvanced}
            />
          )}
          
          {activeSection === 'intelligence' && (
            <IntelligenceSettings
              prefs={settings.heuristicPrefs}
              updatePrefs={updateHeuristicPrefs}
              expanded={expandedAdvanced}
              toggleAdvanced={toggleAdvanced}
            />
          )}
          
          {activeSection === 'display' && (
            <DisplaySettings
              prefs={settings.displayPrefs}
              updatePrefs={updateDisplayPrefs}
              expanded={expandedAdvanced}
              toggleAdvanced={toggleAdvanced}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Settings Sections

const NotificationSettings: React.FC<{
  prefs?: NotificationPreferences;
  updatePrefs: (updates: Partial<NotificationPreferences>) => void;
  expanded: string[];
  toggleAdvanced: (key: string) => void;
}> = ({ prefs, updatePrefs, expanded, toggleAdvanced }) => {
  if (!prefs) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>

      {/* Basic Settings */}
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Enable Notifications</span>
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => updatePrefs({ enabled: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Notification Sound</span>
          <input
            type="checkbox"
            checked={prefs.sound}
            onChange={(e) => updatePrefs({ sound: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Frequency Mode
          </label>
          <select
            value={prefs.frequency}
            onChange={(e) => updatePrefs({ frequency: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <option value="aggressive">Aggressive - Maximum suggestions</option>
            <option value="moderate">Moderate - Balanced approach</option>
            <option value="minimal">Minimal - Critical only</option>
            <option value="custom">Custom - Manual control</option>
          </select>
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <button
          onClick={() => toggleAdvanced('quiet-hours')}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
        >
          {expanded.includes('quiet-hours') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>Quiet Hours</span>
        </button>
        
        {expanded.includes('quiet-hours') && (
          <div className="mt-4 pl-6 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Enable Quiet Hours</span>
              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => updatePrefs({ quietHoursEnabled: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </label>

            {prefs.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => updatePrefs({ quietHoursStart: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => updatePrefs({ quietHoursEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekend Strategy */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Weekend Notification Strategy
        </label>
        <select
          value={prefs.weekendStrategy}
          onChange={(e) => updatePrefs({ weekendStrategy: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="same">Same as weekdays</option>
          <option value="reduced">Reduced frequency</option>
          <option value="off">Notifications off</option>
        </select>
      </div>
    </div>
  );
};

const TaskManagementSettings: React.FC<{
  prefs?: TaskManagementPreferences;
  updatePrefs: (updates: Partial<TaskManagementPreferences>) => void;
  expanded: string[];
  toggleAdvanced: (key: string) => void;
}> = ({ prefs, updatePrefs }) => {
  if (!prefs) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h2>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Default Task Duration (minutes)
        </label>
        <input
          type="number"
          value={prefs.defaultTaskDuration}
          onChange={(e) => updatePrefs({ defaultTaskDuration: parseInt(e.target.value) })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          min="5"
          max="480"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Default Priority
        </label>
        <select
          value={prefs.defaultPriority}
          onChange={(e) => updatePrefs({ defaultPriority: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Task View Preference
        </label>
        <select
          value={prefs.taskViewPreference}
          onChange={(e) => updatePrefs({ taskViewPreference: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="list">List</option>
          <option value="kanban">Kanban Board</option>
          <option value="calendar">Calendar</option>
          <option value="timeline">Timeline</option>
        </select>
      </div>

      <label className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Enable Auto-Scheduling</span>
        <input
          type="checkbox"
          checked={prefs.autoSchedulingEnabled}
          onChange={(e) => updatePrefs({ autoSchedulingEnabled: e.target.checked })}
          className="w-5 h-5 rounded"
        />
      </label>

      {prefs.autoSchedulingEnabled && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Auto-Scheduling Aggressiveness
          </label>
          <select
            value={prefs.autoSchedulingAggressiveness}
            onChange={(e) => updatePrefs({ autoSchedulingAggressiveness: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <option value="low">Low - Suggest only</option>
            <option value="medium">Medium - Schedule when appropriate</option>
            <option value="high">High - Schedule everything</option>
          </select>
        </div>
      )}

      <label className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Require Completion Confirmation</span>
        <input
          type="checkbox"
          checked={prefs.completionConfirmation}
          onChange={(e) => updatePrefs({ completionConfirmation: e.target.checked })}
          className="w-5 h-5 rounded"
        />
      </label>
    </div>
  );
};

const IntelligenceSettings: React.FC<{
  prefs?: HeuristicPreferences;
  updatePrefs: (updates: Partial<HeuristicPreferences>) => void;
  expanded: string[];
  toggleAdvanced: (key: string) => void;
}> = ({ prefs, updatePrefs }) => {
  if (!prefs) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Intelligence System</h2>

      <label className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Enable Smart Suggestions</span>
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={(e) => updatePrefs({ enabled: e.target.checked })}
          className="w-5 h-5 rounded"
        />
      </label>

      {prefs.enabled && (
        <>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Motivation Style
            </label>
            <select
              value={prefs.motivationStyle}
              onChange={(e) => updatePrefs({ motivationStyle: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <option value="encouraging">Encouraging - Positive reinforcement</option>
              <option value="neutral">Neutral - Data-driven, factual</option>
              <option value="challenging">Challenging - Push for excellence</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Suggestion Frequency: {prefs.suggestionFrequency}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={prefs.suggestionFrequency}
              onChange={(e) => updatePrefs({ suggestionFrequency: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Once per day</span>
              <span>Multiple per hour</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Confidence Threshold: {Math.round(prefs.confidenceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={prefs.confidenceThreshold}
              onChange={(e) => updatePrefs({ confidenceThreshold: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Enable Surprise Achievements</span>
            <input
              type="checkbox"
              checked={prefs.surpriseFactorEnabled}
              onChange={(e) => updatePrefs({ surpriseFactorEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Proactive Mode</span>
            <input
              type="checkbox"
              checked={prefs.proactiveMode}
              onChange={(e) => updatePrefs({ proactiveMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Enable Energy Tracking</span>
            <input
              type="checkbox"
              checked={prefs.energyTrackingEnabled}
              onChange={(e) => updatePrefs({ energyTrackingEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>

          {prefs.energyTrackingEnabled && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Energy Check-in Frequency
              </label>
              <select
                value={prefs.energyCheckInFrequency}
                onChange={(e) => updatePrefs({ energyCheckInFrequency: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <option value="hourly">Every hour</option>
                <option value="every-3-hours">Every 3 hours</option>
                <option value="daily">Once per day</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
          )}

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Adaptive Learning</span>
            <input
              type="checkbox"
              checked={prefs.adaptiveWeightsEnabled}
              onChange={(e) => updatePrefs({ adaptiveWeightsEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Show Learning Transparency</span>
            <input
              type="checkbox"
              checked={prefs.showLearningTransparency}
              onChange={(e) => updatePrefs({ showLearningTransparency: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
        </>
      )}
    </div>
  );
};

const DisplaySettings: React.FC<{
  prefs?: DisplayPreferences;
  updatePrefs: (updates: Partial<DisplayPreferences>) => void;
  expanded: string[];
  toggleAdvanced: (key: string) => void;
}> = ({ prefs, updatePrefs }) => {
  if (!prefs) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Display & Experience</h2>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Theme</label>
        <select
          value={prefs.theme}
          onChange={(e) => updatePrefs({ theme: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (system)</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Accent Color
        </label>
        <input
          type="color"
          value={prefs.accentColor}
          onChange={(e) => updatePrefs({ accentColor: e.target.value })}
          className="w-full h-12 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Typography Scale
        </label>
        <select
          value={prefs.typographyScale}
          onChange={(e) => updatePrefs({ typographyScale: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Animation Intensity
        </label>
        <select
          value={prefs.animationIntensity}
          onChange={(e) => updatePrefs({ animationIntensity: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="full">Full animations</option>
          <option value="reduced">Reduced motion</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Density
        </label>
        <select
          value={prefs.density}
          onChange={(e) => updatePrefs({ density: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Date Format
        </label>
        <select
          value={prefs.dateFormat}
          onChange={(e) => updatePrefs({ dateFormat: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Time Format
        </label>
        <select
          value={prefs.timeFormat}
          onChange={(e) => updatePrefs({ timeFormat: e.target.value as any })}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <option value="12h">12-hour</option>
          <option value="24h">24-hour</option>
        </select>
      </div>
    </div>
  );
};

export default ComprehensiveSettingsPanel;
