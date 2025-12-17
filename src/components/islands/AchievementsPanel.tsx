import { useGamificationStore } from '../../lib/store/gamificationStore';
import { Trophy, Star } from 'lucide-react';

export function AchievementsPanel() {
  const { achievements, level, currentXP, nextLevelXP, stats } = useGamificationStore();

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-400 dark:border-yellow-500';
      case 'epic':
        return 'border-purple-400 dark:border-purple-500';
      case 'rare':
        return 'border-blue-400 dark:border-blue-500';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const categoryLabels = {
    tasks: 'Task Completion',
    streaks: 'Consistency',
    time: 'Focus Time',
    productivity: 'Productivity',
    social: 'Collaboration',
  };

  return (
    <div className="space-y-6">
      {/* Level & Progress */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Level {level}</h2>
            <p className="text-indigo-100">
              {currentXP} / {nextLevelXP} XP
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{unlockedCount}/{totalCount}</div>
            <p className="text-indigo-100 text-sm">Achievements</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full bg-indigo-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.tasksCompleted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.pomodorosCompleted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pomodoros</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.floor(stats.totalWorkMinutes / 60)}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Focus Time</div>
        </div>
      </div>

      {/* Achievements by Category */}
      {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            {categoryLabels[category as keyof typeof categoryLabels] || category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAchievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
              const progress = achievement.progress;
              const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

              return (
                <div
                  key={achievement.id}
                  className={`relative border-2 rounded-lg p-4 transition-all ${
                    isUnlocked
                      ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br ${getRarityColor(achievement.rarity)} bg-opacity-10`
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  {/* Rarity Badge */}
                  {isUnlocked && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{isUnlocked ? achievement.icon : '🔒'}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {achievement.description}
                      </p>

                      {!isUnlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progress.current} / {progress.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
