/**
 * Centralized route constants for the application
 * This ensures route consistency across components and makes refactoring safer
 */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard/index',
  calendar: '/calendar/index',
  tasks: '/tasks/index',
  subjects: '/subjects/index',
  planning: '/planning/index',
  analytics: '/analytics/index',
  achievements: '/achievements/index',
  pomodoro: '/pomodoro/index',
  search: '/search/index',
  settings: '/settings/index',
  setup: '/setup/index',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
