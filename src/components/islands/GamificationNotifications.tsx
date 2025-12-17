import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, X, Star } from 'lucide-react';
import type { Achievement } from '../../lib/types/gamification';

interface LevelUpNotificationProps {
  onClose: () => void;
  level: number;
  xpGained: number;
}

export function LevelUpNotification({ onClose, level, xpGained }: LevelUpNotificationProps) {
  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 text-center relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Level Up!
        </h2>
        
        <div className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Level {level}
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You've earned <span className="font-semibold text-indigo-600 dark:text-indigo-400">{xpGained} XP</span> and reached a new level!
        </p>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    // Trigger confetti for achievements
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4'],
    });
  }, []);

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

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 text-center relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center text-4xl`}>
            {achievement.icon}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className={`text-sm font-semibold bg-gradient-to-r ${getRarityColor(achievement.rarity)} bg-clip-text text-transparent uppercase`}>
            {getRarityLabel(achievement.rarity)}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Achievement Unlocked!
        </h2>
        
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {achievement.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {achievement.description}
        </p>

        <button
          onClick={onClose}
          className={`w-full px-6 py-3 bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
