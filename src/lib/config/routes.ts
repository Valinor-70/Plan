/**
 * Centralized route constants for the application
 * This ensures route consistency across components and makes refactoring safer
 */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  calendar: '/calendar',
  tasks: '/tasks',
  subjects: '/subjects',
  analytics: '/analytics',
  pomodoro: '/pomodoro',
  settings: '/settings',
  setup: '/setup',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
