/**
 * Centralized route constants for the application
 * This ensures route consistency across components and makes refactoring safer
 */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard/index.html',
  calendar: '/calendar/index.html',
  tasks: '/tasks/index.html',
  subjects: '/subjects/index.html',
  planning: '/planning/index.html',
  analytics: '/analytics/index.html',
  achievements: '/achievements/index.html',
  pomodoro: '/pomodoro/index.html',
  search: '/search/index.html',
  settings: '/settings/index.html',
  setup: '/setup/index.html',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
