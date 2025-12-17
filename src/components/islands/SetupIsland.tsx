import { useState } from 'react';
import { useSettingsStore } from '../../lib/store/settingsStore';
import { useSubjectStore } from '../../lib/store/subjectStore';
import { useTaskStore } from '../../lib/store/taskStore';
import { ROUTES } from '../../lib/config/routes';
import type { UserSettings } from '../../lib/types';

export default function SetupIsland() {
  const { settings, updateSettings } = useSettingsStore();
  const { addSubject } = useSubjectStore();
  const { addTask } = useTaskStore();
  
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<UserSettings['theme']>(settings.theme || 'auto');
  const [loadSampleData, setLoadSampleData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeSelect = (theme: UserSettings['theme']) => {
    setSelectedTheme(theme);
    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const loadSampleDataFunc = async () => {
    try {
      const response = await fetch('/sample-data/sample-tasks.json');
      const data = await response.json();
      
      // Process and add subjects
      if (data.subjects) {
        data.subjects.forEach((subject: any) => {
          addSubject({
            ...subject,
            createdAt: new Date(subject.createdAt),
          });
        });
      }
      
      // Process and add tasks
      if (data.tasks) {
        const now = new Date();
        data.tasks.forEach((task: any) => {
          // Parse date placeholders
          let dueDate = task.dueDate;
          if (dueDate.includes('{{futureDate:')) {
            const days = parseInt(dueDate.match(/\d+/)[0]);
            dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          }
          
          addTask({
            ...task,
            dueDate: new Date(dueDate),
            createdAt: new Date(task.createdAt === '{{now}}' ? now : task.createdAt),
            updatedAt: new Date(task.updatedAt === '{{now}}' ? now : task.updatedAt),
          });
        });
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  const completeSetup = async () => {
    setIsLoading(true);
    
    // Update settings
    updateSettings({
      theme: selectedTheme,
      firstRunComplete: true,
      analyticsEnabled: false, // Default to disabled, can be enabled in settings
    });
    
    // Load sample data if requested
    if (loadSampleData) {
      await loadSampleDataFunc();
    }
    
    // Small delay to ensure state is persisted
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to dashboard
    window.location.href = ROUTES.dashboard;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeSetup();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Homework Planner</h1>
          <p className="text-slate-600 dark:text-slate-400">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step
                    ? 'bg-brand-primary text-white'
                    : s < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s < step ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Step 1: Theme Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Choose Your Theme</h2>
                <p className="text-slate-600 dark:text-slate-400">Select your preferred color scheme</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleThemeSelect('light')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTheme === 'light'
                      ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-white border border-slate-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Light</p>
                </button>

                <button
                  onClick={() => handleThemeSelect('dark')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTheme === 'dark'
                      ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Dark</p>
                </button>

                <button
                  onClick={() => handleThemeSelect('auto')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTheme === 'auto'
                      ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r from-white to-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Auto</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Sample Data */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Load Sample Data</h2>
                <p className="text-slate-600 dark:text-slate-400">Start with example tasks and subjects to explore the app</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setLoadSampleData(true)}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    loadSampleData
                      ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Yes, load sample data</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        We'll add 3 sample subjects and tasks so you can explore features right away
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setLoadSampleData(false)}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    !loadSampleData
                      ? 'border-brand-primary bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No, start from scratch</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Begin with a clean slate and add your own subjects and tasks
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Privacy & Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Privacy First</h2>
                <p className="text-slate-600 dark:text-slate-400">Your data stays on your device, always</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Local Storage Only</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        All your data is stored locally in your browser. No cloud sync, no servers, no tracking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Export Anytime</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        You can export your data at any time from Settings. Your data, your control.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Backup Recommended</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remember to export your data periodically as a backup, especially before clearing browser data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <a
                href={ROUTES.home}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </a>
            )}

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </>
              ) : (
                <>
                  {step === 3 ? 'Complete Setup' : 'Next'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
